"use client";

type ExecutiveBlueprintProps = {
  timeToRead?: string;
  bottleneck: string;
  solution: string;
  goldenRule: string;
  keyMetrics?: { label: string; value: string }[];
  className?: string;
};

export function ExecutiveBlueprint({
  timeToRead = "30-Second Architecture Blueprint",
  bottleneck,
  solution,
  goldenRule,
  keyMetrics,
  className = "",
}: ExecutiveBlueprintProps) {
  return (
    <div
      className={`my-6 p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-xs relative ${className}`}
    >
      {/* Header badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 text-sm select-none" aria-hidden="true">
            ⚡
          </span>
          <span className="font-sans font-bold text-base sm:text-lg text-slate-900 tracking-tight">
            {timeToRead}
          </span>
        </div>
        <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
          EXECUTIVE SUMMARY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-sans mb-4">
        {/* The Bottleneck */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
            01 · Core Bottleneck
          </span>
          <p className="font-medium text-xs sm:text-sm text-slate-800 leading-snug mb-0">
            {bottleneck}
          </p>
        </div>

        {/* The Solution */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
            02 · Architecture Fix
          </span>
          <p className="font-medium text-xs sm:text-sm text-slate-800 leading-snug mb-0">
            {solution}
          </p>
        </div>

        {/* The Golden Rule */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
            03 · The Non-Negotiable Rule
          </span>
          <p className="font-bold text-xs sm:text-sm text-amber-950 leading-snug mb-0">
            &ldquo;{goldenRule}&rdquo;
          </p>
        </div>
      </div>

      {keyMetrics && keyMetrics.length > 0 && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="text-slate-500 font-bold">KEY THRESHOLDS:</span>
          {keyMetrics.map((m, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span className="text-slate-600">{m.label}:</span>
              <span className="font-bold text-slate-900">{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
