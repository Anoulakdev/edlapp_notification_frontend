"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useNavItems } from "./config";

export function DesktopNav() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const { navItems: filteredNavItems, loading } = useNavItems();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [openDropdown]);

  return (
    <nav ref={dropdownRef} className="hidden md:flex items-center gap-1 flex-1">
      {loading ? (
        <div className="flex items-center justify-center px-4">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        filteredNavItems.map((item) => {
          const Icon = item.icon;

          // Dropdown group
          if (item.children) {
            const isGroupActive = item.children.some((c) => pathname === c.href);
            const isOpen = openDropdown === item.label;
            return (
              <div key={item.label} className="relative">
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : item.label)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                    isGroupActive || isOpen ? "text-white bg-white/20 shadow-inner" : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="w-4 h-4" strokeWidth={isGroupActive || isOpen ? 2.5 : 2} />
                  {item.label}
                  <ChevronDown
                    className="w-3.5 h-3.5 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                {/* Dropdown panel */}
                {isOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-64 rounded-xl border shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto scrollbar-thin"
                    style={{
                      background: "rgb(var(--card))",
                      borderColor: "rgb(var(--border))",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                      animation: "slideDown 180ms cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpenDropdown(null)}
                          className="flex items-start gap-3 px-4 py-3 transition-all border-b last:border-b-0"
                          style={{
                            borderColor: "rgb(var(--border))",
                            background: childActive ? "rgba(var(--brand), 0.08)" : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (!childActive) (e.currentTarget as HTMLAnchorElement).style.background = "rgb(var(--bg))";
                          }}
                          onMouseLeave={(e) => {
                            if (!childActive) (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: childActive ? "rgb(var(--brand))" : "rgba(var(--brand), 0.1)" }}
                          >
                            <ChildIcon
                              className="w-3.5 h-3.5"
                              style={{ color: childActive ? "white" : "rgb(var(--brand))" }}
                              strokeWidth={2}
                            />
                          </div>
                          <div>
                            <p
                              className="text-sm font-medium leading-none mb-0.5"
                              style={{ color: childActive ? "rgb(var(--brand))" : "rgb(var(--text-primary))" }}
                            >
                              {child.label}
                            </p>
                            {child.description && (
                              <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                                {child.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Plain link
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative group",
                active ? "text-white bg-white/20 shadow-inner" : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })
      )}
    </nav>
  );
}
