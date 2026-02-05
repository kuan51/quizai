"use client";

import { useState, useEffect, use } from "react";
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

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
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
  };

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header title="Quiz Not Found" />
        <main className="p-6">
          <Card padding="lg" className="max-w-lg mx-auto text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header title="Quiz Complete" />
        <main className="p-6">
          <Card padding="lg" className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <Trophy size={40} className="text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {quiz.title}
              </h2>
              <DifficultyIndicator difficulty={quiz.difficulty} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                <p className="text-4xl font-bold text-primary-600 mb-1">
                  {percentage}%
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Score</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                <p className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {correctCount}/{totalQuestions}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Correct</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 mb-8">
              <Clock size={20} />
              <span>
                Time: {minutes > 0 ? `${minutes}m ` : ""}
                {seconds}s
              </span>
            </div>

            {/* Performance message */}
            <div
              className={`p-4 rounded-xl mb-8 text-center ${
                percentage >= 80
                  ? "bg-success-light text-success-dark"
                  : percentage >= 60
                  ? "bg-warning-light text-warning-dark"
                  : "bg-error-light text-error-dark"
              }`}
            >
              {percentage >= 80
                ? "Excellent work! You really know this material!"
                : percentage >= 60
                ? "Good job! Keep studying to improve further."
                : "Keep practicing! Review the material and try again."}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header title={quiz.title} />
      <main className="p-6">
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-2">
            <DifficultyIndicator difficulty={quiz.difficulty} size="sm" />
            <Badge variant="default">
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
        <QuestionRenderer
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={quiz.questions.length}
          onAnswer={handleAnswer}
          showResult={showResult}
          userAnswer={currentAnswer?.userAnswer}
          isCorrect={currentAnswer?.isCorrect}
          disabled={showResult}
        />

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
