"use client";

import { ReactNode } from "react";
import { Info, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "info" | "danger" | "warning" | "success";

export interface AlertProps {
  title?: string;
  children?: ReactNode;
  variant?: AlertVariant;
  className?: string;
}

const alertIcons = {
  info: Info,
  danger: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
};

export function Alert({ title, children, variant = "info", className }: AlertProps) {
  const Icon = alertIcons[variant];

  const bgClasses: Record<AlertVariant, string> = {
    info: "bg-info-soft",
    danger: "bg-danger-soft",
    warning: "bg-warning-soft",
    success: "bg-success-soft",
  };
  
  const borderClasses: Record<AlertVariant, string> = {
    info: "border-info-soft",
    danger: "border-danger-soft",
    warning: "border-warning-soft",
    success: "border-success-soft",
  };
  
  const iconClasses: Record<AlertVariant, string> = {
    info: "text-brand",
    danger: "text-danger",
    warning: "text-warning",
    success: "text-success",
  };

  return (
    <div 
      className={cn(
        "flex gap-4 p-4 rounded-2xl border",
        bgClasses[variant],
        borderClasses[variant],
        className
      )} 
    >
      <div className="shrink-0 mt-0.5">
        <Icon className={cn("w-5 h-5", iconClasses[variant])} />
      </div>
      <div>
        {title && <h4 className="text-sm font-semibold mb-1 text-theme-primary">{title}</h4>}
        {children && <div className="text-sm text-theme-secondary">{children}</div>}
      </div>
    </div>
  );
}
