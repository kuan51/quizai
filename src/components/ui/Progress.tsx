"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "error" | "primary";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      variant = "default",
      size = "md",
      showLabel = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const baseStyles = "w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden";

    const sizes = {
      sm: "h-1.5",
      md: "h-2.5",
      lg: "h-4",
    };

    const barVariants = {
      default: "bg-slate-500 dark:bg-slate-400",
      success: "bg-success",
      warning: "bg-warning",
      error: "bg-error",
      primary: "bg-primary-600",
    };

    return (
      <div className="w-full">
        {showLabel && (
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Progress
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div ref={ref} className={cn(baseStyles, sizes[size], className)} {...props}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              barVariants[variant]
            )}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
