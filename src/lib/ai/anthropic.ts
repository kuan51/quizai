import Anthropic from "@anthropic-ai/sdk";
import {
  buildQuizPrompt,
  parseQuizResponse,
  difficultyInstructions,
  buildGradingPrompt,
  parseGradingResponse,
} from "./index";
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

export async function generateWithAnthropic(
  params: QuizGenerationParams,
): Promise<GeneratedQuiz> {
  const prompt = buildQuizPrompt(
    params,
    difficultyInstructions[params.difficulty],
  );

  const response = await getAnthropic().messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system:
      "You are an expert educational quiz generator. Always respond with valid JSON only, no markdown formatting or additional text.",
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
  questionType: "essay" | "short_answer",
): Promise<{ isCorrect: boolean; feedback: string; score: number }> {
  const prompt = buildGradingPrompt(
    question,
    correctAnswer,
    userAnswer,
    questionType,
  );

  const response = await getAnthropic().messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Anthropic API for grading");
  }

  return parseGradingResponse(textContent.text);
}
