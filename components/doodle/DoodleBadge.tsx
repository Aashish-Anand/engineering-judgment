import type { ReactNode } from "react";

type DoodleBadgeProps = {
  children: ReactNode;
  color?: "blue" | "green" | "yellow" | "pink" | "lavender" | "white" | "danger";
  size?: "sm" | "md";
  className?: string;
};

const badgeColors = {
  blue: "bg-[#DCEBFF] text-[#171717] border-[#171717]",
  green: "bg-[#DFF3DF] text-[#171717] border-[#171717]",
  yellow: "bg-[#FFF0B8] text-[#171717] border-[#171717]",
  pink: "bg-[#F9DDE5] text-[#171717] border-[#171717]",
  lavender: "bg-[#E7E1F8] text-[#171717] border-[#171717]",
  white: "bg-white text-[#171717] border-[#171717]",
  danger: "bg-[#FDE8E8] text-[#DC2626] border-[#DC2626]",
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
      ? "text-xs px-2 py-0.5"
      : "text-sm px-2.5 py-1 font-bold";

  return (
    <span
      className={`inline-flex items-center gap-1 font-hand rounded-full border-[1.5px] shadow-[1px_1px_0px_#171717] select-none ${sizeClass} ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
}
