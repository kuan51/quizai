import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizzes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/quizzes - List all quizzes for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    return NextResponse.json(userQuizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
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

    const body = await request.json();
    const { title, description, difficulty, questionTypes } = body;

    if (!title || !difficulty || !questionTypes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
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

    return NextResponse.json(newQuiz[0], { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
