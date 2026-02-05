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
import type { Difficulty, QuestionType } from "@/types";

interface GenerateRequest {
  title: string;
  studyMaterial: string;
  questionCount: number;
  difficulty: Difficulty;
  questionTypes: QuestionType[];
}

// Valid difficulty and question type values for validation
const VALID_DIFFICULTIES: Difficulty[] = [
  "mercy_mode",
  "mental_warfare",
  "abandon_all_hope",
];
const VALID_QUESTION_TYPES: QuestionType[] = [
  "multiple_choice",
  "essay",
  "short_answer",
  "true_false",
  "select_all",
];

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

    const body: GenerateRequest = await request.json();
    const { title, studyMaterial, questionCount, difficulty, questionTypes } =
      body;

    // Enhanced validation with type checking
    if (
      !title ||
      !studyMaterial ||
      !questionCount ||
      !difficulty ||
      !questionTypes
    ) {
      logger.security("input.validation_failed", {
        userId: session.user.id,
        ...reqContext,
        message: "Missing required fields",
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Validate difficulty is a valid enum value
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      logger.security("input.validation_failed", {
        userId: session.user.id,
        ...reqContext,
        message: "Invalid difficulty value",
      });
      return NextResponse.json(
        { error: "Invalid difficulty value" },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Validate question types are valid enum values
    if (
      !Array.isArray(questionTypes) ||
      !questionTypes.every((t) => VALID_QUESTION_TYPES.includes(t))
    ) {
      logger.security("input.validation_failed", {
        userId: session.user.id,
        ...reqContext,
        message: "Invalid question types",
      });
      return NextResponse.json(
        { error: "Invalid question types" },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    if (questionCount < 5 || questionCount > 50) {
      return NextResponse.json(
        { error: "Question count must be between 5 and 50" },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    if (questionTypes.length === 0) {
      return NextResponse.json(
        { error: "At least one question type must be selected" },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    if (studyMaterial.length < 50) {
      return NextResponse.json(
        { error: "Study material must be at least 50 characters" },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Limit study material length
    if (studyMaterial.length > 100000) {
      return NextResponse.json(
        { error: "Study material exceeds maximum length of 100,000 characters" },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

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

    // Create quiz in database
    const quizId = crypto.randomUUID();
    await db().insert(quizzes).values({
      id: quizId,
      userId: session.user.id,
      title: title || generatedQuiz.title,
      description: `AI-generated quiz from study material`,
      questionCount: generatedQuiz.questions.length,
      difficulty,
      questionTypes: JSON.stringify(questionTypes),
      studyMaterial: studyMaterial.substring(0, 10000), // Limit stored material
      currentDifficultyScore: 0.5,
    });

    // Insert questions
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

    await db().insert(questions).values(questionInserts);

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
      },
    });

    // Don't expose internal error details to client
    return NextResponse.json(
      { error: "Failed to generate quiz. Please try again." },
      { status: 500 }
    );
  }
}
