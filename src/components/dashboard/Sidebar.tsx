"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Plus, Home, LogOut, Menu, X, BookOpen } from "lucide-react";
import { difficultyLabels } from "@/types";
import { SettingsPopover } from "@/components/dashboard/SettingsPopover";
import { Logo } from "@/components/ui";
import { useQuizData } from "@/contexts/QuizDataContext";

export function Sidebar() {
  const pathname = usePathname();
  const { quizzes } = useQuizData();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const collapsedClass = isCollapsed
    ? "opacity-0 w-0 overflow-hidden"
    : "opacity-100";

  return (
    <aside
      className={`h-screen bg-[var(--sidebar-bg)] text-[var(--sidebar-text-active)] flex flex-col transition-[width] duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--sidebar-border)] flex items-center justify-between">
        <Logo href="/dashboard" size="h-[4.25rem]" className="opacity-90" showText={!isCollapsed} textClassName="text-xl text-[var(--sidebar-text-active)]" />
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)]"
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
              ? "border-l-2 border-[var(--sidebar-accent)] bg-white/5 text-[var(--sidebar-text-active)] neon-active-glow"
              : "text-[var(--sidebar-text)] hover:bg-white/5 hover:text-[var(--sidebar-text-hover)]"
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
          className="flex items-center gap-3 p-3 rounded-lg mb-4 border border-[var(--sidebar-accent)] text-[var(--sidebar-accent)] hover:bg-[var(--sidebar-accent)]/10 transition-colors"
        >
          <Plus size={20} />
          <span className={`transition-opacity duration-200 ${collapsedClass}`}>
            New Quiz
          </span>
        </Link>

        {/* Quiz List */}
        <div
          className={`transition-[opacity,max-height] duration-300 ${
            isCollapsed
              ? "opacity-0 max-h-0 overflow-hidden"
              : "opacity-100 max-h-[9999px]"
          }`}
        >
          <div className="mb-4">
            <h2 className="uppercase tracking-widest text-[10px] text-[var(--sidebar-text)] font-semibold px-3 mb-2 flex items-center gap-2">
              <BookOpen size={12} />
              Your Quizzes
            </h2>
            {quizzes.length === 0 ? (
              <div className="text-center py-4 text-[var(--sidebar-text)] opacity-60 text-sm">
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
                        ? "border-l-2 border-[var(--sidebar-accent)] bg-white/5 text-[var(--sidebar-text-active)] neon-active-glow"
                        : "text-[var(--sidebar-text)] hover:bg-white/5 hover:text-[var(--sidebar-text-hover)]"
                    }`}
                  >
                    <span className="font-mono text-[11px] text-[var(--sidebar-text)] opacity-70 shrink-0">
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
      <div className="p-2 border-t border-[var(--sidebar-border)] space-y-1">
        <SettingsPopover isCollapsed={isCollapsed} />
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 p-3 rounded-lg w-full text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)] hover:bg-white/5 transition-colors"
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
