import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "mercy" | "warfare" | "abandon";
  size?: "sm" | "md";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant = "default", size = "md", children, ...props },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center font-medium rounded-sm transition-colors uppercase tracking-wider";

    const variants = {
      default:
        "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
      mercy: "bg-mercy-light text-mercy-dark",
      warfare: "bg-warfare-light text-warfare-dark",
      abandon: "bg-abandon-light text-abandon-dark",
    };

    const sizes = {
      sm: "text-[11px] px-2 py-0.5",
      md: "text-xs px-3 py-1",
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";

export { Badge };
