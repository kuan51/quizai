import Link from "next/link";

interface LogoProps {
  size?: string;
  href?: string;
  className?: string;
  linkClassName?: string;
  bgClassName?: string;
  showText?: boolean;
  textClassName?: string;
}

export function Logo({
  size = "h-[4.5rem]",
  href,
  className = "",
  linkClassName = "",
  bgClassName = "bg-[var(--logo-bg)]",
  showText = true,
  textClassName = "text-xl text-[var(--text-primary)]",
}: LogoProps) {
  const lockup = (
    <div className="inline-flex items-center gap-3">
      <div
        className={`rounded-full ${bgClassName} p-2 inline-flex items-center justify-center shrink-0 ${size} ${className}`}
      >
        <img
          src="/quizai-logo-sm.svg"
          alt="QuizAI"
          className="h-3/4 w-auto"
        />
      </div>
      {showText && (
        <span className={`font-sans font-bold ${textClassName}`}>QuizAI</span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={linkClassName}>
        {lockup}
      </Link>
    );
  }

  return lockup;
}
