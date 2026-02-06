"use client";

import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";
import { difficultyLabels } from "@/types";

const difficultyConfig = {
  mercy_mode: { color: "text-mercy-dark dark:text-mercy", bg: "bg-mercy-light dark:bg-mercy/20", segments: 1 },
  mental_warfare: { color: "text-warfare-dark dark:text-warfare", bg: "bg-warfare-light dark:bg-warfare/20", segments: 2 },
  abandon_all_hope: { color: "text-abandon-dark dark:text-abandon", bg: "bg-abandon-light dark:bg-abandon/20", segments: 3 },
} as const;

interface DifficultyIndicatorProps {
  difficulty: Difficulty;
  score?: number; // 0-1 adaptive difficulty score
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
}

export function DifficultyIndicator({
  difficulty,
  score,
  showScore = false,
  size = "md",
}: DifficultyIndicatorProps) {
  const difficultyInfo = difficultyLabels[difficulty];
  const config = difficultyConfig[difficulty];

  const sizeClasses = {
    sm: "text-xs gap-1",
    md: "text-sm gap-1.5",
    lg: "text-base gap-2",
  };

  return (
    <div className={cn("flex items-center", sizeClasses[size])}>
      <span className={cn("font-sans font-medium", config.color)}>
        {difficultyInfo.label}
      </span>

      {/* Difficulty bars */}
      <div className="flex gap-0.5 ml-2">
        {[1, 2, 3].map((segment) => (
          <div
            key={segment}
            className={cn(
              "rounded-sm transition-colors",
              size === "sm" ? "w-1 h-2" : size === "md" ? "w-1.5 h-3" : "w-2 h-4",
              segment <= config.segments
                ? config.bg
                : "bg-stone-200 dark:bg-stone-700"
            )}
          />
        ))}
      </div>

      {/* Adaptive score display */}
      {showScore && score !== undefined && (
        <span className="ml-2 font-mono text-xs text-[var(--text-tertiary)]">
          ({Math.round(score * 100)}%)
        </span>
      )}
    </div>
  );
}
