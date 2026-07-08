"use client";

import { cn } from "@/lib/utils";

export type ProgressVariant = "primary" | "success" | "danger" | "warning";

export interface ProgressProps {
  value: number; // 0 to 100
  label?: string;
  color?: ProgressVariant;
  className?: string;
}

export function Progress({ value, label, color = "primary", className }: ProgressProps) {
  const safeValue = Math.min(100, Math.max(0, value));
  
  const textClasses: Record<ProgressVariant, string> = {
    primary: "text-brand",
    success: "text-success",
    danger: "text-danger",
    warning: "text-warning",
  };
  
  const bgClasses: Record<ProgressVariant, string> = {
    primary: "bg-brand",
    success: "bg-success",
    danger: "bg-danger",
    warning: "bg-warning",
  };
  
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex justify-between mb-1 text-xs">
          <span className={cn("font-semibold", textClasses[color])}>{label}</span>
          <span className="text-theme-secondary">{safeValue}%</span>
        </div>
      )}
      <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2">
        <div 
          className={cn("h-2 rounded-full transition-all duration-500 ease-out", bgClasses[color])}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
