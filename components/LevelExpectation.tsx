type Level = {
  title: string;
  description: string;
  items: string[];
};

type LevelExpectationProps = {
  levels: Level[];
};

type LevelConfig = {
  badge: string;
  badgeBg: string;
  cardBg: string;
  borderColor: string;
  shadow: string;
  subtitle: string;
  tier: string;
};

const levelConfigs: Record<string, LevelConfig> = {
  "Mid-level": {
    badge: "MID",
    badgeBg: "bg-[#DCEBFF]",
    cardBg: "bg-white",
    borderColor: "border-[#171717]",
    shadow: "shadow-[2px_3px_0px_#171717]",
    subtitle: "Execution & Mechanism",
    tier: "Tier 1 · Foundational",
  },
  MID: {
    badge: "MID",
    badgeBg: "bg-[#DCEBFF]",
    cardBg: "bg-white",
    borderColor: "border-[#171717]",
    shadow: "shadow-[2px_3px_0px_#171717]",
    subtitle: "Execution & Mechanism",
    tier: "Tier 1 · Foundational",
  },
  Senior: {
    badge: "SENIOR",
    badgeBg: "bg-[#FFF0B8]",
    cardBg: "bg-gradient-to-b from-white to-[#FAF9F5]",
    borderColor: "border-[#171717]",
    shadow: "shadow-[3px_4px_0px_#171717]",
    subtitle: "Trade-offs & Failure Modes",
    tier: "Tier 2 · Systems-level",
  },
  SENIOR: {
    badge: "SENIOR",
    badgeBg: "bg-[#FFF0B8]",
    cardBg: "bg-gradient-to-b from-white to-[#FAF9F5]",
    borderColor: "border-[#171717]",
    shadow: "shadow-[3px_4px_0px_#171717]",
    subtitle: "Trade-offs & Failure Modes",
    tier: "Tier 2 · Systems-level",
  },
  Staff: {
    badge: "STAFF+",
    badgeBg: "bg-[#E7E1F8]",
    cardBg: "bg-gradient-to-b from-white via-white to-[#F6F2FC]",
    borderColor: "border-[#171717]",
    shadow: "shadow-[3px_4.5px_0px_#171717]",
    subtitle: "Architecture & Organizational Blast Radius",
    tier: "Tier 3 · Strategic Impact",
  },
  STAFF: {
    badge: "STAFF+",
    badgeBg: "bg-[#E7E1F8]",
    cardBg: "bg-gradient-to-b from-white via-white to-[#F6F2FC]",
    borderColor: "border-[#171717]",
    shadow: "shadow-[3px_4.5px_0px_#171717]",
    subtitle: "Architecture & Organizational Blast Radius",
    tier: "Tier 3 · Strategic Impact",
  },
};

export function LevelExpectation({ levels }: LevelExpectationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
      {levels.map((level) => {
        const config = levelConfigs[level.title] || {
          badge: level.title.toUpperCase(),
          badgeBg: "bg-[#FAF9F5]",
          cardBg: "bg-white",
          borderColor: "border-[#171717]",
          shadow: "shadow-[2px_3px_0px_#171717]",
          subtitle: "Target Capability",
          tier: `Evaluation · ${level.title}`,
        };

        return (
          <div
            key={level.title}
            className={`flex flex-col justify-between p-5 ${config.cardBg} border-[1.5px] ${config.borderColor} rounded-[14px_16px_13px_15px/15px_13px_16px_14px] ${config.shadow} hover:-translate-y-1 transition-all duration-150`}
          >
            <div>
              {/* Header: Badge + Label with flex-wrap to prevent collision */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#171717]/20">
                <span
                  className={`font-hand text-lg font-bold px-2.5 py-0.5 border border-[#171717] rounded shadow-[1px_1px_0px_#171717] text-[#171717] ${config.badgeBg}`}
                >
                  {config.badge}
                </span>
                <span className="font-hand font-semibold text-xs text-[#6B7280]">
                  {config.subtitle}
                </span>
              </div>

              {/* Description */}
              <p className="font-sans font-semibold text-sm text-[#171717] mb-3 leading-snug">
                {level.description}
              </p>

              {/* Bullet points */}
              <ul className="space-y-2">
                {level.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs sm:text-[0.84rem] text-[#374151] flex items-start gap-2"
                  >
                    <span className="font-hand text-base text-[#171717] shrink-0 select-none">
                      ▸
                    </span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom evaluation tier stamp */}
            <div className="mt-5 pt-2.5 border-t border-dashed border-[#171717]/20 flex items-center justify-between text-[0.7rem] font-mono text-[#6B7280]">
              <span>{config.tier}</span>
              <span className="font-hand font-bold text-xs text-[#171717]">
                Level {config.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
