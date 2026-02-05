"use client";

import { useState, useCallback } from "react";

interface GradeResult {
  isCorrect: boolean;
  feedback: string;
  score: number;
}

interface GradeParams {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  questionType: "essay" | "short_answer";
  provider?: "openai" | "anthropic";
}

export function useAI() {
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const gradeAnswer = useCallback(
    async (params: GradeParams): Promise<GradeResult> => {
      setIsGrading(true);
      setError(null);

      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to grade answer");
        }

        return await response.json();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        throw error;
      } finally {
        setIsGrading(false);
      }
    },
    []
  );

  return {
    gradeAnswer,
    isGrading,
    error,
  };
}
