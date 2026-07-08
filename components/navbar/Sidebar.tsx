"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNavItems } from "./config";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isOpen, onClose, sidebarCollapsed, setSidebarCollapsed }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const { navItems: filteredNavItems, loading } = useNavItems();

  // Auto-expand menu groups if a child route is active (only if sidebar is not collapsed)
  useEffect(() => {
    if (!sidebarCollapsed) {
      filteredNavItems.forEach((item) => {
        if (item.children && item.children.some((child) => pathname === child.href)) {
          setExpandedItems((prev) => ({ ...prev, [item.label]: true }));
        }
      });
    }
  }, [pathname, sidebarCollapsed, filteredNavItems]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Dynamically handles clicking group elements in collapsed state
  const handleParentClick = (label: string) => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      setExpandedItems((prev) => ({ ...prev, [label]: true }));
    } else {
      toggleExpand(label);
    }
  };

  return (
    <>
      {/* Mobile Overlay / Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Main Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col h-full border-r transition-all duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          sidebarCollapsed ? "lg:w-[76px]" : "lg:w-[260px]",
          "text-white border-white/10"
        )}
        style={{
          background: "linear-gradient(180deg, rgb(30, 58, 138) 0%, rgb(29, 78, 216) 100%)",
          boxShadow: "0 10px 40px -10px rgba(29, 78, 216, 0.4)",
        }}
      >
        {/* Header/Logo Area */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-white/10 shrink-0",
            sidebarCollapsed ? "lg:px-0 lg:justify-center" : "px-6 justify-between"
          )}
        >
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-md shadow-blue-500/10 overflow-hidden shrink-0">
              <img src="/icon.png" alt="EDL Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <span
              className={cn(
                "text-lg font-bold text-white tracking-tight transition-opacity duration-200",
                sidebarCollapsed && "lg:opacity-0 lg:w-0 lg:overflow-hidden lg:hidden"
              )}
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.03em",
              }}
            >
              EDL<span className="text-blue-200"> Notification</span>
            </span>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className={cn(
              "lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors",
              sidebarCollapsed && "lg:hidden"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            filteredNavItems.map((item) => {
              const Icon = item.icon;

              // Accordion dropdown for items with children
              if (item.children) {
                const isGroupActive = item.children.some((c) => pathname === c.href);
                const isExpanded = expandedItems[item.label];

                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      onClick={() => handleParentClick(item.label)}
                      className={cn(
                        "flex items-center transition-all group cursor-pointer",
                        sidebarCollapsed
                          ? "lg:justify-center lg:px-0 lg:h-11 lg:w-11 lg:mx-auto rounded-xl"
                          : "w-full px-3.5 py-2.5 rounded-xl text-sm font-medium gap-3",
                        isGroupActive
                          ? "text-white bg-white/20 shadow-inner"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors shrink-0",
                          isGroupActive ? "text-white" : "text-white/70 group-hover:text-white"
                        )}
                        strokeWidth={2}
                      />
                      <span className={cn("flex-1 text-left transition-opacity duration-150", sidebarCollapsed && "lg:opacity-0 lg:w-0 lg:overflow-hidden lg:hidden")}>
                        {item.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200 text-white/50 group-hover:text-white shrink-0",
                          isExpanded && "rotate-180",
                          sidebarCollapsed && "lg:hidden"
                        )}
                      />
                    </button>

                    {/* Nested Sub-links */}
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out pl-4 space-y-1 border-l border-white/15 ml-5.5",
                        isExpanded && !sidebarCollapsed ? "max-h-[500px] opacity-100 mt-1 py-0.5" : "max-h-0 opacity-0 pointer-events-none"
                      )}
                    >
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = pathname === child.href;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={cn(
                              "flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                              childActive
                                ? "text-white bg-white/20 shadow-inner font-semibold"
                                : "text-white/70 hover:text-white hover:bg-white/10"
                            )}
                          >
                            <ChildIcon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // Normal plain links
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  onClick={onClose}
                  className={cn(
                    "flex items-center transition-all cursor-pointer",
                    sidebarCollapsed
                      ? "lg:justify-center lg:px-0 lg:h-11 lg:w-11 lg:mx-auto rounded-xl"
                      : "w-full px-3.5 py-2.5 rounded-xl text-sm font-medium gap-3",
                    active
                      ? "text-white bg-white/20 shadow-inner font-semibold"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", active ? "text-white" : "text-white/70")} strokeWidth={2} />
                  <span className={cn("transition-opacity duration-150", sidebarCollapsed && "lg:opacity-0 lg:w-0 lg:overflow-hidden lg:hidden")}>
                    {item.label}
                  </span>
                </Link>
              );
            })
          )}
        </nav>
      </aside>
    </>
  );
}
