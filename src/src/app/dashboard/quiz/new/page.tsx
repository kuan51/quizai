import { Header } from "@/components/dashboard/Header";
import { QuizForm } from "@/components/quiz/QuizForm";

export default function NewQuizPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        title="Create New Quiz"
        description="Generate an AI-powered quiz from your study material"
      />
      <main className="p-6">
        <QuizForm />
      </main>
    </div>
  );
}
