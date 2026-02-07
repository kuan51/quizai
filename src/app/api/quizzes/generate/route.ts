import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizzes, questions } from "@/lib/db/schema";
import { generateQuiz } from "@/lib/ai";
import { logger, getRequestContext } from "@/lib/logger";
import {
  checkRateLimit,
  getRateLimitHeaders,
  rateLimitedResponse,
} from "@/lib/rate-limit";
import {
  GenerateQuizRequestSchema,
  validateRequest,
} from "@/lib/validations";
import type { QuestionType } from "@/types";

// POST /api/quizzes/generate - Generate a quiz using AI
export async function POST(request: Request) {
  const reqContext = getRequestContext(request);

  try {
    const session = await auth();
    if (!session?.user?.id) {
      logger.security("api.access", {
        ...reqContext,
        statusCode: 401,
        message: "Unauthorized access attempt",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting for AI generation (expensive operation)
    const rateLimit = checkRateLimit(session.user.id, "aiGeneration");
    if (!rateLimit.allowed) {
      return rateLimitedResponse(rateLimit);
    }

    // Parse and validate request body with Zod
    const body = await request.json();
    const validation = validateRequest(GenerateQuizRequestSchema, body);

    if (!validation.success) {
      logger.security("input.validation_failed", {
        userId: session.user.id,
        ...reqContext,
        message: "Schema validation failed",
        metadata: { error: validation.error },
      });
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const { title, studyMaterial, questionCount, difficulty, questionTypes } =
      validation.data;

    logger.security("api.access", {
      userId: session.user.id,
      ...reqContext,
      message: "Quiz generation started",
    });

    // Generate quiz using AI (with sanitization and validation)
    const generatedQuiz = await generateQuiz(
      {
        studyMaterial,
        questionCount,
        difficulty,
        questionTypes,
      },
      undefined,
      session.user.id
    );

    // Create quiz and questions in a single transaction (atomicity + single fsync)
    const quizId = crypto.randomUUID();
    const questionInserts = generatedQuiz.questions.map((q, index) => ({
      id: crypto.randomUUID(),
      quizId,
      type: q.type as QuestionType,
      content: q.content,
      options: q.options ? JSON.stringify(q.options) : null,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      order: index + 1,
    }));

    await db().transaction(async (tx) => {
      await tx.insert(quizzes).values({
        id: quizId,
        userId: session.user.id,
        title: title || generatedQuiz.title,
        description: `AI-generated quiz from study material`,
        questionCount: generatedQuiz.questions.length,
        difficulty,
        questionTypes: JSON.stringify(questionTypes),
        studyMaterial: studyMaterial.substring(0, 10000),
        currentDifficultyScore: 0.5,
      });
      await tx.insert(questions).values(questionInserts);
    });

    logger.audit("quiz.create", {
      userId: session.user.id,
      resourceType: "quiz",
      resourceId: quizId,
      changes: {
        questionCount: generatedQuiz.questions.length,
        difficulty,
      },
    });

    // Return the created quiz
    return NextResponse.json(
      {
        id: quizId,
        title: title || generatedQuiz.title,
        questionCount: generatedQuiz.questions.length,
        difficulty,
      },
      { status: 201, headers: getRateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    logger.security("api.error", {
      ...reqContext,
      message: "Quiz generation failed",
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
        cause: error instanceof Error && error.cause instanceof Error
          ? error.cause.message
          : undefined,
      },
    });

    // Don't expose internal error details to client
    return NextResponse.json(
      { error: "Failed to generate quiz. Please try again." },
      { status: 500 }
    );
  }
}
