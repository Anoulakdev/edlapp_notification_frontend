"use client";

import { ProfileDropdown } from "./ProfileDropdown";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

export function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 right-0 z-35 h-16 w-full flex items-center justify-between px-4 sm:px-6 bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md transition-colors duration-300">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-350" />
          </button>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        <ProfileDropdown />
      </div>
    </header>
  );
}
