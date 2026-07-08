"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavItems } from "./config";

interface MobileNavProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function MobileNav({ mobileOpen, setMobileOpen, sidebarOpen, setSidebarOpen }: MobileNavProps) {
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const { navItems: filteredNavItems, loading } = useNavItems();

  if (!mobileOpen) return null;

  return (
    <div
      className="md:hidden animate-slide-down border-t"
      style={{
        background: "rgb(var(--card))",
        borderColor: "rgb(var(--border))",
      }}
    >
      <nav className="flex flex-col p-3 gap-1">
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => {
            setSidebarOpen(!sidebarOpen);
            setMobileOpen(false);
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
          style={{
            color: "rgb(var(--text-primary))",
            border: "1px solid rgb(var(--border))",
            fontFamily: "'Noto Sans Lao', sans-serif",
          }}
        >
          <Menu className="w-4 h-4" />
          <span>{sidebarOpen ? "ປິດ Sidebar" : "ເປີດ Sidebar"}</span>
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : (
          filteredNavItems.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const isGroupActive = item.children.some((c) => pathname === c.href);
              const isExpanded = mobileExpanded === item.label;
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setMobileExpanded(isExpanded ? null : item.label)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: isGroupActive ? "rgba(var(--brand), 0.1)" : undefined,
                      color: isGroupActive ? "rgb(var(--brand))" : "rgb(var(--text-secondary))",
                    }}
                  >
                    <Icon className="w-4 h-4" strokeWidth={isGroupActive ? 2.5 : 2} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className="w-3.5 h-3.5 transition-transform duration-200"
                      style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l pl-3" style={{ borderColor: "rgb(var(--border))" }}>
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                            style={{
                              background: childActive ? "rgb(var(--brand))" : undefined,
                              color: childActive ? "white" : "rgb(var(--text-secondary))",
                            }}
                          >
                            <ChildIcon className="w-4 h-4" strokeWidth={childActive ? 2.5 : 2} />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? "rgb(var(--brand))" : undefined,
                  color: active ? "white" : "rgb(var(--text-secondary))",
                }}
              >
                <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })
        )}
      </nav>
    </div>
  );
}
