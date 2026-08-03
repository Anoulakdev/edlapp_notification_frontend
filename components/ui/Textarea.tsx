"use client";

import { TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  const renderLabel = () => {
    if (!label) return null;
    if (typeof label === "string" && label.includes("*")) {
      const parts = label.split("*");
      return (
        <>
          {parts[0]}
          <span className="text-red-500 font-bold ml-0.5">*</span>
          {parts.slice(1).join("*")}
        </>
      );
    }
    return label;
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wide text-theme-secondary">
          {renderLabel()}
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
