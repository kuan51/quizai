import OpenAI from "openai";
import { buildQuizPrompt, parseQuizResponse, difficultyInstructions, buildGradingPrompt, parseGradingResponse } from "./index";
import type { QuizGenerationParams } from "./index";
import type { GeneratedQuiz } from "@/types";

// Reasoning models (o-series, gpt-5 family) have different parameter support
const REASONING_MODEL_PATTERNS = [/^o\d/, /^gpt-5/];

function isReasoningModel(model: string): boolean {
  return REASONING_MODEL_PATTERNS.some((p) => p.test(model));
}

// Reasoning models don't support custom temperature values
function supportsTemperature(model: string): boolean {
  return !isReasoningModel(model);
}

// Reasoning models need higher token budgets (reasoning tokens count against the limit)
function getMaxCompletionTokens(model: string, defaultTokens: number): number {
  return isReasoningModel(model) ? Math.max(defaultTokens, 16384) : defaultTokens;
}

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

  const model = process.env.OPENAI_MODEL || "gpt-4-turbo-preview";

  const response = await getOpenAI().chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are an expert educational quiz generator. Always respond with valid JSON only, no markdown formatting or additional text.",
      },
      { role: "user", content: prompt },
    ],
    max_completion_tokens: getMaxCompletionTokens(model, 4096),
    ...(supportsTemperature(model) && { temperature: 0.7 }),
    response_format: { type: "json_object" },
  });

  const message = response.choices[0]?.message;
  const content = message?.content;
  if (!content) {
    const refusal = message?.refusal;
    const finishReason = response.choices[0]?.finish_reason;
    if (refusal) {
      throw new Error(`OpenAI refused the request: ${refusal}`);
    }
    if (finishReason === "length") {
      throw new Error("OpenAI response truncated: model ran out of tokens");
    }
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

  const model = process.env.OPENAI_MODEL || "gpt-4-turbo-preview";

  const response = await getOpenAI().chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are an expert grader. Always respond with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    max_completion_tokens: getMaxCompletionTokens(model, 1024),
    ...(supportsTemperature(model) && { temperature: 0.3 }),
    response_format: { type: "json_object" },
  });

  const message = response.choices[0]?.message;
  const content = message?.content;
  if (!content) {
    const refusal = message?.refusal;
    const finishReason = response.choices[0]?.finish_reason;
    if (refusal) {
      throw new Error(`OpenAI refused the request: ${refusal}`);
    }
    if (finishReason === "length") {
      throw new Error("OpenAI response truncated: model ran out of tokens");
    }
    throw new Error("No response from OpenAI API for grading");
  }

  return parseGradingResponse(content);
}
