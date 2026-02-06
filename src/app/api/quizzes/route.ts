import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizzes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { logger } from "@/lib/logger";
import {
  checkRateLimit,
  getRateLimitHeaders,
  rateLimitedResponse,
} from "@/lib/rate-limit";
import { CreateQuizRequestSchema, validateRequest } from "@/lib/validations";

// GET /api/quizzes - List all quizzes for the current user
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = checkRateLimit(session.user.id, "api");
    if (!rateLimit.allowed) {
      return rateLimitedResponse(rateLimit);
    }

    // Pagination parameters with safe defaults
    const url = new URL(request.url);
    const page = Math.min(1000, Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10) || 20));
    const offset = (page - 1) * limit;

    const userQuizzes = await db()
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        questionCount: quizzes.questionCount,
        difficulty: quizzes.difficulty,
        createdAt: quizzes.createdAt,
      })
      .from(quizzes)
      .where(eq(quizzes.userId, session.user.id))
      .orderBy(desc(quizzes.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(
      { data: userQuizzes, page, limit },
      { headers: getRateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    logger.error({ error }, "Error fetching quizzes");
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

// POST /api/quizzes - Create a new quiz manually (without AI generation)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = checkRateLimit(session.user.id, "api");
    if (!rateLimit.allowed) {
      return rateLimitedResponse(rateLimit);
    }

    // Parse and validate request body with Zod
    const body = await request.json();
    const validation = validateRequest(CreateQuizRequestSchema, body);

    if (!validation.success) {
      logger.security("input.validation_failed", {
        userId: session.user.id,
        path: "/api/quizzes",
        method: "POST",
        message: "Schema validation failed",
        metadata: { error: validation.error },
      });
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const { title, description, difficulty, questionTypes } = validation.data;
    const id = crypto.randomUUID();
    const newQuiz = await db()
      .insert(quizzes)
      .values({
        id,
        userId: session.user.id,
        title,
        description,
        questionCount: 0,
        difficulty,
        questionTypes: JSON.stringify(questionTypes),
      })
      .returning();

    logger.audit("quiz.create", {
      userId: session.user.id,
      resourceType: "quiz",
      resourceId: id,
    });

    return NextResponse.json(newQuiz[0], {
      status: 201,
      headers: getRateLimitHeaders(rateLimit),
    });
  } catch (error) {
    logger.error({ error }, "Error creating quiz");
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
