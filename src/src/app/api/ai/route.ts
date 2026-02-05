import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { gradeWithAnthropic } from "@/lib/ai/anthropic";
import { gradeWithOpenAI } from "@/lib/ai/openai";

interface GradeRequest {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  questionType: "essay" | "short_answer";
  provider?: "openai" | "anthropic";
}

// POST /api/ai - Grade essay/short answer questions
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GradeRequest = await request.json();
    const { question, correctAnswer, userAnswer, questionType, provider } = body;

    // Validation
    if (!question || !correctAnswer || !userAnswer || !questionType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["essay", "short_answer"].includes(questionType)) {
      return NextResponse.json(
        { error: "Invalid question type for AI grading" },
        { status: 400 }
      );
    }

    // Determine provider
    const selectedProvider =
      provider || process.env.DEFAULT_AI_PROVIDER || "anthropic";

    // Grade with selected provider
    let result;
    if (selectedProvider === "openai") {
      result = await gradeWithOpenAI(
        question,
        correctAnswer,
        userAnswer,
        questionType
      );
    } else {
      result = await gradeWithAnthropic(
        question,
        correctAnswer,
        userAnswer,
        questionType
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error grading answer:", error);
    return NextResponse.json(
      { error: "Failed to grade answer" },
      { status: 500 }
    );
  }
}
