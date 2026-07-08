"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 outline-none",
        "disabled:opacity-50 disabled:pointer-events-none",
        variant === "primary" && "bg-brand text-white hover:opacity-90 focus-ring-brand shadow-brand-glow",
        variant === "secondary" && "bg-theme-card text-theme-primary border border-theme hover:bg-theme-bg focus-ring-brand",
        variant === "ghost" && "text-theme-secondary hover:text-theme-primary hover:bg-theme-bg focus-ring-brand",
        variant === "danger" && "bg-danger text-white hover:opacity-90 focus-ring-brand",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        size === "icon" && "w-10 h-10 p-0",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
