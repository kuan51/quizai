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

// GET /api/quizzes - List all quizzes for the current user
export async function GET() {
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
      .orderBy(desc(quizzes.createdAt));

    return NextResponse.json(userQuizzes, {
      headers: getRateLimitHeaders(rateLimit),
    });
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

    const body = await request.json();
    const { title, description, difficulty, questionTypes } = body;

    if (!title || !difficulty || !questionTypes) {
      logger.security("input.validation_failed", {
        userId: session.user.id,
        path: "/api/quizzes",
        method: "POST",
        message: "Missing required fields",
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

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
