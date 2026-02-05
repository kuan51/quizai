// Type definitions for QuizAI

export type Difficulty = "mercy_mode" | "mental_warfare" | "abandon_all_hope";

export type QuestionType =
  | "multiple_choice"
  | "essay"
  | "short_answer"
  | "true_false"
  | "select_all";

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
}

export interface Quiz {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  questionCount: number;
  difficulty: Difficulty;
  questionTypes: QuestionType[];
  studyMaterial: string | null;
  currentDifficultyScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  quizId: string;
  type: QuestionType;
  content: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  difficulty: number;
  order: number;
}

export interface Attempt {
  id: string;
  quizId: string;
  userId: string;
  score: number | null;
  totalQuestions: number | null;
  correctAnswers: number | null;
  startedAt: Date;
  completedAt: Date | null;
}

export interface Response {
  id: string;
  attemptId: string;
  questionId: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  aiGradingFeedback: string | null;
  answeredAt: Date;
}

// API Request/Response types
export interface QuizGenerationRequest {
  title: string;
  studyMaterial: string;
  questionCount: number;
  difficulty: Difficulty;
  questionTypes: QuestionType[];
}

export interface GeneratedQuestion {
  type: QuestionType;
  content: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
  difficulty: number;
}

export interface GeneratedQuiz {
  title: string;
  questions: GeneratedQuestion[];
}

export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

export interface AttemptWithResponses extends Attempt {
  responses: Response[];
}

// Form state types
export interface QuizFormData {
  title: string;
  questionCount: number;
  difficulty: Difficulty;
  questionTypes: QuestionType[];
  studyMaterial: string;
}

// AI Provider types
export type AIProvider = "openai" | "anthropic" | "claude-code";

export interface QuizGenerationParams {
  studyMaterial: string;
  questionCount: number;
  difficulty: Difficulty;
  questionTypes: QuestionType[];
  currentPerformance?: number;
}

// Difficulty labels for UI
export const difficultyLabels: Record<
  Difficulty,
  { label: string; description: string; emoji: string }
> = {
  mercy_mode: {
    label: "Mercy Mode",
    description: "Gentle introduction with helpful hints",
    emoji: "😇",
  },
  mental_warfare: {
    label: "Mental Warfare",
    description: "Challenging questions that push your limits",
    emoji: "🧠",
  },
  abandon_all_hope: {
    label: "Abandon All Hope",
    description: "Expert-level questions. No mercy.",
    emoji: "💀",
  },
};

export const questionTypeLabels: Record<QuestionType, string> = {
  multiple_choice: "Multiple Choice",
  essay: "Essay",
  short_answer: "Short Answer",
  true_false: "True/False",
  select_all: "Select All That Apply",
};
