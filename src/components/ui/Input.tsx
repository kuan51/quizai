"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = "text", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={inputId}
          className={cn(
            "w-full px-4 py-3 bg-[var(--surface)] dark:bg-stone-900",
            "text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500",
            "transition-all duration-200",
            "focus:outline-none focus:ring-1 focus:ring-primary-400 focus:border-primary-400",
            "rounded-md border border-stone-300 dark:border-stone-700",
            error && "border-error bg-error-light/30 focus:ring-error focus:border-error",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-100 dark:disabled:bg-stone-900",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
