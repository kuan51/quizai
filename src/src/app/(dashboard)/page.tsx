import { Header } from "@/components/dashboard/Header";
import { QuizList } from "@/components/dashboard/QuizList";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        title="Dashboard"
        description="Manage your AI-generated quizzes"
      />
      <main className="p-6">
        <QuizList />
      </main>
    </div>
  );
}
