"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export function SearchBox() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  if (searchOpen) {
    return (
      <div className="relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
        <Search className="w-4 h-4 pointer-events-none shrink-0 text-slate-400 dark:text-slate-550" />
        <input
          id="navbar-search-input"
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSearchOpen(false);
              setSearchValue("");
            }
          }}
          onBlur={() => {
            if (!searchValue) {
              setSearchOpen(false);
            }
          }}
          className="outline-none text-sm w-40 transition-all placeholder-shown:w-40 bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          autoFocus
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setSearchOpen(true)}
      aria-label="Toggle search"
      className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm"
    >
      <Search className="w-4 h-4 pointer-events-none" />
      <span className="hidden lg:block w-28 text-left pointer-events-none">Search...</span>
      <kbd className="hidden lg:flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded pointer-events-none bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-mono">
        ⌘K
      </kbd>
    </button>
  );
}
