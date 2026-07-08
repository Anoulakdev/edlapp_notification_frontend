"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  options: RadioOption[];
  value?: string;
}

export function RadioGroup({ label, options, value, onChange, className, ...props }: RadioGroupProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wide text-theme-secondary">
          {label}
        </label>
      )}
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-start gap-3">
            <div className="relative mt-1">
              <input
                type="radio"
                name={props.name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e as React.ChangeEvent<HTMLInputElement>)}
                className={cn(
                  "appearance-none w-5 h-5 rounded-full outline-none transition-all duration-150 cursor-pointer border-[2px]",
                  "bg-theme-bg",
                  value === option.value ? "border-brand" : "border-theme"
                )}
              />
              {value === option.value && (
                <div className="absolute inset-0 w-5 h-5 rounded-full pointer-events-none flex items-center justify-center bg-brand">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-semibold cursor-pointer text-theme-primary">
                {option.label}
              </label>
              {option.description && (
                <p className="text-xs text-theme-secondary">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
