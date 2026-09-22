import { DoodleArrow } from "./DoodleArrow";

type WhatBreaksNextProps = {
  solved: string;
  nextIssue: string;
  steps: string[];
  explanation?: string;
  className?: string;
};

export function WhatBreaksNext({
  solved,
  nextIssue,
  steps,
  explanation,
  className = "",
}: WhatBreaksNextProps) {
  return (
    <div
      className={`my-8 p-5 sm:p-6 bg-[#FAF9F5] border-[1.5px] border-[#171717] rounded-[16px_14px_18px_13px/13px_17px_14px_18px] shadow-[3px_4px_0px_#171717] relative ${className}`}
    >
      {/* Top sticker badge */}
      <div className="absolute -top-3 left-6">
        <span className="font-hand font-bold text-sm sm:text-base px-3 py-0.5 bg-[#FFF0B8] border-[1.5px] border-[#171717] rounded-full shadow-[1px_1px_0px_#171717]">
          ⚡ Signature Engineering Motif · What Breaks Next?
        </span>
      </div>

      <div className="pt-2 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Solved state */}
        <div className="md:col-span-4 bg-white border-[1.5px] border-[#171717] rounded-xl p-4 shadow-[2px_2px_0px_#171717]">
          <span className="text-[0.7rem] font-mono uppercase tracking-wider text-[#6B7280] font-bold block mb-1">
            Current Iteration
          </span>
          <div className="flex items-center gap-2">
            <span className="font-hand font-bold text-lg sm:text-xl text-[#16A34A]">
              ✓ Solved:
            </span>
            <span className="font-semibold text-sm sm:text-base text-[#171717]">
              {solved}
            </span>
          </div>
        </div>

        {/* Transition arrow & annotation */}
        <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
          <span className="font-hand font-bold text-lg text-[#DC2626] transform -rotate-6">
            But now...
          </span>
          <DoodleArrow direction="straight-right" className="hidden md:inline-block mt-1" />
          <DoodleArrow direction="down" className="md:hidden mt-1" />
        </div>

        {/* Cascading Next Bottleneck */}
        <div className="md:col-span-6 bg-[#F9DDE5] border-[1.5px] border-[#171717] rounded-xl p-4 shadow-[2px_2px_0px_#171717]">
          <span className="text-[0.7rem] font-mono uppercase tracking-wider text-[#DC2626] font-bold block mb-1">
            Next Bottleneck · {nextIssue}
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-mono font-medium text-[#171717]">
            {steps.map((step, idx) => (
              <span key={step} className="inline-flex items-center gap-1.5">
                <span className="bg-white/80 border border-[#171717]/40 px-2 py-0.5 rounded shadow-sm">
                  {step}
                </span>
                {idx < steps.length - 1 && (
                  <span className="text-[#DC2626] font-bold">→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {explanation && (
        <div className="mt-4 pt-3 border-t border-dashed border-[#171717]/20 flex items-start gap-2">
          <span className="font-hand text-xl text-[#DC2626] shrink-0">↳</span>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed mb-0 font-sans italic">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
