import React from "react";

/**
 * Lao Kip Currency Sign (₭) Icon.
 * Vector icon designed with the exact stroke and viewBox standards of Lucide icons.
 */
export function KipIcon({
  className = "w-6 h-6",
  strokeWidth = 2.2,
  ...props
}: React.SVGProps<SVGSVGElement> & { strokeWidth?: number | string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Vertical stem of K */}
      <path d="M7 4v16" />
      {/* Diagonal branches of K */}
      <path d="M17 4.5L7 12l10 7.5" />
      {/* Horizontal currency stroke across K */}
      <path d="M3.5 12h14" />
    </svg>
  );
}

export default KipIcon;
