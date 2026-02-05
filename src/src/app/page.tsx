import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Sparkles, Brain, Target, Zap, ArrowRight } from "lucide-react";

export default async function Home() {
  const session = await auth();

  // Redirect to dashboard if already logged in
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-gradient-dark">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">QuizAI</span>
        </Link>
        <Link href="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Turn Your Study Material into
            <span className="text-transparent bg-clip-text bg-gradient-primary">
              {" "}
              AI-Powered Quizzes
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            Paste your notes, textbook content, or any study material and let AI generate
            personalized quizzes to help you ace your exams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Why Choose QuizAI?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-6">
                <Brain size={28} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                AI-Powered Generation
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Our advanced AI analyzes your study material and creates relevant, challenging
                questions that test your understanding.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-6">
                <Target size={28} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Adaptive Difficulty
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Choose from three difficulty modes: Mercy Mode for beginners, Mental Warfare for
                a challenge, or Abandon All Hope for experts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-6">
                <Zap size={28} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Multiple Question Types
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Get diverse question formats including multiple choice, true/false, short answer,
                essay, and select all that apply.
              </p>
            </div>
          </div>
        </section>

        {/* Difficulty Modes Section */}
        <section className="mt-32">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Choose Your Challenge
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Mercy Mode */}
            <div className="p-6 rounded-2xl bg-mercy-light dark:bg-mercy/20 border-2 border-mercy">
              <div className="text-4xl mb-4">😇</div>
              <h3 className="text-xl font-semibold text-mercy-dark dark:text-mercy mb-2">
                Mercy Mode
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Perfect for beginners. Clear questions with helpful hints to build your confidence.
              </p>
            </div>

            {/* Mental Warfare */}
            <div className="p-6 rounded-2xl bg-warfare-light dark:bg-warfare/20 border-2 border-warfare">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-warfare-dark dark:text-warfare mb-2">
                Mental Warfare
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                For serious learners. Challenging questions that push your understanding.
              </p>
            </div>

            {/* Abandon All Hope */}
            <div className="p-6 rounded-2xl bg-abandon-light dark:bg-abandon/20 border-2 border-abandon">
              <div className="text-4xl mb-4">💀</div>
              <h3 className="text-xl font-semibold text-abandon-dark dark:text-abandon mb-2">
                Abandon All Hope
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Expert level only. Brutal questions with no mercy. True mastery required.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-32 text-center">
          <div className="p-12 rounded-3xl bg-gradient-primary">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Study Sessions?
            </h2>
            <p className="text-white/90 mb-8 max-w-xl mx-auto">
              Join students who are using AI to study smarter, not harder.
            </p>
            <Link href="/login">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-primary-600 hover:bg-slate-100"
              >
                Start Studying Smarter
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 mt-20 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">QuizAI</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Powered by AI. Built for learners.
          </p>
        </div>
      </footer>
    </div>
  );
}
