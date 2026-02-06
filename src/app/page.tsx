import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sparkles, Gauge, LayoutGrid } from "lucide-react";
import { AIGenerationAnimation } from "@/components/landing/AIGenerationAnimation";

export default async function LandingPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div
      className="h-screen overflow-hidden relative"
      style={{
        background:
          "linear-gradient(135deg, #2d1b69 0%, #1a1145 25%, #0f2027 50%, #0d9488 75%, #d97706 100%)",
      }}
    >
      {/* Background atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Pulsing radial glows */}
        <div
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full landing-glow-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full landing-glow-pulse-delayed"
          style={{
            background:
              "radial-gradient(circle, rgba(13, 148, 136, 0.2) 0%, transparent 70%)",
          }}
        />

        {/* Noise texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.04,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
          }}
        />
      </div>

      {/* Content layer */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-10 pt-5 pb-4">
          <Link
            href="/"
            className="font-serif text-xl text-white/80 hover:text-white transition-colors duration-300 animate-fade-down landing-stagger-1"
          >
            QuizAI
          </Link>
          <Link
            href="/login"
            className="text-sm text-white/60 border border-white/15 rounded-full px-4 py-1.5 backdrop-blur-sm hover:bg-white/10 hover:text-white/80 transition-all duration-300 animate-fade-down landing-stagger-1"
          >
            Sign In
          </Link>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center px-6 md:px-10">
          <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-8 lg:gap-16">
            {/* Left column — Hero */}
            <div className="md:w-[45%] text-center md:text-left">
              <h1
                className="font-serif leading-[1.05] tracking-tight text-white animate-fade-up landing-stagger-2"
                style={{ fontSize: "clamp(2.75rem, 6vw, 5.5rem)" }}
              >
                Transform your
                <br />
                notes into
                <br />
                <span className="relative inline-block">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 blur-2xl opacity-40 select-none"
                    style={{
                      background:
                        "linear-gradient(90deg, #c084fc, #fbbf24)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    brilliance.
                  </span>
                  <span
                    style={{
                      background:
                        "linear-gradient(90deg, #c084fc, #2dd4bf, #fbbf24)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    brilliance.
                  </span>
                </span>
              </h1>

              <p className="text-base md:text-lg text-white/55 max-w-md mt-5 md:mt-6 mx-auto md:mx-0 animate-fade-up landing-stagger-3">
                AI-powered quizzes that adapt to how you learn.
              </p>

              <div className="flex flex-col items-center md:items-start gap-3 mt-7 md:mt-8">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 font-semibold text-white transition-all duration-300 hover:scale-[1.03] animate-fade-up landing-stagger-4"
                  style={{
                    background: "linear-gradient(135deg, #7b4f94, #0d9488)",
                    boxShadow:
                      "0 0 20px rgba(123, 79, 148, 0.3), 0 0 60px rgba(13, 148, 136, 0.15)",
                  }}
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="text-sm text-white/35 hover:text-white/55 underline underline-offset-4 decoration-white/20 transition-colors duration-300 animate-fade-up landing-stagger-5"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </div>

            {/* Right column — Animation */}
            <div className="hidden md:block md:w-[55%] relative">
              {/* Bokeh orbs */}
              <div className="absolute -top-16 -left-10 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl landing-orb-1" />
              <div className="absolute -bottom-12 -right-8 w-40 h-40 rounded-full bg-teal-400/15 blur-3xl landing-orb-2" />
              <div className="absolute top-1/2 -right-16 w-36 h-36 rounded-full bg-amber-500/15 blur-3xl landing-orb-3" />

              {/* Glassmorphic animation panel */}
              <div className="relative z-10 bg-white/[0.07] border border-white/[0.12] rounded-2xl backdrop-blur-md p-6 lg:p-8 landing-float animate-fade-in landing-stagger-3">
                <AIGenerationAnimation />
              </div>
            </div>
          </div>
        </main>

        {/* Bottom feature pills */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 px-6 pb-6 md:pb-8">
          {[
            { icon: Sparkles, label: "AI-Powered" },
            { icon: Gauge, label: "Adaptive Difficulty" },
            { icon: LayoutGrid, label: "5+ Question Types" },
          ].map((pill, i) => (
            <div
              key={pill.label}
              className={`flex items-center gap-2 bg-white/[0.07] border border-white/[0.10] rounded-full px-4 py-2 backdrop-blur-sm hover:bg-white/[0.12] transition-all duration-300 animate-fade-up`}
              style={{ animationDelay: `${0.9 + i * 0.1}s` }}
            >
              <pill.icon size={14} className="text-white/50" />
              <span className="text-[13px] text-white/55 font-medium">
                {pill.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
