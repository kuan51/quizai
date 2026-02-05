"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "mercy" | "warfare" | "abandon";
  size?: "sm" | "md" | "lg";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center font-medium rounded-full transition-colors";

    const variants = {
      default:
        "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
      success:
        "bg-success-light text-success-dark dark:bg-success/20 dark:text-success",
      warning:
        "bg-warning-light text-warning-dark dark:bg-warning/20 dark:text-warning",
      error:
        "bg-error-light text-error-dark dark:bg-error/20 dark:text-error",
      mercy:
        "bg-mercy-light text-mercy-dark dark:bg-mercy/20 dark:text-mercy",
      warfare:
        "bg-warfare-light text-warfare-dark dark:bg-warfare/20 dark:text-warfare",
      abandon:
        "bg-abandon-light text-abandon-dark dark:bg-abandon/20 dark:text-abandon",
    };

    const sizes = {
      sm: "text-xs px-2 py-0.5",
      md: "text-sm px-3 py-1",
      lg: "text-base px-4 py-1.5",
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
  }
);

Badge.displayName = "Badge";

export { Badge };
