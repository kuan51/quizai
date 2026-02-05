import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizzes, questions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { safeJsonParse } from "@/lib/sanitize";
import {
  checkRateLimit,
  getRateLimitHeaders,
  rateLimitedResponse,
} from "@/lib/rate-limit";

// GET /api/quizzes/[id] - Get a quiz with its questions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Get the quiz
    const quiz = await db()
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.id, id), eq(quizzes.userId, session.user.id)))
      .limit(1);

    if (quiz.length === 0) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Get the questions
    const quizQuestions = await db()
      .select()
      .from(questions)
      .where(eq(questions.quizId, id))
      .orderBy(questions.order);

    // Safe JSON parsing for options
    const parsedQuestions = quizQuestions.map((q) => ({
      ...q,
      options: q.options
        ? safeJsonParse<string[] | null>(q.options, null).data
        : null,
    }));

    // Safe JSON parsing for questionTypes
    const { data: questionTypes } = safeJsonParse<string[]>(
      quiz[0].questionTypes,
      []
    );

    return NextResponse.json(
      {
        ...quiz[0],
        questionTypes,
        questions: parsedQuestions,
      },
      { headers: getRateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    logger.error({ error }, "Error fetching quiz");
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[id] - Delete a quiz
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Verify ownership
    const quiz = await db()
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.id, id), eq(quizzes.userId, session.user.id)))
      .limit(1);

    if (quiz.length === 0) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Delete the quiz (questions will be cascade deleted)
    await db().delete(quizzes).where(eq(quizzes.id, id));

    logger.audit("quiz.delete", {
      userId: session.user.id,
      resourceType: "quiz",
      resourceId: id,
    });

    return NextResponse.json(
      { success: true },
      { headers: getRateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    logger.error({ error }, "Error deleting quiz");
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
