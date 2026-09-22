import type { ReactNode } from "react";

type HighlightStrokeProps = {
  children: ReactNode;
  color?: "blue" | "yellow" | "green" | "pink" | "lavender";
  className?: string;
};

const colorStyles = {
  blue: "bg-[#DCEBFF]",
  yellow: "bg-[#FFF0B8]",
  green: "bg-[#DFF3DF]",
  pink: "bg-[#F9DDE5]",
  lavender: "bg-[#E7E1F8]",
};

export function HighlightStroke({
  children,
  color = "blue",
  className = "",
}: HighlightStrokeProps) {
  const bg = colorStyles[color] || colorStyles.blue;

  return (
    <span className={`relative inline-block ${className}`}>
      <span
        className={`absolute inset-x-[-4px] bottom-[2px] top-[4px] -z-10 ${bg} rounded-[4px_6px_3px_5px/6px_4px_5px_3px] transform -rotate-1`}
        aria-hidden="true"
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}
