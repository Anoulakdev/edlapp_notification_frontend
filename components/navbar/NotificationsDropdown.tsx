"use client";

import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { noticesData } from "./config";

export function NotificationsDropdown() {
  const [noticesOpen, setNoticesOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const noticesButton = document.querySelector("[data-notices-button]");
      if (noticesButton && !noticesButton.contains(e.target as Node)) {
        setNoticesOpen(false);
      }
    };
    if (noticesOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [noticesOpen]);

  return (
    <div className="relative" data-notices-button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setNoticesOpen(!noticesOpen);
        }}
        aria-label="Notifications"
        aria-expanded={noticesOpen}
        className={cn(
          "relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150 border shadow-sm",
          noticesOpen
            ? "bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400 border-slate-200 dark:border-slate-700"
            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
        )}
      >
        <Bell className="w-4 h-4" strokeWidth={2} />
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse"
          style={{ background: "rgb(var(--danger))" }}
        />
      </button>

      {/* Notices Dropdown Menu */}
      {noticesOpen && (
        <div
          className="absolute right-0 mt-3 w-80 rounded-xl shadow-xl overflow-hidden border z-50 backdrop-blur-sm max-h-96 flex flex-col"
          style={{
            background: "rgb(var(--card))",
            border: "1px solid rgb(var(--border))",
            boxShadow: "0 4px 32px rgba(0, 0, 0, 0.12)",
            animation: "slideDown 200ms ease-out",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b font-semibold"
            style={{
              background: "rgb(var(--bg))",
              borderColor: "rgb(var(--border))",
              color: "rgb(var(--text-primary))",
            }}
          >
            Notifications
          </div>

          {/* Notices List */}
          <div className="overflow-y-auto flex-1">
            {noticesData.map((notice) => {
              const NoticeIcon = notice.icon;
              return (
                <div
                  key={notice.id}
                  className="px-4 py-3 border-b transition-all duration-150 cursor-pointer group"
                  style={{ borderColor: "rgb(var(--border))" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgb(var(--bg))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `rgba(${notice.color}, 0.1)` }}
                    >
                      <NoticeIcon
                        className="w-4 h-4"
                        style={{ color: `rgb(${notice.color})` }}
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: "rgb(var(--text-primary))" }}
                      >
                        {notice.title}
                      </div>
                      <div
                        className="text-xs mt-0.5 line-clamp-2"
                        style={{ color: "rgb(var(--text-secondary))" }}
                      >
                        {notice.message}
                      </div>
                      <div
                        className="text-xs mt-1.5"
                        style={{ color: "rgb(var(--text-secondary))" }}
                      >
                        {notice.time}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <button
            className="w-full px-4 py-3 text-sm font-medium transition-all duration-150 text-center"
            style={{
              color: "rgb(var(--brand))",
              background: "transparent",
              borderTop: "1px solid rgb(var(--border))",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgb(var(--bg))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            onClick={() => setNoticesOpen(false)}
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
}
