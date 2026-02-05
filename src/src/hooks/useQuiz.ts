"use client";

import { useState, useCallback } from "react";
import type { QuizWithQuestions, Difficulty, QuestionType } from "@/types";

interface UseQuizOptions {
  onSuccess?: (quiz: QuizWithQuestions) => void;
  onError?: (error: Error) => void;
}

interface CreateQuizParams {
  title: string;
  studyMaterial: string;
  questionCount: number;
  difficulty: Difficulty;
  questionTypes: QuestionType[];
}

export function useQuiz(options: UseQuizOptions = {}) {
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuiz = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/quizzes/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch quiz");
        }
        const data = await response.json();
        setQuiz(data);
        options.onSuccess?.(data);
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const generateQuiz = useCallback(
    async (params: CreateQuizParams) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/quizzes/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to generate quiz");
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const deleteQuiz = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/quizzes/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete quiz");
        }

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return {
    quiz,
    isLoading,
    error,
    fetchQuiz,
    generateQuiz,
    deleteQuiz,
    setQuiz,
  };
}
