import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SessionProvider } from "next-auth/react";
import { QuizDataProvider } from "@/contexts/QuizDataContext";
import { db } from "@/lib/db";
import { quizzes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { QuizSummary } from "@/contexts/QuizDataContext";
import { logger } from "@/lib/logger";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login");
  }

  // Additional safety check: ensure session has user.id
  if (!session.user?.id) {
    logger.error({
      message: "Session exists but missing user.id - forcing re-authentication",
      metadata: {
        hasSession: !!session,
        hasUser: !!session.user,
        userId: session.user?.id
      }
    });
    redirect("/login");
  }

  // Fetch quizzes server-side — single source of truth for Sidebar and QuizList
  const userQuizzes = await db()
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      questionCount: quizzes.questionCount,
      difficulty: quizzes.difficulty,
      createdAt: quizzes.createdAt,
    })
    .from(quizzes)
    .where(eq(quizzes.userId, session.user.id))
    .orderBy(desc(quizzes.createdAt))
    .limit(100);

  // Serialize dates for client components
  const serializedQuizzes: QuizSummary[] = userQuizzes.map((q) => ({
    ...q,
    createdAt: q.createdAt instanceof Date ? q.createdAt.toISOString() : String(q.createdAt),
  }));

  return (
    <SessionProvider session={session}>
      <QuizDataProvider initialQuizzes={serializedQuizzes}>
        <div className="flex h-screen overflow-hidden noise-overlay">
          <Sidebar />
          <div className="flex-1 overflow-auto bg-[var(--background)]">
            {children}
          </div>
        </div>
      </QuizDataProvider>
    </SessionProvider>
  );
}
