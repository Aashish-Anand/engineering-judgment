import type { ReactNode } from "react";

type InsightCardProps = {
  children: ReactNode;
  variant?: "default" | "warning" | "danger";
  title?: string;
};

export function InsightCard({
  children,
  variant = "default",
  title = "The Mental Model",
}: InsightCardProps) {
  const isWarning = variant === "warning";
  const isDanger = variant === "danger";

  const bg = isDanger
    ? "bg-[#F9DDE5]"
    : isWarning
    ? "bg-[#FFF0B8]"
    : "bg-[#FFF0B8]";

  const borderColor = isDanger ? "border-[#DC2626]" : "border-[#171717]";
  const shadowColor = isDanger ? "shadow-[2px_3px_0px_#DC2626]" : "shadow-[2px_3px_0px_#171717]";

  return (
    <div
      className={`my-6 p-5 sm:p-6 ${bg} border-[1.5px] ${borderColor} ${shadowColor} rounded-[14px_16px_13px_15px/15px_13px_16px_14px] relative`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl select-none" aria-hidden="true">
          {isDanger ? "⚠️" : "💡"}
        </span>
        <span className="font-hand font-bold text-lg sm:text-xl text-[#171717] tracking-tight">
          {title}
        </span>
      </div>

      <div className="font-hand text-lg sm:text-xl font-bold text-[#171717] leading-relaxed [&>p]:mb-0">
        {children}
      </div>
    </div>
  );
}
