import OpenAI from "openai";
import { buildQuizPrompt, parseQuizResponse, difficultyInstructions, buildGradingPrompt, parseGradingResponse } from "./index";
import type { QuizGenerationParams } from "./index";
import type { GeneratedQuiz } from "@/types";

// Lazy initialization to avoid API key errors during build
let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

export async function generateWithOpenAI(
  params: QuizGenerationParams
): Promise<GeneratedQuiz> {
  const prompt = buildQuizPrompt(
    params,
    difficultyInstructions[params.difficulty]
  );

  const response = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are an expert educational quiz generator. Always respond with valid JSON only, no markdown formatting or additional text.",
      },
      { role: "user", content: prompt },
    ],
    max_completion_tokens: 4096,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI API");
  }

  return parseQuizResponse(content);
}

// Grade essay/short answer questions using OpenAI
export async function gradeWithOpenAI(
  question: string,
  correctAnswer: string,
  userAnswer: string,
  questionType: "essay" | "short_answer"
): Promise<{ isCorrect: boolean; feedback: string; score: number }> {
  const prompt = buildGradingPrompt(question, correctAnswer, userAnswer, questionType);

  const response = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are an expert grader. Always respond with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    max_completion_tokens: 1024,
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI API for grading");
  }

  return parseGradingResponse(content);
}
