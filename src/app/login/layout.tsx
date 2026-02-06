import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left decorative panel - hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-primary-950 relative overflow-hidden items-center justify-center p-12">
        {/* Decorative shapes */}
        <div className="absolute top-20 left-16 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute bottom-32 right-20 w-48 h-48 rounded-lg bg-white/[0.03] rotate-12" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-primary-400/10" />

        <div className="relative z-10 max-w-md">
          <p className="font-serif text-4xl lg:text-5xl text-white/90 leading-tight">
            Study with intent.
            <br />
            Learn with precision.
          </p>
          <p className="text-sm text-white/40 mt-8 tracking-wider uppercase">
            QuizAI
          </p>
        </div>
      </div>

      {/* Right content panel */}
      <div className="flex-1 flex flex-col bg-[var(--background)]">
        {/* Mobile header */}
        <header className="md:hidden p-6">
          <Link
            href="/"
            className="font-serif text-xl text-[var(--text-primary)]"
          >
            QuizAI
          </Link>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="p-6 text-center md:text-left">
          <p className="text-xs text-[var(--text-tertiary)]">
            &copy; {new Date().getFullYear()} QuizAI
          </p>
        </footer>
      </div>
    </div>
  );
}
