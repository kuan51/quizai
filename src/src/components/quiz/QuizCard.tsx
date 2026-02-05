"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";
import type { Difficulty } from "@/types";
import { difficultyLabels } from "@/types";
import { Clock, FileQuestion, Trash2 } from "lucide-react";

interface QuizCardProps {
  id: string;
  title: string;
  description?: string | null;
  questionCount: number;
  difficulty: Difficulty;
  createdAt: Date | string;
  onDelete?: (id: string) => void;
}

export function QuizCard({
  id,
  title,
  description,
  questionCount,
  difficulty,
  createdAt,
  onDelete,
}: QuizCardProps) {
  const difficultyInfo = difficultyLabels[difficulty];
  const difficultyVariant =
    difficulty === "mercy_mode"
      ? "mercy"
      : difficulty === "mental_warfare"
      ? "warfare"
      : "abandon";

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && confirm("Are you sure you want to delete this quiz?")) {
      onDelete(id);
    }
  };

  return (
    <Link href={`/quiz/${id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="pb-3 border-0">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 group-hover:text-primary-600 transition-colors">
              {title}
            </CardTitle>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-slate-400 hover:text-error hover:bg-error-light rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Delete quiz"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          {description && (
            <CardDescription className="line-clamp-2">
              {description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="pt-3">
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <FileQuestion size={16} />
              <span>{questionCount} questions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} />
              <span>{formatRelativeTime(createdAt)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 mt-3">
          <Badge variant={difficultyVariant}>
            <span className="mr-1">{difficultyInfo.emoji}</span>
            {difficultyInfo.label}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
