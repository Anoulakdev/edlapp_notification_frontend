"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sidebar, Header } from "./navbar";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const isAuthPage = pathname === '/signin' || pathname === '/signup' || pathname === '/resetpassword';

  if (isAuthPage) {
    return (
      <div className="min-h-screen relative z-0">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative z-0">
      {/* Sleek Vertical Sidebar Menu */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* Main content viewport */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          sidebarCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"
        )}
      >
        {/* Sticky Glassmorphic Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

        {/* Dynamic page content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
