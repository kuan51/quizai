import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizzes, questions } from "@/lib/db/schema";
import { generateQuiz } from "@/lib/ai";
import type { Difficulty, QuestionType } from "@/types";

interface GenerateRequest {
  title: string;
  studyMaterial: string;
  questionCount: number;
  difficulty: Difficulty;
  questionTypes: QuestionType[];
}

// POST /api/quizzes/generate - Generate a quiz using AI
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();
    const { title, studyMaterial, questionCount, difficulty, questionTypes } = body;

    // Validation
    if (!title || !studyMaterial || !questionCount || !difficulty || !questionTypes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (questionCount < 5 || questionCount > 50) {
      return NextResponse.json(
        { error: "Question count must be between 5 and 50" },
        { status: 400 }
      );
    }

    if (questionTypes.length === 0) {
      return NextResponse.json(
        { error: "At least one question type must be selected" },
        { status: 400 }
      );
    }

    if (studyMaterial.length < 50) {
      return NextResponse.json(
        { error: "Study material must be at least 50 characters" },
        { status: 400 }
      );
    }

    // Generate quiz using AI
    const generatedQuiz = await generateQuiz({
      studyMaterial,
      questionCount,
      difficulty,
      questionTypes,
    });

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

    // Return the created quiz
    return NextResponse.json(
      {
        id: quizId,
        title: title || generatedQuiz.title,
        questionCount: generatedQuiz.questions.length,
        difficulty,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
