"use client";

import { InputHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export function Checkbox({ label, description, id, className, ...props }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="relative mt-1">
        <input
          id={checkboxId}
          type="checkbox"
          className={cn(
            "appearance-none w-5 h-5 rounded outline-none transition-all duration-150 cursor-pointer",
            "bg-theme-bg border-1 border-theme",
            props.checked && "bg-brand border-brand"
          )}
          {...props}
        />
        {props.checked && (
          <svg
            className="absolute inset-0 w-5 h-5 text-white pointer-events-none p-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        {label && (
          <label htmlFor={checkboxId} className="text-sm font-semibold cursor-pointer text-theme-primary">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-theme-secondary">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
