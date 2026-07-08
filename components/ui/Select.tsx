"use client";

import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={props.id} className="text-xs font-semibold uppercase tracking-wide text-theme-secondary">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <select
          className={cn(
            "w-full pl-4 pr-11 py-2.5 rounded-xl text-sm outline-none transition-all duration-150 cursor-pointer appearance-none",
            "bg-theme-bg text-theme-primary",
            "border", error ? "border-danger" : "border-theme focus-ring-brand",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-theme-secondary">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && (
        <span className="text-xs font-medium text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
