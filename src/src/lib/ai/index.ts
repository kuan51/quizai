import { generateWithOpenAI } from "./openai";
import { generateWithAnthropic } from "./anthropic";
import { generateWithClaudeCode } from "./claude-code";
import type { QuestionType, Difficulty, GeneratedQuiz } from "@/types";

export type AIProvider = "openai" | "anthropic" | "claude-code";

export interface QuizGenerationParams {
  studyMaterial: string;
  questionCount: number;
  difficulty: Difficulty;
  questionTypes: QuestionType[];
  currentPerformance?: number; // 0-1 scale for adaptive difficulty
}

export async function generateQuiz(
  params: QuizGenerationParams,
  provider?: AIProvider
): Promise<GeneratedQuiz> {
  const selectedProvider =
    provider || (process.env.DEFAULT_AI_PROVIDER as AIProvider) || "anthropic";

  switch (selectedProvider) {
    case "openai":
      return generateWithOpenAI(params);
    case "anthropic":
      return generateWithAnthropic(params);
    case "claude-code":
      return generateWithClaudeCode(params);
    default:
      throw new Error(`Unknown AI provider: ${selectedProvider}`);
  }
}

// Adaptive difficulty calculation
export function calculateAdaptiveDifficulty(
  baseDifficulty: Difficulty,
  recentPerformance: number // 0-1 scale
): number {
  const baseScores = {
    mercy_mode: 0.3,
    mental_warfare: 0.6,
    abandon_all_hope: 0.9,
  };

  const base = baseScores[baseDifficulty];

  // Adjust based on performance: good performance increases difficulty
  // Poor performance decreases it (within bounds of selected mode)
  const adjustment = (recentPerformance - 0.5) * 0.3;

  return Math.max(0.1, Math.min(1.0, base + adjustment));
}

// Build the quiz generation prompt
export function buildQuizPrompt(
  params: QuizGenerationParams,
  difficultyInstructions: string
): string {
  return `You are an expert quiz generator for educational purposes. Generate a quiz based on the following specifications:

STUDY MATERIAL:
${params.studyMaterial}

REQUIREMENTS:
- Number of questions: ${params.questionCount}
- Difficulty level: ${params.difficulty.replace(/_/g, " ")}
- Question types to include: ${params.questionTypes.join(", ")}

DIFFICULTY INSTRUCTIONS:
${difficultyInstructions}

QUESTION TYPE SPECIFICATIONS:
- multiple_choice: Provide exactly 4 options (A, B, C, D). Only one correct answer.
- true_false: The answer must be either "true" or "false".
- short_answer: Expect a brief response (1-3 sentences).
- essay: Expect a detailed response (1-3 paragraphs).
- select_all: Provide 4-6 options. Multiple options can be correct. The correctAnswer should be a JSON array of correct option letters.

IMPORTANT: Return ONLY valid JSON in the following format (no markdown code blocks, no explanation):
{
  "title": "Generated Quiz Title Based on Content",
  "questions": [
    {
      "type": "multiple_choice",
      "content": "Question text here?",
      "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
      "correctAnswer": "A",
      "explanation": "Explanation of why this answer is correct",
      "difficulty": 0.5
    }
  ]
}

For true_false questions, options should be ["True", "False"].
For essay and short_answer, options should be null.
For select_all, correctAnswer should be like ["A", "C", "D"].

Generate diverse questions that thoroughly test understanding of the study material.`;
}

// Parse AI response to quiz format
export function parseQuizResponse(responseText: string): GeneratedQuiz {
  // Clean up the response - remove markdown code blocks if present
  let cleanedResponse = responseText.trim();

  // Remove markdown code blocks
  if (cleanedResponse.startsWith("```json")) {
    cleanedResponse = cleanedResponse.slice(7);
  } else if (cleanedResponse.startsWith("```")) {
    cleanedResponse = cleanedResponse.slice(3);
  }

  if (cleanedResponse.endsWith("```")) {
    cleanedResponse = cleanedResponse.slice(0, -3);
  }

  cleanedResponse = cleanedResponse.trim();

  try {
    const parsed = JSON.parse(cleanedResponse);

    // Validate the structure
    if (!parsed.title || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid quiz structure: missing title or questions array");
    }

    // Validate and normalize each question
    const questions = parsed.questions.map((q: Record<string, unknown>, index: number) => {
      if (!q.type || !q.content || q.correctAnswer === undefined) {
        throw new Error(`Invalid question at index ${index}: missing required fields`);
      }

      return {
        type: q.type as string,
        content: q.content as string,
        options: q.options as string[] | null,
        correctAnswer: typeof q.correctAnswer === "object"
          ? JSON.stringify(q.correctAnswer)
          : String(q.correctAnswer),
        explanation: (q.explanation as string) || "No explanation provided.",
        difficulty: typeof q.difficulty === "number" ? q.difficulty : 0.5,
      };
    });

    return {
      title: parsed.title,
      questions,
    };
  } catch (error) {
    console.error("Failed to parse quiz response:", error);
    console.error("Response was:", cleanedResponse.substring(0, 500));
    throw new Error("Failed to parse AI response into valid quiz format");
  }
}
