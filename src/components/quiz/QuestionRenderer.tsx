"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import type { QuestionType } from "@/types";
import { questionTypeLabels } from "@/types";
import { Check, X } from "lucide-react";

interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
}

interface QuestionRendererProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  showResult?: boolean;
  userAnswer?: string | null;
  isCorrect?: boolean | null;
  disabled?: boolean;
}

export function QuestionRenderer({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  showResult = false,
  userAnswer = null,
  isCorrect = null,
  disabled = false,
}: QuestionRendererProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>(
    question.type === "select_all" ? [] : ""
  );
  const [textAnswer, setTextAnswer] = useState("");

  const handleOptionClick = (option: string) => {
    if (disabled || showResult) return;

    if (question.type === "select_all") {
      const currentSelected = selectedAnswer as string[];
      const optionLetter = option.charAt(0);
      if (currentSelected.includes(optionLetter)) {
        setSelectedAnswer(currentSelected.filter((o) => o !== optionLetter));
      } else {
        setSelectedAnswer([...currentSelected, optionLetter]);
      }
    } else {
      const optionLetter = option.charAt(0);
      setSelectedAnswer(optionLetter);
    }
  };

  const handleSubmit = () => {
    if (question.type === "essay" || question.type === "short_answer") {
      onAnswer(textAnswer);
    } else if (question.type === "select_all") {
      onAnswer(JSON.stringify(selectedAnswer));
    } else {
      onAnswer(selectedAnswer as string);
    }
  };

  const isOptionSelected = (option: string) => {
    const optionLetter = option.charAt(0);
    if (question.type === "select_all") {
      return (selectedAnswer as string[]).includes(optionLetter);
    }
    return selectedAnswer === optionLetter;
  };

  const isOptionCorrect = (option: string) => {
    if (!showResult) return null;
    const optionLetter = option.charAt(0);

    if (question.type === "select_all") {
      try {
        const correctAnswers = JSON.parse(question.correctAnswer);
        return correctAnswers.includes(optionLetter);
      } catch {
        return false;
      }
    }

    return question.correctAnswer === optionLetter;
  };

  const wasOptionSelected = (option: string) => {
    if (!userAnswer) return false;
    const optionLetter = option.charAt(0);

    if (question.type === "select_all") {
      try {
        const selectedAnswers = JSON.parse(userAnswer);
        return selectedAnswers.includes(optionLetter);
      } catch {
        return false;
      }
    }

    return userAnswer === optionLetter;
  };

  const getOptionClasses = (option: string) => {
    const base =
      "w-full p-4 text-left rounded-md border transition-all flex items-center gap-3";

    if (showResult) {
      const correct = isOptionCorrect(option);
      const selected = wasOptionSelected(option);

      if (correct) {
        return `${base} border-success bg-success-light/50 text-success-dark`;
      }
      if (selected && !correct) {
        return `${base} border-error bg-error-light/50 text-error-dark`;
      }
      return `${base} border-[var(--border)] opacity-50`;
    }

    if (isOptionSelected(option)) {
      return `${base} border-l-2 border-l-primary-500 bg-primary-50/50 dark:bg-primary-950/50 border-primary-300`;
    }

    return `${base} border-[var(--border)] hover:border-primary-400 cursor-pointer`;
  };

  function getCanSubmit(): boolean {
    switch (question.type) {
      case "essay":
      case "short_answer":
        return textAnswer.trim().length > 0;
      case "select_all":
        return (selectedAnswer as string[]).length > 0;
      default:
        return (selectedAnswer as string).length > 0;
    }
  }
  const canSubmit = getCanSubmit();

  return (
    <Card padding="lg" className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Badge variant="default" size="sm" className="font-mono">
          {questionTypeLabels[question.type]}
        </Badge>
        <span className="font-mono text-xs text-[var(--text-tertiary)]">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Question */}
      <h2 className="font-serif text-2xl leading-relaxed text-[var(--text-primary)] mb-6">
        {question.content}
      </h2>

      {/* Options or Text Input */}
      {question.type === "essay" || question.type === "short_answer" ? (
        <div className="space-y-4">
          {showResult && userAnswer ? (
            <div className="bg-[var(--surface-elevated)] rounded-md p-4">
              <p className="font-mono text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                Your Answer:
              </p>
              <p className="text-[var(--text-primary)]">{userAnswer}</p>
            </div>
          ) : (
            <Textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder={
                question.type === "essay"
                  ? "Write your detailed response here..."
                  : "Write your answer here..."
              }
              rows={question.type === "essay" ? 8 : 4}
              disabled={disabled}
            />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {question.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              disabled={disabled || showResult}
              className={getOptionClasses(option)}
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-sm bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-mono text-xs text-[var(--text-secondary)]">
                {option.charAt(0)}
              </span>
              <span className="flex-1">{option}</span>
              {showResult && isOptionCorrect(option) && (
                <Check className="text-success" size={20} />
              )}
              {showResult && wasOptionSelected(option) && !isOptionCorrect(option) && (
                <X className="text-error" size={20} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Result feedback */}
      {showResult && (
        <div
          className={`mt-6 p-4 rounded-md ${
            isCorrect
              ? "bg-success-light border border-success"
              : "bg-error-light border border-error"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <>
                <Check className="text-success-dark" size={20} />
                <span className="font-medium text-success-dark">Correct!</span>
              </>
            ) : (
              <>
                <X className="text-error-dark" size={20} />
                <span className="font-medium text-error-dark">Incorrect</span>
              </>
            )}
          </div>
          {question.explanation && (
            <p className="font-serif italic text-sm text-[var(--text-secondary)]">
              {question.explanation}
            </p>
          )}
        </div>
      )}

      {/* Submit button */}
      {!showResult && !disabled && (
        <div className="mt-6">
          <Button variant="accent" onClick={handleSubmit} disabled={!canSubmit} className="w-full">
            Submit Answer
          </Button>
        </div>
      )}
    </Card>
  );
}
