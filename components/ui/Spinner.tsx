"use client";

import { cn } from "@/lib/utils";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
  className?: string;
  variant?: "circle" | "dots";
}

export function Spinner({ size = "md", color = "primary", variant = "circle", className }: SpinnerProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const bgColors = {
    primary: "bg-brand",
    secondary: "bg-theme-secondary",
    white: "bg-white",
  };
  
  const textColors = {
    primary: "text-brand",
    secondary: "text-theme-secondary",
    white: "text-white",
  };

  if (variant === "dots") {
    const dotSize = size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2 h-2" : "w-2.5 h-2.5";
    return (
      <div className={cn("flex space-x-1.5 items-center", className)}>
        <div className={cn("rounded-full animate-bounce", dotSize, bgColors[color])}></div>
        <div className={cn("rounded-full animate-bounce", dotSize, bgColors[color])} style={{ animationDelay: "0.1s" }}></div>
        <div className={cn("rounded-full animate-bounce", dotSize, bgColors[color])} style={{ animationDelay: "0.2s" }}></div>
      </div>
    );
  }

  return (
    <svg 
      className={cn("animate-spin", sizes[size], textColors[color], className)} 
      viewBox="0 0 24 24" 
      fill="none" 
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}
