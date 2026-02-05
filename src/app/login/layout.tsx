import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-gradient-dark flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">QuizAI</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Powered by AI. Built for learners.
        </p>
      </footer>
    </div>
  );
}
