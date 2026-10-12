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
      className={`my-6 p-5 sm:p-6 bg-[#FAF9F5] border-[1.5px] border-[#171717] rounded-[14px_16px_13px_15px/15px_13px_16px_14px] shadow-[3px_4px_0px_#171717] relative ${className}`}
    >
      {/* Header sticker */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#171717]/20">
        <div className="flex items-center gap-2">
          <span className="text-lg select-none" aria-hidden="true">
            ⚡
          </span>
          <span className="font-hand font-bold text-base sm:text-lg text-[#171717] tracking-tight">
            {timeToRead}
          </span>
        </div>
        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#FFF0B8] border border-[#171717] rounded shadow-2xs">
          EXECUTIVE SUMMARY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-sans mb-4">
        {/* The Bottleneck */}
        <div className="p-3.5 bg-white border border-[#171717] rounded-xl shadow-xs">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#DC2626] block mb-1">
            01 · Core Bottleneck
          </span>
          <p className="font-semibold text-xs sm:text-sm text-[#171717] leading-snug mb-0">
            {bottleneck}
          </p>
        </div>

        {/* The Solution */}
        <div className="p-3.5 bg-white border border-[#171717] rounded-xl shadow-xs">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#16A34A] block mb-1">
            02 · Architecture Fix
          </span>
          <p className="font-semibold text-xs sm:text-sm text-[#171717] leading-snug mb-0">
            {solution}
          </p>
        </div>

        {/* The Golden Rule */}
        <div className="p-3.5 bg-[#FFF0B8] border border-[#171717] rounded-xl shadow-xs">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#92400E] block mb-1">
            03 · The Non-Negotiable Rule
          </span>
          <p className="font-hand font-bold text-xs sm:text-sm text-[#171717] leading-snug mb-0">
            &ldquo;{goldenRule}&rdquo;
          </p>
        </div>
      </div>

      {keyMetrics && keyMetrics.length > 0 && (
        <div className="pt-3 border-t border-dashed border-[#171717]/20 flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="text-[#6B7280] font-bold">KEY THRESHOLDS:</span>
          {keyMetrics.map((m, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#171717]" />
              <span className="text-[#4B5563]">{m.label}:</span>
              <span className="font-bold text-[#171717]">{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
