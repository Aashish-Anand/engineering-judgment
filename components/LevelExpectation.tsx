type Level = {
  title: string;
  description: string;
  items: string[];
};

type LevelExpectationProps = {
  levels: Level[];
};

const levelStyles: Record<string, { pastel: string; badge: string }> = {
  "Mid-level": { pastel: "bg-[#DCEBFF]", badge: "MID" },
  MID: { pastel: "bg-[#DCEBFF]", badge: "MID" },
  Senior: { pastel: "bg-[#FFF0B8]", badge: "SENIOR" },
  SENIOR: { pastel: "bg-[#FFF0B8]", badge: "SENIOR" },
  Staff: { pastel: "bg-[#E7E1F8]", badge: "STAFF" },
  STAFF: { pastel: "bg-[#E7E1F8]", badge: "STAFF" },
};

export function LevelExpectation({ levels }: LevelExpectationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
      {levels.map((level) => {
        const style = levelStyles[level.title] || {
          pastel: "bg-[#FAF9F5]",
          badge: level.title.toUpperCase(),
        };

        return (
          <div
            key={level.title}
            className="flex flex-col justify-between p-5 bg-white border-[1.5px] border-[#171717] rounded-[14px_16px_13px_15px/15px_13px_16px_14px] shadow-[2px_3px_0px_#171717] hover:shadow-[3px_4px_0px_#171717] hover:-translate-y-0.5 transition-all"
          >
            <div>
              {/* Notebook tab / badge */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#171717]/20">
                <span className={`font-hand text-lg font-bold px-2.5 py-0.5 border border-[#171717] rounded shadow-xs ${style.pastel}`}>
                  {style.badge}
                </span>
                <span className="font-hand text-xs text-[#6B7280]">
                  Interviewer expectations
                </span>
              </div>

              <p className="font-sans font-semibold text-sm text-[#171717] mb-3 leading-snug">
                {level.description}
              </p>

              <ul className="space-y-2">
                {level.items.map((item, i) => (
                  <li key={i} className="text-xs sm:text-[0.84rem] text-[#374151] flex items-start gap-2">
                    <span className="font-hand text-base text-[#171717] shrink-0 select-none">
                      ▸
                    </span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-2 border-t border-dashed border-[#171717]/20 text-[0.7rem] font-mono text-[#6B7280]">
              Evaluation tier · {style.badge}
            </div>
          </div>
        );
      })}
    </div>
  );
}
