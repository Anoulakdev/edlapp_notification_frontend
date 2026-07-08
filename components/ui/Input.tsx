"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={props.id} className="text-xs font-semibold uppercase tracking-wide text-theme-secondary">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-150",
          "bg-theme-bg text-theme-primary placeholder:text-[rgb(var(--text-secondary))]",
          "border", error ? "border-danger" : "border-theme focus-ring-brand",
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
