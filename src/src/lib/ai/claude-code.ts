/**
 * Claude Code Integration
 *
 * Claude Code is a CLI tool for agentic coding that can be integrated
 * as an alternative to direct API calls. This is useful when:
 * 1. You want to use Claude Code's enhanced reasoning capabilities
 * 2. You need to leverage local file system access for study materials
 * 3. You want to avoid API key management in certain environments
 *
 * SETUP REQUIREMENTS:
 * - Claude Code must be installed on the host system
 * - The CLAUDE_CODE_ENABLED environment variable must be set to "true"
 * - The container must have access to the Claude Code CLI
 *
 * NOTE: This integration requires the Docker container to either:
 * 1. Mount the host's Claude Code installation, or
 * 2. Have Claude Code installed within the container
 *
 * For production deployments, the standard API approach is recommended.
 * Claude Code integration is best suited for local development or
 * self-hosted environments where CLI access is available.
 */

import { exec } from "child_process";
import { promisify } from "util";
import { parseQuizResponse } from "./index";
import type { QuizGenerationParams } from "./index";
import type { GeneratedQuiz } from "@/types";

const execAsync = promisify(exec);

const difficultyInstructions = {
  mercy_mode:
    "Create beginner-friendly questions with clear answers and helpful hints.",
  mental_warfare:
    "Create challenging questions that require deep understanding and careful thought.",
  abandon_all_hope:
    "Create extremely difficult questions testing expert-level knowledge with edge cases.",
};

export async function generateWithClaudeCode(
  params: QuizGenerationParams
): Promise<GeneratedQuiz> {
  if (process.env.CLAUDE_CODE_ENABLED !== "true") {
    throw new Error(
      "Claude Code is not enabled. Set CLAUDE_CODE_ENABLED=true and ensure Claude Code CLI is installed."
    );
  }

  const prompt = buildClaudeCodePrompt(params);

  try {
    // Execute Claude Code CLI with the prompt
    // The --print flag outputs the response to stdout
    // The -p flag runs in non-interactive print mode
    const { stdout } = await execAsync(
      `claude -p "${prompt.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`,
      { timeout: 120000 } // 2 minute timeout
    );

    return parseQuizResponse(stdout);
  } catch (error) {
    console.error("Claude Code execution failed:", error);
    throw new Error("Failed to generate quiz with Claude Code");
  }
}

function buildClaudeCodePrompt(params: QuizGenerationParams): string {
  return `Generate a quiz with the following specifications:
- Number of questions: ${params.questionCount}
- Difficulty: ${params.difficulty.replace(/_/g, " ")}
- Question types: ${params.questionTypes.join(", ")}
- Difficulty instructions: ${difficultyInstructions[params.difficulty]}

Study material:
${params.studyMaterial.substring(0, 3000)}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "title": "Quiz Title Based on Content",
  "questions": [
    {
      "type": "multiple_choice|essay|short_answer|true_false|select_all",
      "content": "Question text",
      "options": ["A) Option", "B) Option", "C) Option", "D) Option"] or null for essay/short_answer,
      "correctAnswer": "A" or ["A", "C"] for select_all or "true"/"false" for true_false,
      "explanation": "Why this is correct",
      "difficulty": 0.5
    }
  ]
}`;
}

// Grade using Claude Code CLI
export async function gradeWithClaudeCode(
  question: string,
  correctAnswer: string,
  userAnswer: string,
  questionType: "essay" | "short_answer"
): Promise<{ isCorrect: boolean; feedback: string; score: number }> {
  if (process.env.CLAUDE_CODE_ENABLED !== "true") {
    throw new Error("Claude Code is not enabled for grading.");
  }

  const prompt = `Grade this ${questionType} response.
Question: ${question}
Expected answer: ${correctAnswer}
Student answer: ${userAnswer}

Return ONLY JSON: {"score": 0-100, "isCorrect": true/false, "feedback": "explanation"}`;

  try {
    const { stdout } = await execAsync(
      `claude -p "${prompt.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`,
      { timeout: 60000 }
    );

    const result = JSON.parse(stdout.trim());
    return {
      score: result.score,
      isCorrect: result.isCorrect,
      feedback: result.feedback,
    };
  } catch {
    return {
      score: 0,
      isCorrect: false,
      feedback: "Unable to grade with Claude Code. Please review manually.",
    };
  }
}
