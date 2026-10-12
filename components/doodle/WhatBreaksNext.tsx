
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
      className={`my-8 p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-xs relative ${className}`}
    >
      {/* Top sticker badge */}
      <div className="absolute -top-3 left-6">
        <span className="font-sans font-bold text-xs px-3 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full shadow-xs">
          ⚡ System Evolution · What Breaks Next?
        </span>
      </div>

      <div className="pt-2 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Solved state */}
        <div className="md:col-span-4 bg-emerald-50/50 border border-emerald-200 rounded-lg p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold block mb-1">
            Current Iteration
          </span>
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-sm text-emerald-700">
              ✓ Solved:
            </span>
            <span className="font-sans font-semibold text-xs sm:text-sm text-slate-900">
              {solved}
            </span>
          </div>
        </div>

        {/* Transition arrow & annotation */}
        <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
          <span className="font-sans font-bold text-xs text-red-600">
            Next Constraint →
          </span>
        </div>

        {/* Cascading Next Bottleneck */}
        <div className="md:col-span-6 bg-red-50/50 border border-red-200 rounded-lg p-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-red-700 font-bold block mb-1">
            Next Bottleneck · {nextIssue}
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono font-medium text-slate-800">
            {steps.map((step, idx) => (
              <span key={step} className="inline-flex items-center gap-1.5">
                <span className="bg-white border border-red-200 px-2 py-0.5 rounded shadow-2xs">
                  {step}
                </span>
                {idx < steps.length - 1 && (
                  <span className="text-red-500 font-bold">→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {explanation && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2">
          <span className="font-sans font-bold text-xs text-red-600 shrink-0">↳ Insight:</span>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-0 font-sans">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
