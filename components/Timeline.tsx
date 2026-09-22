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
      {/* Sketched dashed connector line */}
      <div className="absolute left-[20px] top-4 bottom-4 w-px border-l-2 border-dashed border-[#171717]/30" />

      <div className="space-y-6">
        {phases.map((phase) => (
          <div key={phase.number} className="relative pl-12">
            {/* Hand-drawn circled phase node */}
            <div className="absolute left-0 top-0.5 w-[26px] h-[26px] rounded-full bg-[#FFF0B8] border-[1.5px] border-[#171717] flex items-center justify-center font-hand font-bold text-sm text-[#171717] shadow-[1px_1px_0px_#171717]">
              {phase.number}
            </div>

            <div className="bg-white border-[1.5px] border-[#171717] rounded-xl p-4 sm:p-5 shadow-[2px_2px_0px_#171717]">
              <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
                <span className="font-hand font-bold text-xs uppercase px-2 py-0.5 bg-[#FAF9F5] border border-[#171717] rounded">
                  Phase {phase.number}
                </span>
                <h4 className="font-hand text-xl font-bold text-[#171717]">
                  {phase.title}
                </h4>
              </div>

              <p className="font-sans text-sm text-[#374151] mb-0 leading-relaxed">
                {phase.description}
              </p>

              {phase.details && phase.details.length > 0 && (
                <ul className="mt-3 pt-3 border-t border-dashed border-[#171717]/15 space-y-1.5">
                  {phase.details.map((d, j) => (
                    <li key={j} className="text-xs sm:text-sm text-[#4B5563] flex items-start gap-2">
                      <span className="font-hand text-sm text-[#171717] mt-0.5 shrink-0 select-none">
                        ▸
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
