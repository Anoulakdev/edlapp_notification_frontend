"use client";

import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wide text-theme-secondary">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-150 resize-vertical min-h-[120px]",
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
