"use client";

import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";
import { difficultyLabels } from "@/types";

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

  const sizeClasses = {
    sm: "text-xs gap-1",
    md: "text-sm gap-1.5",
    lg: "text-base gap-2",
  };

  const iconSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case "mercy_mode":
        return "text-mercy-dark dark:text-mercy";
      case "mental_warfare":
        return "text-warfare-dark dark:text-warfare";
      case "abandon_all_hope":
        return "text-abandon-dark dark:text-abandon";
    }
  };

  const getDifficultyBgColor = () => {
    switch (difficulty) {
      case "mercy_mode":
        return "bg-mercy-light dark:bg-mercy/20";
      case "mental_warfare":
        return "bg-warfare-light dark:bg-warfare/20";
      case "abandon_all_hope":
        return "bg-abandon-light dark:bg-abandon/20";
    }
  };

  // Calculate bar segments for visual indicator
  const getSegments = () => {
    const baseSegments = {
      mercy_mode: 1,
      mental_warfare: 2,
      abandon_all_hope: 3,
    };
    return baseSegments[difficulty];
  };

  return (
    <div className={cn("flex items-center", sizeClasses[size])}>
      <span className={iconSizes[size]}>{difficultyInfo.emoji}</span>
      <span className={cn("font-medium", getDifficultyColor())}>
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
              segment <= getSegments()
                ? getDifficultyBgColor()
                : "bg-slate-200 dark:bg-slate-700"
            )}
          />
        ))}
      </div>

      {/* Adaptive score display */}
      {showScore && score !== undefined && (
        <span className="ml-2 text-slate-500 dark:text-slate-400">
          ({Math.round(score * 100)}%)
        </span>
      )}
    </div>
  );
}

// Compact difficulty badge for lists
export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  const difficultyInfo = difficultyLabels[difficulty];

  const getBadgeClasses = () => {
    switch (difficulty) {
      case "mercy_mode":
        return "bg-mercy text-white";
      case "mental_warfare":
        return "bg-warfare text-white";
      case "abandon_all_hope":
        return "bg-abandon text-white";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        getBadgeClasses(),
        className
      )}
    >
      <span>{difficultyInfo.emoji}</span>
      <span>{difficultyInfo.label}</span>
    </span>
  );
}
