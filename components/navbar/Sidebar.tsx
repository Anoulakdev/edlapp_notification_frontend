"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNavItems } from "./config";
import { io } from "socket.io-client";
import axiosInstance, { rawBackendUrl } from "@/lib/axiosInstance";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isOpen, onClose, sidebarCollapsed, setSidebarCollapsed }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);
  const [meterCount, setMeterCount] = useState<number>(0);
  const pathname = usePathname();
  const { navItems: filteredNavItems, loading } = useNavItems();

  // Fetch unread count & listen to real-time WebSocket updates
  useEffect(() => {
    if (loading) return;

    const hasChat = filteredNavItems.some(
      (item) => item.href === "/chat" || item.children?.some((c) => c.href === "/chat")
    );
    const hasRegisterMeter = filteredNavItems.some(
      (item) => item.href === "/registermeter" || item.children?.some((c) => c.href === "/registermeter")
    );

    const socketUrl =
      typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? window.location.origin
        : rawBackendUrl;

    let chatSocket: any = null;
    let meterSocket: any = null;

    if (hasChat) {
      // 1. Fetch initial chat unread count
      const fetchChatUnreadCount = async () => {
        try {
          const res = await axiosInstance.get("/conversations/unreadcount");
          if (res.data && typeof res.data.total === "number") {
            setChatUnreadCount(res.data.total);
          } else if (typeof res.data === "number") {
            setChatUnreadCount(res.data);
          }
        } catch (err: any) {
          if (err?.response?.status !== 403) {
            console.error("Failed to fetch chat unread count:", err);
          }
        }
      };
      fetchChatUnreadCount();

      // Chat socket
      chatSocket = io(`${socketUrl}/conversation`, {
        transports: ["websocket"],
      });

      chatSocket.on("totalUnreadCountUpdate", (data: any) => {
        const count =
          typeof data?.total === "number"
            ? data.total
            : typeof data === "number"
            ? data
            : 0;
        setChatUnreadCount(count);
      });

      chatSocket.on("unreadCountUpdate", (data: any) => {
        const count =
          typeof data?.total === "number"
            ? data.total
            : typeof data === "number"
            ? data
            : 0;
        setChatUnreadCount(count);
      });
    } else {
      setChatUnreadCount(0);
    }

    if (hasRegisterMeter) {
      // 2. Fetch initial register meter count
      const fetchMeterCount = async () => {
        try {
          const res = await axiosInstance.get("/registermeters/countmeter");
          if (res.data && typeof res.data.total === "number") {
            setMeterCount(res.data.total);
          } else if (typeof res.data === "number") {
            setMeterCount(res.data);
          }
        } catch (err: any) {
          if (err?.response?.status !== 403) {
            console.error("Failed to fetch register meter count:", err);
          }
        }
      };
      fetchMeterCount();

      // Register meter socket for realtime updates
      meterSocket = io(`${socketUrl}/registermeter`, {
        transports: ["websocket"],
      });

      meterSocket.on("registermeterUpdated", () => {
        fetchMeterCount();
      });

      meterSocket.on("countMeterUpdated", () => {
        fetchMeterCount();
      });
    } else {
      setMeterCount(0);
    }

    return () => {
      if (chatSocket) chatSocket.disconnect();
      if (meterSocket) meterSocket.disconnect();
    };
  }, [filteredNavItems, loading]);

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
          "fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Main Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col h-full border-r transition-transform duration-300 ease-in-out w-[280px] max-w-[85vw] text-white border-white/10",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          "lg:translate-x-0",
          sidebarCollapsed ? "lg:w-[76px]" : "lg:w-[260px]"
        )}
        style={{
          background: "linear-gradient(180deg, rgb(30, 58, 138) 0%, rgb(29, 78, 216) 100%)",
          boxShadow: "0 10px 40px -10px rgba(29, 78, 216, 0.4)",
        }}
      >
        {/* Header/Logo Area */}
        <div
          className={cn(
            "h-28 flex items-center shrink-0 overflow-hidden relative",
            sidebarCollapsed ? "lg:px-1 lg:justify-center" : "px-1 justify-between"
          )}
        >
          <Link href="/" onClick={onClose} className="flex-1 flex items-center justify-start h-full min-w-0">
            <img
              src="/ECC.png"
              alt="ECC Logo"
              className={cn(
                "w-full h-full object-contain transition-all duration-200 scale-[1.85] origin-left",
                sidebarCollapsed ? "lg:object-center lg:origin-center lg:scale-125" : "object-left"
              )}
            />
          </Link>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "lg:hidden p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors shrink-0 relative z-10 mr-1",
              sidebarCollapsed && "lg:hidden"
            )}
          >
            <X className="w-5 h-5" />
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
                        isExpanded ? "max-h-[500px] opacity-100 mt-1 py-0.5" : "max-h-0 opacity-0 pointer-events-none"
                      )}
                    >
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = pathname === child.href;

                        const isChildChat = child.href === "/chat";
                        const isChildMeter = child.href === "/registermeter";
                        const childBadgeCount = isChildChat ? chatUnreadCount : isChildMeter ? meterCount : 0;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={cn(
                              "flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                              childActive
                                ? "text-white bg-white/20 shadow-inner font-semibold"
                                : "text-white/70 hover:text-white hover:bg-white/10"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <ChildIcon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                              <span>{child.label}</span>
                            </div>
                            {childBadgeCount > 0 && (
                              <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm animate-pulse">
                                {childBadgeCount > 99 ? "99+" : childBadgeCount}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // Normal plain links
              const active = pathname === item.href;
              const isChat = item.href === "/chat";
              const isMeter = item.href === "/registermeter";
              const badgeCount = isChat ? chatUnreadCount : isMeter ? meterCount : 0;

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  onClick={onClose}
                  className={cn(
                    "flex items-center transition-all cursor-pointer relative",
                    sidebarCollapsed
                      ? "lg:justify-center lg:px-0 lg:h-11 lg:w-11 lg:mx-auto rounded-xl"
                      : "w-full px-3.5 py-2.5 rounded-xl text-sm font-medium gap-3",
                    active
                      ? "text-white bg-white/20 shadow-inner font-semibold"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                  title={sidebarCollapsed ? `${item.label}${badgeCount > 0 ? ` (${badgeCount})` : ""}` : undefined}
                >
                  <div className="relative shrink-0 flex items-center justify-center">
                    <Icon className={cn("w-4 h-4 shrink-0", active ? "text-white" : "text-white/70")} strokeWidth={2} />
                    {badgeCount > 0 && sidebarCollapsed && (
                      <span className="hidden lg:flex absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-1 items-center justify-center text-[9px] font-bold text-white bg-red-500 rounded-full shadow ring-1 ring-white/30 animate-pulse">
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    )}
                  </div>
                  <span className={cn("flex-1 flex items-center justify-between transition-opacity duration-150", sidebarCollapsed && "lg:opacity-0 lg:w-0 lg:overflow-hidden lg:hidden")}>
                    <span>{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-red-500 rounded-full shadow-sm animate-pulse">
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    )}
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
