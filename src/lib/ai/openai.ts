import OpenAI from "openai";
import { buildQuizPrompt, parseQuizResponse } from "./index";
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

const difficultyInstructions = {
  mercy_mode:
    "Create beginner-friendly questions with clear answers. Include helpful hints in the explanations. Focus on fundamental concepts and avoid trick questions. Make sure the correct answer is clearly the best choice.",
  mental_warfare:
    "Create challenging questions that require deep understanding. Some questions should have nuanced answers that require careful thought. Include some questions that test application of concepts, not just recall. The explanations should help students understand the deeper reasoning.",
  abandon_all_hope:
    "Create extremely difficult questions that test expert-level knowledge. Include edge cases, exceptions to rules, and questions that require synthesis of multiple concepts. Some questions should require careful analysis to distinguish between very similar options. Expect students to have mastered the material.",
};

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
    max_tokens: 4096,
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

  const response = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are an expert grader. Always respond with valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 1024,
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI API for grading");
  }

  try {
    const result = JSON.parse(content.trim());
    return {
      score: result.score,
      isCorrect: result.isCorrect,
      feedback: result.feedback,
    };
  } catch {
    return {
      score: 0,
      isCorrect: false,
      feedback: "Unable to grade response automatically. Please review manually.",
    };
  }
}
