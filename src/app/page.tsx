import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default async function LandingPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--background)] noise-overlay">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm bg-[var(--background)]/80 border-b border-[var(--border-subtle)] animate-fade-down">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-xl text-[var(--text-primary)]"
          >
            QuizAI
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-5 gap-12 items-center">
          {/* Left Column */}
          <div className="md:col-span-3">
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-[var(--text-primary)] animate-fade-up stagger-1">
              Study with
              <br />
              <span className="bg-accent-200/50 dark:bg-accent-700/30 px-2 -mx-1">
                precision.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-xl mt-6 animate-fade-up stagger-2">
              Transform your notes into AI-powered quizzes. Master any subject
              with adaptive difficulty.
            </p>
            <div className="flex gap-4 mt-8 animate-fade-up stagger-3">
              <Link href="/login">
                <Button variant="accent" size="lg">
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="ghost" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column — Decorative */}
          <div className="md:col-span-2 hidden md:flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-sm animate-fade-in stagger-5">
              <div className="absolute top-[10%] left-[5%] w-3/4 h-3/4 rounded-2xl bg-primary-200/20 dark:bg-primary-500/10 rotate-6" />
              <div className="absolute top-[20%] left-[15%] w-2/3 h-2/3 rounded-2xl bg-accent-200/20 dark:bg-accent-500/10 -rotate-3" />
              <div className="absolute top-[15%] left-[20%] w-1/2 h-1/2 rounded-2xl bg-stone-200/30 dark:bg-stone-500/10 rotate-12" />
              <div className="absolute bottom-[10%] right-[10%] w-2/5 h-2/5 rounded-2xl bg-primary-300/15 dark:bg-primary-400/10 -rotate-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-6 py-24 md:py-32 border-t border-[var(--border-subtle)]"
      >
        {(() => {
          const features = [
            {
              num: "01",
              label: "AI Generation",
              title: "AI-Powered Generation",
              description:
                "Advanced AI analyzes your study material and creates relevant, challenging questions that test deep understanding.",
              stagger: "stagger-1",
              colSpan: "md:col-span-2",
            },
            {
              num: "02",
              label: "Adaptive Learning",
              title: "Adaptive Difficulty",
              description:
                "Three distinct modes from gentle introduction to expert-level challenge, adapting to your knowledge level.",
              stagger: "stagger-2",
            },
            {
              num: "03",
              label: "Question Formats",
              title: "Multiple Formats",
              description:
                "Diverse question types including multiple choice, true/false, short answer, essay, and select-all-that-apply.",
              stagger: "stagger-3",
              colSpan: "md:col-span-3",
            },
          ];

          return (
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.num}
                  className={`${feature.colSpan ?? ""} bg-[var(--surface)] border border-[var(--border)] border-l-2 border-l-primary-500 rounded-lg p-8 animate-fade-up ${feature.stagger}`}
                >
                  <p className="font-mono text-xs text-primary-500 uppercase tracking-widest mb-3">
                    {feature.num} — {feature.label}
                  </p>
                  <h3 className="font-serif text-xl text-[var(--text-primary)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* Difficulty Modes Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32 border-t border-[var(--border-subtle)]">
        <h2 className="font-serif text-4xl md:text-5xl text-center text-[var(--text-primary)] mb-16">
          Choose Your Challenge
        </h2>
        {(() => {
          const difficultyModes = [
            {
              numeral: "I",
              name: "Mercy Mode",
              description:
                "A gentle introduction for building confidence. Straightforward questions with helpful context to ease you into the material.",
              borderColor: "border-t-mercy",
            },
            {
              numeral: "II",
              name: "Warfare Mode",
              description:
                "Balanced rigor for serious learners. Multi-layered questions that demand genuine comprehension and analytical thinking.",
              borderColor: "border-t-warfare",
            },
            {
              numeral: "III",
              name: "Abandon Mode",
              description:
                "Uncompromising difficulty for those who accept nothing less than mastery. Expect nuance, edge cases, and expert-level depth.",
              borderColor: "border-t-abandon",
              isLast: true,
            },
          ];

          return (
            <div className="grid md:grid-cols-3">
              {difficultyModes.map((mode) => (
                <div
                  key={mode.numeral}
                  className={`p-8 ${mode.isLast ? "" : "border-b md:border-b-0 md:border-r border-[var(--border)]"} border-t-2 ${mode.borderColor}`}
                >
                  <p className="font-serif text-3xl text-[var(--text-tertiary)]">
                    {mode.numeral}
                  </p>
                  <h3 className="font-serif text-xl text-[var(--text-primary)] mt-4">
                    {mode.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {mode.description}
                  </p>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* CTA Section */}
      <section className="bg-primary-950 py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-white">
            Ready to study smarter?
          </h2>
          <p className="text-white/60 mt-4 text-lg">
            Join students using AI to master their subjects.
          </p>
          <div className="mt-8">
            <Link href="/login">
              <Button variant="accent" size="lg">
                Start Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-[var(--border-subtle)] flex justify-between items-center">
        <span className="font-serif text-lg text-[var(--text-secondary)]">
          QuizAI
        </span>
        <span className="text-xs text-[var(--text-tertiary)]">
          &copy; {new Date().getFullYear()} QuizAI. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
