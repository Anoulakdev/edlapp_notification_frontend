import { useState } from "react";
import { createPortal } from "react-dom";

export function TableTooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
    setShow(true);
  };

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        className="w-full"
      >
        {children}
      </div>
      {show && text && text !== "-" && typeof document !== "undefined" && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none -translate-x-1/2 -translate-y-full bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 text-xs py-1.5 px-3 rounded-lg shadow-2xl whitespace-nowrap transition-opacity"
          style={{ fontFamily: "'Noto Sans Lao', sans-serif", left: pos.x, top: pos.y - 6 }}
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-100"></div>
        </div>,
        document.body
      )}
    </>
  );
}

export function ButtonTooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
    setShow(true);
  };

  return (
    <div className="inline-block relative">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        onMouseDown={() => setShow(false)}
        className="flex items-center justify-center"
      >
        {children}
      </div>
      {show && text && typeof document !== "undefined" && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none -translate-x-1/2 -translate-y-full bg-gray-900/95 dark:bg-gray-100/95 backdrop-blur-sm text-white dark:text-gray-900 text-xs font-semibold py-1.5 px-3 rounded-xl shadow-xl border border-white/10 dark:border-black/5 whitespace-nowrap transition-all duration-200"
          style={{ fontFamily: "'Noto Sans Lao', sans-serif", left: pos.x, top: pos.y - 6 }}
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/95 dark:border-t-gray-100/95"></div>
        </div>,
        document.body
      )}
    </div>
  );
}
