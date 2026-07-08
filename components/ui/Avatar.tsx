"use client";

import { cn } from "@/lib/utils";

export type AvatarVariant = "primary" | "success" | "warning" | "danger" | "secondary" | "info";

export interface AvatarProps {
  initials?: string;
  src?: string;
  color?: AvatarVariant;
  className?: string;
}

export function Avatar({ initials, src, color = "primary", className }: AvatarProps) {
  const bgClasses: Record<AvatarVariant, string> = {
    primary: "bg-brand",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    secondary: "bg-theme-bg",
    info: "bg-brand",
  };

  const textClass = color === "secondary" ? "text-theme-primary" : "text-white";

  return (
    <div 
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 shadow-sm shrink-0 border-[rgb(var(--card))]",
        !src && bgClasses[color],
        !src && textClass,
        className
      )} 
      style={src ? { backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {!src && initials}
    </div>
  );
}
