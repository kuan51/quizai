import type { Difficulty } from "@/types";

interface AnswerHistory {
  questionId: string;
  isCorrect: boolean;
  difficulty: number;
  questionType: string;
}

export function calculateNextDifficulty(
  baseDifficulty: Difficulty,
  answerHistory: AnswerHistory[]
): number {
  const baseLevels = {
    mercy_mode: { min: 0.1, base: 0.3, max: 0.5 },
    mental_warfare: { min: 0.4, base: 0.6, max: 0.8 },
    abandon_all_hope: { min: 0.7, base: 0.85, max: 1.0 },
  };

  const level = baseLevels[baseDifficulty];

  if (answerHistory.length === 0) return level.base;

  // Weight recent answers more heavily (exponential decay)
  const recentAnswers = answerHistory.slice(-10);
  let weightedScore = 0;
  let totalWeight = 0;

  recentAnswers.forEach((answer, index) => {
    const weight = Math.pow(1.5, index); // More recent = higher weight
    weightedScore += (answer.isCorrect ? 1 : 0) * weight;
    totalWeight += weight;
  });

  const performanceRatio = weightedScore / totalWeight;

  // Calculate difficulty adjustment
  // Good performance (>70% correct) increases difficulty
  // Poor performance (<30% correct) decreases difficulty
  let adjustment = 0;
  if (performanceRatio > 0.7) {
    adjustment = (performanceRatio - 0.7) * 0.5; // Increase
  } else if (performanceRatio < 0.3) {
    adjustment = (performanceRatio - 0.3) * 0.5; // Decrease
  }

  const newDifficulty = level.base + adjustment;

  // Clamp to difficulty level bounds
  return Math.max(level.min, Math.min(level.max, newDifficulty));
}

// Streak-based bonus/penalty
export function getStreakModifier(
  consecutiveCorrect: number,
  consecutiveWrong: number
): number {
  if (consecutiveCorrect >= 5) return 0.1; // Hot streak: harder questions
  if (consecutiveCorrect >= 3) return 0.05;
  if (consecutiveWrong >= 5) return -0.1; // Cold streak: easier questions
  if (consecutiveWrong >= 3) return -0.05;
  return 0;
}

// Calculate overall performance metrics
export function calculatePerformanceMetrics(answerHistory: AnswerHistory[]) {
  if (answerHistory.length === 0) {
    return {
      overallAccuracy: 0,
      recentAccuracy: 0,
      streakType: "none" as const,
      streakLength: 0,
      improvementTrend: 0,
    };
  }

  // Overall accuracy
  const correctCount = answerHistory.filter((a) => a.isCorrect).length;
  const overallAccuracy = correctCount / answerHistory.length;

  // Recent accuracy (last 5)
  const recent = answerHistory.slice(-5);
  const recentCorrect = recent.filter((a) => a.isCorrect).length;
  const recentAccuracy = recentCorrect / recent.length;

  // Current streak
  let streakType: "correct" | "wrong" | "none" = "none";
  let streakLength = 0;

  if (answerHistory.length > 0) {
    const lastAnswer = answerHistory[answerHistory.length - 1];
    streakType = lastAnswer.isCorrect ? "correct" : "wrong";
    streakLength = 1;

    for (let i = answerHistory.length - 2; i >= 0; i--) {
      if (answerHistory[i].isCorrect === lastAnswer.isCorrect) {
        streakLength++;
      } else {
        break;
      }
    }
  }

  // Improvement trend (comparing first half to second half)
  let improvementTrend = 0;
  if (answerHistory.length >= 4) {
    const midpoint = Math.floor(answerHistory.length / 2);
    const firstHalf = answerHistory.slice(0, midpoint);
    const secondHalf = answerHistory.slice(midpoint);

    const firstHalfAccuracy =
      firstHalf.filter((a) => a.isCorrect).length / firstHalf.length;
    const secondHalfAccuracy =
      secondHalf.filter((a) => a.isCorrect).length / secondHalf.length;

    improvementTrend = secondHalfAccuracy - firstHalfAccuracy;
  }

  return {
    overallAccuracy,
    recentAccuracy,
    streakType,
    streakLength,
    improvementTrend,
  };
}

// Get encouraging message based on performance
export function getPerformanceMessage(metrics: ReturnType<typeof calculatePerformanceMetrics>): string {
  const { overallAccuracy, streakType, streakLength, improvementTrend } = metrics;

  if (streakType === "correct" && streakLength >= 5) {
    return "You're on fire! Keep up the amazing work!";
  }

  if (streakType === "correct" && streakLength >= 3) {
    return "Great streak! You're really getting the hang of this!";
  }

  if (streakType === "wrong" && streakLength >= 3) {
    return "Don't worry, everyone has tough moments. Take your time with each question.";
  }

  if (improvementTrend > 0.2) {
    return "Fantastic improvement! Your hard work is paying off!";
  }

  if (overallAccuracy >= 0.8) {
    return "Excellent performance! You really know this material!";
  }

  if (overallAccuracy >= 0.6) {
    return "Good progress! Keep studying and you'll master this!";
  }

  return "Keep going! Every question is a learning opportunity!";
}
