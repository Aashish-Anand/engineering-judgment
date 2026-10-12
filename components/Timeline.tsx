type TimelinePhase = {
  number: string;
  title: string;
  description: string;
  details?: string[];
};

type TimelineProps = {
  phases: TimelinePhase[];
};

export function Timeline({ phases }: TimelineProps) {
  return (
    <div className="my-8 relative pl-2">
      {/* Clean connector line */}
      <div className="absolute left-[12px] top-4 bottom-4 w-px bg-slate-200" />

      <div className="space-y-6">
        {phases.map((phase) => (
          <div key={phase.number} className="relative pl-10">
            {/* Clean numbered node */}
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-mono font-bold text-xs text-blue-700 shadow-2xs">
              {phase.number}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
              <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
                <span className="font-mono text-[11px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded">
                  Phase {phase.number}
                </span>
                <h4 className="font-sans text-base sm:text-lg font-bold text-slate-900">
                  {phase.title}
                </h4>
              </div>

              <p className="font-sans text-sm text-slate-600 mb-0 leading-relaxed">
                {phase.description}
              </p>

              {phase.details && phase.details.length > 0 && (
                <ul className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  {phase.details.map((d, j) => (
                    <li key={j} className="text-xs sm:text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-blue-500 shrink-0 select-none">
                        •
                      </span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
