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
  GenerateQuizFromFilesSchema,
  validateRequest,
} from "@/lib/validations";
import { extractTextFromFiles, validateFileBatch } from "@/lib/file-extraction";
import type { QuestionType } from "@/types";

// Allow longer execution for file extraction + AI generation
export const maxDuration = 120;

// POST /api/quizzes/generate-from-files - Generate a quiz from uploaded files
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

    // Rate limiting for file uploads (more expensive than text-only generation)
    const rateLimit = checkRateLimit(session.user.id, "fileUpload");
    if (!rateLimit.allowed) {
      return rateLimitedResponse(rateLimit);
    }

    // Parse FormData
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Validate non-file fields
    const fields = {
      title: formData.get("title"),
      questionCount: formData.get("questionCount"),
      difficulty: formData.get("difficulty"),
      questionTypes: formData.get("questionTypes"),
    };

    const validation = validateRequest(GenerateQuizFromFilesSchema, fields);
    if (!validation.success) {
      logger.security("input.validation_failed", {
        userId: session.user.id,
        ...reqContext,
        message: "Schema validation failed for file upload",
        metadata: { error: validation.error },
      });
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const { title, questionCount, difficulty, questionTypes } = validation.data;

    // Extract files from FormData
    const files = formData.getAll("files").filter(
      (entry): entry is File => entry instanceof File
    );

    // Validate file batch (count, aggregate size, image count)
    const batchValidation = validateFileBatch(files, session.user.id);
    if (!batchValidation.valid) {
      return NextResponse.json(
        { error: batchValidation.error },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Enforce per-file size limits (server-side, since client checks are bypassable)
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds 10 MB limit` },
          { status: 413, headers: getRateLimitHeaders(rateLimit) }
        );
      }
    }

    logger.security("api.access", {
      userId: session.user.id,
      ...reqContext,
      message: "File-based quiz generation started",
      metadata: {
        fileCount: files.length,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
      },
    });

    // Extract text from all files sequentially
    const extraction = await extractTextFromFiles(files, {
      aiProvider: undefined, // Use default provider
      userId: session.user.id,
    });

    // Check if we got enough text to generate a quiz
    if (extraction.successCount === 0) {
      const reasons = extraction.failures
        .map((f) => `${f.fileName}: ${f.reason}`)
        .join("; ");
      return NextResponse.json(
        { error: `Could not extract text from any file. ${reasons}` },
        { status: 422, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    if (extraction.totalCharacters < 50) {
      return NextResponse.json(
        {
          error:
            "Extracted text is too short to generate a quiz (minimum 50 characters). Try uploading files with more content.",
        },
        { status: 422, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Generate quiz using the existing AI pipeline
    const generatedQuiz = await generateQuiz(
      {
        studyMaterial: extraction.text,
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
        description: `AI-generated quiz from ${files.length} uploaded file(s)`,
        questionCount: generatedQuiz.questions.length,
        difficulty,
        questionTypes: JSON.stringify(questionTypes),
        studyMaterial: extraction.text.substring(0, 10000),
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
        source: "file_upload",
        filesProcessed: extraction.successCount,
        filesFailed: extraction.failureCount,
      },
    });

    // Build response with optional warnings for partial failures
    const response: Record<string, unknown> = {
      id: quizId,
      title: title || generatedQuiz.title,
      questionCount: generatedQuiz.questions.length,
      difficulty,
    };

    if (extraction.failureCount > 0) {
      response.warnings = extraction.failures.map(
        (f) => `${f.fileName}: ${f.reason}`
      );
    }

    return NextResponse.json(response, {
      status: 201,
      headers: getRateLimitHeaders(rateLimit),
    });
  } catch (error) {
    logger.security("api.error", {
      ...reqContext,
      message: "File-based quiz generation failed",
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
        cause: error instanceof Error && error.cause instanceof Error
          ? error.cause.message
          : undefined,
      },
    });

    return NextResponse.json(
      { error: "Failed to generate quiz from files. Please try again." },
      { status: 500 }
    );
  }
}
