import Link from "next/link";

interface LogoProps {
  size?: string;
  href?: string;
  className?: string;
  linkClassName?: string;
  bgClassName?: string;
}

export function Logo({
  size = "h-[4.5rem]",
  href,
  className = "",
  linkClassName = "",
  bgClassName = "bg-[var(--logo-bg)]",
}: LogoProps) {
  const logo = (
    <div
      className={`rounded-full ${bgClassName} p-2 inline-flex items-center justify-center shrink-0 ${size} ${className}`}
    >
      <img
        src="/quizai-logo-sm.svg"
        alt="QuizAI"
        className="h-3/4 w-auto"
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={linkClassName}>
        {logo}
      </Link>
    );
  }

  return logo;
}
