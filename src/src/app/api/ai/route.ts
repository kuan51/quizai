import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { gradeWithAnthropic } from "@/lib/ai/anthropic";
import { gradeWithOpenAI } from "@/lib/ai/openai";
import { logger, getRequestContext } from "@/lib/logger";
import { sanitizeForPrompt } from "@/lib/sanitize";
import {
  checkRateLimit,
  getRateLimitHeaders,
  rateLimitedResponse,
} from "@/lib/rate-limit";

interface GradeRequest {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  questionType: "essay" | "short_answer";
  provider?: "openai" | "anthropic";
}

// POST /api/ai - Grade essay/short answer questions
export async function POST(request: Request) {
  const reqContext = getRequestContext(request);

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting for AI grading
    const rateLimit = checkRateLimit(session.user.id, "aiGrading");
    if (!rateLimit.allowed) {
      return rateLimitedResponse(rateLimit);
    }

    const body: GradeRequest = await request.json();
    const { question, correctAnswer, userAnswer, questionType, provider } =
      body;

    // Validation
    if (!question || !correctAnswer || !userAnswer || !questionType) {
      logger.security("input.validation_failed", {
        userId: session.user.id,
        ...reqContext,
        message: "Missing required fields for grading",
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    if (!["essay", "short_answer"].includes(questionType)) {
      return NextResponse.json(
        { error: "Invalid question type for AI grading" },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Input length validation
    if (userAnswer.length > 10000) {
      return NextResponse.json(
        { error: "Answer exceeds maximum length" },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Sanitize user answer to prevent prompt injection
    const sanitizedAnswer = sanitizeForPrompt(userAnswer, {
      maxLength: 10000,
      userId: session.user.id,
    });

    logger.security("ai.request", {
      userId: session.user.id,
      ...reqContext,
      message: "AI grading requested",
      metadata: {
        questionType,
        provider: provider || "anthropic",
        inputSanitized: sanitizedAnswer.wasModified,
      },
    });

    // Determine provider
    const selectedProvider =
      provider || process.env.DEFAULT_AI_PROVIDER || "anthropic";

    // Grade with selected provider (using sanitized answer)
    let result;
    if (selectedProvider === "openai") {
      result = await gradeWithOpenAI(
        question,
        correctAnswer,
        sanitizedAnswer.text,
        questionType
      );
    } else {
      result = await gradeWithAnthropic(
        question,
        correctAnswer,
        sanitizedAnswer.text,
        questionType
      );
    }

    return NextResponse.json(result, {
      headers: getRateLimitHeaders(rateLimit),
    });
  } catch (error) {
    logger.error({ error, ...reqContext }, "Error grading answer");
    return NextResponse.json(
      { error: "Failed to grade answer" },
      { status: 500 }
    );
  }
}
