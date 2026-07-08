"use client";

import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeMap = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-5xl",
    "2xl": "max-w-7xl",
    full: "max-w-[95vw] min-h-[95vh]",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 animate-backdrop-in bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-0 md:p-4">
        {/* Modal */}
        <div
          className={`relative w-full ${sizeMap[size]} rounded-2xl shadow-2xl animate-modal-in bg-theme-card border border-theme my-8 z-10`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-theme">
            <h2 className="text-base font-bold text-theme-primary font-display flex-1 mr-4">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 text-theme-secondary bg-theme-bg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
