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
import { GradeRequestSchema, validateRequest } from "@/lib/validations";

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

    // Parse and validate request body with Zod
    const body = await request.json();
    const validation = validateRequest(GradeRequestSchema, body);

    if (!validation.success) {
      logger.security("input.validation_failed", {
        userId: session.user.id,
        ...reqContext,
        message: "Schema validation failed for grading",
        metadata: { error: validation.error },
      });
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const { question, correctAnswer, userAnswer, questionType, provider } =
      validation.data;

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
