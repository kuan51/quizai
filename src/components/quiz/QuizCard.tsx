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
  const difficultyMap = {
    mercy_mode: { variant: "mercy" as const, border: "border-l-mercy" },
    mental_warfare: { variant: "warfare" as const, border: "border-l-warfare" },
    abandon_all_hope: { variant: "abandon" as const, border: "border-l-abandon" },
  };
  const { variant: difficultyVariant, border: borderColorClass } = difficultyMap[difficulty];

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && confirm("Are you sure you want to delete this quiz?")) {
      onDelete(id);
    }
  };

  return (
    <Link href={`/dashboard/quiz/${id}`}>
      <Card className={`h-full border-l-2 ${borderColorClass} hover:translate-y-[-2px] hover:shadow-editorial transition-all duration-300 cursor-pointer group`}>
        <CardHeader className="pb-3 border-0">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-serif text-lg line-clamp-2 group-hover:text-primary-600 transition-colors">
              {title}
            </CardTitle>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-stone-300 hover:text-error hover:bg-error-light rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
          <div className="flex items-center gap-4 font-mono text-xs text-[var(--text-tertiary)] tracking-wider">
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
            {difficultyInfo.label}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
