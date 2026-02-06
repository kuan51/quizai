import { Header } from "@/components/dashboard/Header";
import { QuizList } from "@/components/dashboard/QuizList";

export default function DashboardPage() {
  return (
    <div>
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
