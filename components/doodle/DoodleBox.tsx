import type { ReactNode } from "react";

type DoodleBoxProps = {
  children: ReactNode;
  className?: string;
  pastel?: "blue" | "green" | "yellow" | "pink" | "lavender" | "paper" | "white";
  irregular?: boolean;
};

const pastelBgs = {
  blue: "bg-[#DCEBFF]",
  green: "bg-[#DFF3DF]",
  yellow: "bg-[#FFF0B8]",
  pink: "bg-[#F9DDE5]",
  lavender: "bg-[#E7E1F8]",
  paper: "bg-[#FAF9F5]",
  white: "bg-white",
};

export function DoodleBox({
  children,
  className = "",
  pastel = "white",
  irregular = true,
}: DoodleBoxProps) {
  const bgClass = pastelBgs[pastel] || "bg-white";
  const borderStyle = irregular
    ? "border-[1.5px] border-[#171717] rounded-[14px_18px_12px_16px/16px_12px_18px_14px] shadow-[2px_3px_0px_#171717]"
    : "border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]";

  return (
    <div className={`${borderStyle} ${bgClass} ${className}`}>
      {children}
    </div>
  );
}
