"use client";

import { useState } from "react";
import { QuizCard } from "@/components/quiz/QuizCard";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import type { Difficulty } from "@/types";
import { useQuizData } from "@/contexts/QuizDataContext";

export function QuizList() {
  const { quizzes, removeQuiz } = useQuizData();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/quizzes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        removeQuiz(id);
      }
    } catch {
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || quiz.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
          <Plus size={40} className="text-primary-600" />
        </div>
        <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100 mb-2">
          No quizzes yet
        </h2>
        <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto">
          Create your first AI-powered quiz by providing study material and let our AI generate questions for you.
        </p>
        <Link href="/dashboard/quiz/new">
          <Button size="lg">
            <Plus size={20} />
            Create Your First Quiz
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--surface)] text-[var(--text-primary)] focus:ring-1 focus:ring-primary-400 focus:border-primary-400 outline-none transition-colors"
          />
        </div>
        <div className="relative">
          <Filter
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | "all")}
            className="pl-10 pr-8 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-[var(--surface)] text-[var(--text-primary)] focus:ring-1 focus:ring-primary-400 focus:border-primary-400 outline-none appearance-none cursor-pointer transition-colors"
          >
            <option value="all">All Difficulties</option>
            <option value="mercy_mode">Mercy Mode</option>
            <option value="mental_warfare">Mental Warfare</option>
            <option value="abandon_all_hope">Abandon All Hope</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="font-mono text-xs tracking-wider text-[var(--text-tertiary)]">
        Showing {filteredQuizzes.length} of {quizzes.length} quizzes
      </p>

      {/* Quiz grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-500 dark:text-stone-400">
            No quizzes match your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, index) => (
            <div
              key={quiz.id}
              className={`animate-fade-up stagger-${Math.min(index + 1, 8)}`}
            >
              <QuizCard
                id={quiz.id}
                title={quiz.title}
                description={quiz.description}
                questionCount={quiz.questionCount}
                difficulty={quiz.difficulty}
                createdAt={quiz.createdAt}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
