"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Plus, Home, LogOut, Menu, X, BookOpen } from "lucide-react";
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
        const json = await response.json();
        setQuizzes(json.data);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const collapsedClass = isCollapsed
    ? "opacity-0 w-0 overflow-hidden"
    : "opacity-100";

  return (
    <aside
      className={`h-screen bg-primary-950 text-white flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-primary-900 flex items-center justify-between">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center">
            <span className="font-serif text-xl tracking-tight text-white/90">
              QuizAI
            </span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-stone-400 hover:text-stone-200"
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
              ? "border-l-2 border-accent-400 bg-white/5 text-white"
              : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
          }`}
        >
          <Home size={20} />
          <span className={`transition-opacity duration-200 ${collapsedClass}`}>
            Dashboard
          </span>
        </Link>

        {/* New Quiz Button */}
        <Link
          href="/dashboard/quiz/new"
          className="flex items-center gap-3 p-3 rounded-lg mb-4 border border-accent-400 text-accent-400 hover:bg-accent-400/10 transition-colors"
        >
          <Plus size={20} />
          <span className={`transition-opacity duration-200 ${collapsedClass}`}>
            New Quiz
          </span>
        </Link>

        {/* Quiz List */}
        <div
          className={`transition-all duration-300 ${
            isCollapsed
              ? "opacity-0 max-h-0 overflow-hidden"
              : "opacity-100 max-h-[9999px]"
          }`}
        >
          <div className="mb-4">
            <h2 className="uppercase tracking-widest text-[10px] text-stone-500 font-semibold px-3 mb-2 flex items-center gap-2">
              <BookOpen size={12} />
              Your Quizzes
            </h2>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="inline-block w-5 h-5 border-2 border-primary-800 border-t-primary-400 rounded-full animate-spin" />
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-4 text-stone-600 text-sm">
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
                        ? "border-l-2 border-accent-400 bg-white/5 text-white"
                        : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
                    }`}
                  >
                    <span className="font-mono text-[11px] text-stone-500 shrink-0">
                      {difficultyLabels[quiz.difficulty].label}
                    </span>
                    <span className="truncate flex-1">{quiz.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-primary-900">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 p-3 rounded-lg w-full text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-colors"
        >
          <LogOut size={20} />
          <span className={`transition-opacity duration-200 ${collapsedClass}`}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
