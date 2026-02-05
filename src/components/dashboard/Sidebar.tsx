"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Plus, Home, LogOut, Menu, X, BookOpen, Sparkles } from "lucide-react";
import type { Difficulty } from "@/types";
import { difficultyLabels } from "@/types";

interface Quiz {
  id: string;
  title: string;
  createdAt: string;
  difficulty: Difficulty;
}

export function Sidebar() {
  const pathname = usePathname();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/quizzes");
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside
      className={`h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl">QuizAI</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 p-3 rounded-lg mb-1 transition-colors ${
            pathname === "/dashboard"
              ? "bg-primary-600 text-white"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Home size={20} />
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        {/* New Quiz Button */}
        <Link
          href="/dashboard/quiz/new"
          className="flex items-center gap-3 p-3 rounded-lg mb-4 bg-primary-600 hover:bg-primary-700 transition-colors text-white"
        >
          <Plus size={20} />
          {!isCollapsed && <span>New Quiz</span>}
        </Link>

        {/* Quiz List */}
        {!isCollapsed && (
          <div className="mb-4">
            <h2 className="text-xs uppercase text-slate-500 font-semibold px-3 mb-2 flex items-center gap-2">
              <BookOpen size={14} />
              Your Quizzes
            </h2>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="inline-block w-5 h-5 border-2 border-slate-600 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-sm">
                No quizzes yet
              </div>
            ) : (
              <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                {quizzes.map((quiz) => (
                  <Link
                    key={quiz.id}
                    href={`/dashboard/quiz/${quiz.id}`}
                    className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                      pathname === `/dashboard/quiz/${quiz.id}`
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{difficultyLabels[quiz.difficulty].emoji}</span>
                    <span className="truncate flex-1">{quiz.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 p-3 rounded-lg w-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
