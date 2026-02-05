import Anthropic from "@anthropic-ai/sdk";
import { buildQuizPrompt, parseQuizResponse } from "./index";
import type { QuizGenerationParams } from "./index";
import type { GeneratedQuiz } from "@/types";

// Lazy initialization to avoid API key errors during build
let _anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}

const difficultyInstructions = {
  mercy_mode:
    "Create beginner-friendly questions with clear answers. Include helpful hints in the explanations. Focus on fundamental concepts and avoid trick questions. Make sure the correct answer is clearly the best choice.",
  mental_warfare:
    "Create challenging questions that require deep understanding. Some questions should have nuanced answers that require careful thought. Include some questions that test application of concepts, not just recall. The explanations should help students understand the deeper reasoning.",
  abandon_all_hope:
    "Create extremely difficult questions that test expert-level knowledge. Include edge cases, exceptions to rules, and questions that require synthesis of multiple concepts. Some questions should require careful analysis to distinguish between very similar options. Expect students to have mastered the material.",
};

export async function generateWithAnthropic(
  params: QuizGenerationParams
): Promise<GeneratedQuiz> {
  const prompt = buildQuizPrompt(
    params,
    difficultyInstructions[params.difficulty]
  );

  const response = await getAnthropic().messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Anthropic API");
  }

  return parseQuizResponse(textContent.text);
}

// Grade essay/short answer questions using Anthropic
export async function gradeWithAnthropic(
  question: string,
  correctAnswer: string,
  userAnswer: string,
  questionType: "essay" | "short_answer"
): Promise<{ isCorrect: boolean; feedback: string; score: number }> {
  const prompt = `You are an expert grader for educational quizzes. Grade the following ${questionType} response.

QUESTION:
${question}

EXPECTED ANSWER/KEY POINTS:
${correctAnswer}

STUDENT'S ANSWER:
${userAnswer}

Grade this response and provide:
1. A score from 0 to 100
2. Whether it should be considered correct (score >= 70)
3. Constructive feedback explaining what was good and what could be improved

Return ONLY valid JSON in this format:
{
  "score": 85,
  "isCorrect": true,
  "feedback": "Your answer correctly identified... However, you could improve by..."
}`;

  const response = await getAnthropic().messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Anthropic API for grading");
  }

  try {
    const result = JSON.parse(textContent.text.trim());
    return {
      score: result.score,
      isCorrect: result.isCorrect,
      feedback: result.feedback,
    };
  } catch {
    // Default response if parsing fails
    return {
      score: 0,
      isCorrect: false,
      feedback: "Unable to grade response automatically. Please review manually.",
    };
  }
}
