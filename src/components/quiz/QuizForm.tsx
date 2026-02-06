"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Difficulty, QuestionType } from "@/types";
import { difficultyLabels, questionTypeLabels } from "@/types";

const difficultyNumerals: Record<Difficulty, string> = {
  mercy_mode: "I",
  mental_warfare: "II",
  abandon_all_hope: "III",
};

export function QuizForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    questionCount: 10,
    difficulty: "mental_warfare" as Difficulty,
    questionTypes: ["multiple_choice"] as QuestionType[],
    studyMaterial: "",
  });

  const handleQuestionTypeToggle = (type: QuestionType) => {
    setFormData((prev) => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter((t) => t !== type)
        : [...prev.questionTypes, type],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.questionTypes.length === 0) {
      setError("Please select at least one question type");
      return;
    }

    if (!formData.studyMaterial.trim()) {
      setError("Please provide study material");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please provide a quiz title");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate quiz");
      }

      const quiz = await response.json();
      router.push(`/dashboard/quiz/${quiz.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl">
      {error && (
        <div className="p-4 bg-error-light text-error-dark rounded-lg border border-error">
          {error}
        </div>
      )}

      {/* Title */}
      <Input
        label="Quiz Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="e.g., Biology Chapter 5 Review"
        required
      />

      {/* Question Count */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
          Number of Questions: <span className="font-mono text-primary-500">{formData.questionCount}</span>
        </label>
        <input
          type="range"
          min="5"
          max="50"
          value={formData.questionCount}
          onChange={(e) =>
            setFormData({ ...formData, questionCount: parseInt(e.target.value) })
          }
          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer dark:bg-stone-700 accent-primary-600"
        />
        <div className="flex justify-between text-xs text-stone-400 mt-1">
          <span>5</span>
          <span>50</span>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
          Difficulty Level
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(difficultyLabels) as [Difficulty, typeof difficultyLabels[Difficulty]][]).map(
            ([key, { label, description }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFormData({ ...formData, difficulty: key })}
                className={`p-4 rounded-lg text-left transition-all ${
                  formData.difficulty === key
                    ? key === "mercy_mode"
                      ? "bg-mercy-light border-l-4 border-l-mercy border border-mercy/30"
                      : key === "mental_warfare"
                      ? "bg-warfare-light border-l-4 border-l-warfare border border-warfare/30"
                      : "bg-abandon-light border-l-4 border-l-abandon border border-abandon/30"
                    : "border border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600"
                }`}
              >
                <div className="font-serif text-xl mb-2">{difficultyNumerals[key]}</div>
                <div className="font-medium text-stone-900 dark:text-stone-100">{label}</div>
                <div className="text-sm text-stone-500 dark:text-stone-400">{description}</div>
              </button>
            )
          )}
        </div>
      </div>

      {/* Question Types */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
          Question Types
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(questionTypeLabels) as [QuestionType, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleQuestionTypeToggle(key)}
                className={`px-4 py-2 rounded-sm border-2 transition-all text-sm font-medium ${
                  formData.questionTypes.includes(key)
                    ? "bg-primary-500 text-white border-primary-500"
                    : "border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-400 hover:border-primary-400"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Study Material */}
      <Textarea
        label="Study Material"
        value={formData.studyMaterial}
        onChange={(e) =>
          setFormData({ ...formData, studyMaterial: e.target.value })
        }
        placeholder="Paste your notes, textbook content, or any study material here..."
        rows={10}
        helperText="The AI will generate questions based on this content"
        required
      />

      {/* Submit */}
      <Button
        type="submit"
        variant="accent"
        isLoading={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? "Generating Quiz..." : "Generate Quiz"}
      </Button>
    </form>
  );
}
