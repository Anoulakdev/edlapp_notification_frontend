"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "primary" | "success" | "danger" | "warning" | "secondary" | "info" | "blue" | "green" | "red" | "yellow" | "purple" | "gray";

export interface BadgeProps {
  children: ReactNode;
  color?: BadgeVariant;
  variant?: "soft" | "solid";
  className?: string;
}

export function Badge({ children, color = "secondary", variant = "soft", className }: BadgeProps) {
  const isSolid = variant === "solid";

  const bgClasses: Record<BadgeVariant, string> = {
    primary: isSolid ? "bg-brand" : "bg-brand-soft",
    success: isSolid ? "bg-success" : "bg-success-soft",
    danger: isSolid ? "bg-danger" : "bg-danger-soft",
    warning: isSolid ? "bg-warning" : "bg-warning-soft",
    secondary: isSolid ? "bg-theme-secondary" : "bg-secondary-soft",
    info: isSolid ? "bg-brand" : "bg-info-soft",
    blue: isSolid ? "bg-brand" : "bg-brand-soft",
    green: isSolid ? "bg-success" : "bg-success-soft",
    red: isSolid ? "bg-danger" : "bg-danger-soft",
    yellow: isSolid ? "bg-warning" : "bg-warning-soft",
    purple: isSolid ? "bg-brand" : "bg-brand-soft",
    gray: isSolid ? "bg-theme-secondary" : "bg-secondary-soft",
  };
  
  const textClasses: Record<BadgeVariant, string> = {
    primary: "text-brand",
    success: "text-success",
    danger: "text-danger",
    warning: "text-warning",
    secondary: "text-theme-secondary",
    info: "text-brand",
    blue: "text-brand",
    green: "text-success",
    red: "text-danger",
    yellow: "text-warning",
    purple: "text-brand",
    gray: "text-theme-secondary",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
        isSolid ? "shadow-sm text-white" : textClasses[color],
        bgClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}
