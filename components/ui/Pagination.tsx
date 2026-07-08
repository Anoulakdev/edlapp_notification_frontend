"use client";

import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className={className}>
      <ul className="inline-flex -space-x-px text-sm">
        <li>
          <button 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={cn(
              "flex items-center justify-center px-3 h-9 leading-tight border rounded-l-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              "bg-theme-card border-theme text-theme-secondary"
            )}
          >
            Prev
          </button>
        </li>
        {pages.map(page => (
          <li key={page}>
            <button 
              onClick={() => onPageChange(page)}
              className={cn(
                "flex items-center justify-center px-4 h-9 leading-tight transition-all font-semibold relative",
                currentPage === page 
                  ? "z-10 bg-brand text-white border-brand border-y" 
                  : "border hover:bg-black/5 dark:hover:bg-white/5 bg-theme-card border-theme text-theme-secondary"
              )}
            >
              {page}
            </button>
          </li>
        ))}
        <li>
          <button 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              "flex items-center justify-center px-3 h-9 leading-tight border rounded-r-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              "bg-theme-card border-theme text-theme-secondary"
            )}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
