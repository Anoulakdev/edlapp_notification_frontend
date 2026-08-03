"use client";

import { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
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
        <label htmlFor={props.id} className="text-xs font-semibold uppercase tracking-wide text-theme-secondary">
          {renderLabel()}
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
