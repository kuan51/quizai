"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Difficulty } from "@/types";

export interface QuizSummary {
  id: string;
  title: string;
  description: string | null;
  questionCount: number;
  difficulty: Difficulty;
  createdAt: string;
}

interface QuizDataContextType {
  quizzes: QuizSummary[];
  isLoading: false;
  removeQuiz: (id: string) => void;
  refreshQuizzes: () => void;
}

const QuizDataContext = createContext<QuizDataContextType | null>(null);

export function QuizDataProvider({
  initialQuizzes,
  children,
}: {
  initialQuizzes: QuizSummary[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState(initialQuizzes);

  // Sync with server data when it changes (e.g., after router.refresh() or navigation)
  useEffect(() => {
    setQuizzes(initialQuizzes);
  }, [initialQuizzes]);

  const removeQuiz = useCallback((id: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const refreshQuizzes = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <QuizDataContext.Provider
      value={{ quizzes, isLoading: false, removeQuiz, refreshQuizzes }}
    >
      {children}
    </QuizDataContext.Provider>
  );
}

export function useQuizData() {
  const context = useContext(QuizDataContext);
  if (!context) {
    throw new Error("useQuizData must be used within a QuizDataProvider");
  }
  return context;
}
