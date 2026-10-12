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

  const containerClasses = isDanger
    ? "bg-rose-50/70 border-rose-200 text-rose-950"
    : isWarning
    ? "bg-amber-50/70 border-amber-200 text-amber-950"
    : "bg-blue-50/60 border-blue-200 text-slate-900";

  return (
    <div
      className={`my-6 p-5 sm:p-6 border rounded-xl shadow-xs relative ${containerClasses}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base select-none" aria-hidden="true">
          {isDanger ? "⚠️" : isWarning ? "⚡" : "💡"}
        </span>
        <span className="font-sans font-bold text-base sm:text-lg tracking-tight text-slate-900">
          {title}
        </span>
      </div>

      <div className="font-sans text-sm sm:text-base font-medium text-slate-800 leading-relaxed [&>p]:mb-0">
        {children}
      </div>
    </div>
  );
}
