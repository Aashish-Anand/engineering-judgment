import type { ReactNode } from "react";

type DoodleBadgeProps = {
  children: ReactNode;
  color?: "blue" | "green" | "yellow" | "pink" | "lavender" | "white" | "danger";
  size?: "sm" | "md";
  className?: string;
};

const badgeColors = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  yellow: "bg-amber-50 text-amber-800 border-amber-200",
  pink: "bg-rose-50 text-rose-700 border-rose-200",
  lavender: "bg-indigo-50 text-indigo-700 border-indigo-200",
  white: "bg-white text-slate-700 border-slate-200",
  danger: "bg-red-50 text-red-700 border-red-200",
};

export function DoodleBadge({
  children,
  color = "blue",
  size = "md",
  className = "",
}: DoodleBadgeProps) {
  const colorClass = badgeColors[color] || badgeColors.blue;
  const sizeClass =
    size === "sm"
      ? "text-[11px] px-2 py-0.5"
      : "text-xs px-2.5 py-1 font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1 font-sans rounded-full border shadow-2xs select-none ${sizeClass} ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
}
