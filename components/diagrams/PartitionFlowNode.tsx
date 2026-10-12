import type { ReactNode } from "react";

export function PartitionFlowNode({
  title,
  children,
  tone = "blue",
}: {
  title: string;
  children: ReactNode;
  tone?: "blue" | "green" | "yellow" | "purple" | "white";
}) {
  const colors = {
    blue: "bg-blue-50/60 border-blue-200 text-slate-900",
    green: "bg-emerald-50/60 border-emerald-200 text-slate-900",
    yellow: "bg-amber-50/60 border-amber-200 text-slate-900",
    purple: "bg-purple-50/60 border-purple-200 text-slate-900",
    white: "bg-white border-slate-200 text-slate-900",
  };

  return (
    <div
      className={`border rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-150 ${colors[tone]}`}
    >
      <div className="font-sans text-xs sm:text-sm font-bold text-slate-900 mb-1">
        {title}
      </div>
      <div className="text-xs sm:text-sm leading-relaxed text-slate-700">{children}</div>
    </div>
  );
}

export function PartitionFlowArrow({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center my-2 select-none" aria-hidden="true">
      {/* Top connector line */}
      <div className="w-[1.5px] h-2.5 bg-slate-300" />

      {/* Label pill if children present */}
      {children && (
        <div className="my-0.5 px-2.5 py-0.5 bg-white border border-slate-200 rounded-full text-[11px] font-mono text-slate-600 shadow-2xs text-center max-w-[90%]">
          {children}
        </div>
      )}

      {/* Bottom connector line and arrowhead */}
      <div className="w-[1.5px] h-2.5 bg-slate-300" />
      <svg
        width="10"
        height="6"
        viewBox="0 0 10 6"
        className="-mt-0.5 fill-slate-400"
      >
        <path d="M0 0 L5 6 L10 0 Z" />
      </svg>
    </div>
  );
}
