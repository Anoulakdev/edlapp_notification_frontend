"use client";

import { SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  error?: string;
  options?: { value: string; label: string }[];
}

export function Select({ label, error, options, className, disabled, children, ...props }: SelectProps) {
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
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={props.id} className={cn("text-xs font-semibold uppercase tracking-wide", disabled ? "text-slate-400 dark:text-slate-500" : "text-theme-secondary")}>
          {renderLabel()}
        </label>
      )}
      <div className="relative w-full">
        <select
          disabled={disabled}
          className={cn(
            "w-full pl-4 pr-11 py-2.5 rounded-xl text-sm outline-none transition-all duration-150 cursor-pointer appearance-none",
            "bg-theme-bg text-theme-primary",
            "border", error ? "border-danger" : "border-theme focus-ring-brand",
            "disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:border-slate-300 dark:disabled:border-slate-700 disabled:cursor-not-allowed disabled:shadow-inner",
            className
          )}
          {...props}
        >
          {options ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )) : children}
        </select>
        <div className={cn("absolute inset-y-0 right-4 flex items-center pointer-events-none", disabled ? "text-slate-400 dark:text-slate-600" : "text-theme-secondary")}>
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
