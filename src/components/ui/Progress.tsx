import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "primary";
  size?: "sm" | "md" | "lg";
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    { className, value, max = 100, variant = "primary", size = "md", ...props },
    ref,
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const baseStyles =
      "w-full bg-stone-100 dark:bg-stone-800 rounded-sm overflow-hidden";

    const sizes = {
      sm: "h-1",
      md: "h-1.5",
      lg: "h-2.5",
    };

    const barVariants = {
      primary: "bg-gradient-to-r from-primary-500 to-primary-400",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, sizes[size], className)}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-sm transition-all duration-500 ease-out",
            barVariants[variant],
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    );
  },
);

Progress.displayName = "Progress";

export { Progress };
