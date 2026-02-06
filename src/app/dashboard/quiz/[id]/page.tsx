"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { QuestionRenderer } from "@/components/quiz/QuestionRenderer";
import { DifficultyIndicator } from "@/components/quiz/DifficultyIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import type { Difficulty, QuestionType } from "@/types";
import { ArrowLeft, ArrowRight, RotateCcw, Trophy, Clock } from "lucide-react";

interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  difficulty: number;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  difficulty: Difficulty;
  questionCount: number;
  questions: Question[];
}

interface Answer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

function getPerformanceFeedback(percentage: number): { className: string; message: string } {
  if (percentage >= 80) {
    return { className: "bg-success-light text-success-dark", message: "Excellent work! You really know this material!" };
  }
  if (percentage >= 60) {
    return { className: "bg-warning-light text-warning-dark", message: "Good job! Keep studying to improve further." };
  }
  return { className: "bg-error-light text-error-dark", message: "Keep practicing! Review the material and try again." };
}

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const fetchQuiz = useCallback(async () => {
    try {
      const response = await fetch(`/api/quizzes/${id}`);
      if (!response.ok) {
        throw new Error("Quiz not found");
      }
      const data = await response.json();
      setQuiz(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleAnswer = (answer: string) => {
    if (!quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    let isCorrect = false;

    // Check correctness based on question type
    if (currentQuestion.type === "select_all") {
      try {
        const correctAnswers = JSON.parse(currentQuestion.correctAnswer);
        const userAnswers = JSON.parse(answer);
        isCorrect =
          correctAnswers.length === userAnswers.length &&
          correctAnswers.every((a: string) => userAnswers.includes(a));
      } catch {
        isCorrect = false;
      }
    } else if (currentQuestion.type === "essay" || currentQuestion.type === "short_answer") {
      // For essay/short answer, we'll mark as correct for now
      // In a real implementation, this would use AI grading
      isCorrect = true;
    } else {
      isCorrect =
        answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    }

    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        userAnswer: answer,
        isCorrect,
      },
    ]);
    setShowResult(true);
  };

  const handleNext = () => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResult(false);
    setQuizCompleted(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div>
        <Header title="Quiz Not Found" />
        <main className="p-6">
          <Card padding="lg" className="max-w-lg mx-auto text-center">
            <p className="text-[var(--text-secondary)] mb-4">
              {error || "This quiz could not be found."}
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft size={20} />
              Back to Dashboard
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  // Quiz completed view
  if (quizCompleted) {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    return (
      <div>
        <Header title="Quiz Complete" />
        <main className="p-6">
          <Card padding="lg" className="max-w-2xl mx-auto">
            <div className="animate-fade-up stagger-1 text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent-100 dark:bg-accent-700/20 flex items-center justify-center">
                <Trophy size={40} className="text-accent-500" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                {quiz.title}
              </h2>
              <DifficultyIndicator difficulty={quiz.difficulty} />
            </div>

            <div className="animate-fade-up stagger-2 grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-lg bg-[var(--surface-elevated)] text-center">
                <p className="font-serif text-5xl font-bold text-primary-600 mb-1">
                  {percentage}%
                </p>
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--text-tertiary)]">Score</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--surface-elevated)] text-center">
                <p className="font-mono text-2xl font-bold text-[var(--text-primary)] mb-1">
                  {correctCount}/{totalQuestions}
                </p>
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--text-tertiary)]">Correct</p>
              </div>
            </div>

            <div className="animate-fade-up stagger-3 flex items-center justify-center gap-2 text-[var(--text-tertiary)] mb-8">
              <Clock size={20} />
              <span className="font-mono text-sm text-[var(--text-tertiary)]">
                Time: {minutes > 0 ? `${minutes}m ` : ""}
                {seconds}s
              </span>
            </div>

            {/* Performance message */}
            {(() => {
              const feedback = getPerformanceFeedback(percentage);
              return (
                <div className={`animate-fade-up stagger-4 p-4 rounded-lg mb-8 text-center font-serif italic ${feedback.className}`}>
                  {feedback.message}
                </div>
              );
            })()}

            <div className="animate-fade-up stagger-5 flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleRestart}
              >
                <RotateCcw size={20} />
                Try Again
              </Button>
              <Button
                className="flex-1"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id);

  return (
    <div>
      <Header title={quiz.title} />
      <main className="p-6">
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-2">
            <DifficultyIndicator difficulty={quiz.difficulty} size="sm" />
            <Badge variant="default" className="font-mono">
              {currentQuestionIndex + 1} of {quiz.questions.length}
            </Badge>
          </div>
          <Progress
            value={currentQuestionIndex + 1}
            max={quiz.questions.length}
            variant="primary"
          />
        </div>

        {/* Question */}
        <div key={currentQuestionIndex} className="animate-fade-up">
          <QuestionRenderer
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={quiz.questions.length}
            onAnswer={handleAnswer}
            showResult={showResult}
            userAnswer={currentAnswer?.userAnswer}
            isCorrect={currentAnswer?.isCorrect}
            disabled={showResult}
          />
        </div>

        {/* Navigation */}
        {showResult && (
          <div className="max-w-3xl mx-auto mt-6">
            <Button onClick={handleNext} className="w-full">
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight size={20} />
                </>
              ) : (
                <>
                  See Results
                  <Trophy size={20} />
                </>
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
