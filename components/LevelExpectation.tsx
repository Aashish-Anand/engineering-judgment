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
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    cardBg: "bg-white",
    borderColor: "border-slate-200",
    shadow: "shadow-xs",
    subtitle: "Execution & Mechanism",
    tier: "Tier 1 · Foundational",
  },
  MID: {
    badge: "MID",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    cardBg: "bg-white",
    borderColor: "border-slate-200",
    shadow: "shadow-xs",
    subtitle: "Execution & Mechanism",
    tier: "Tier 1 · Foundational",
  },
  Senior: {
    badge: "SENIOR",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    cardBg: "bg-white",
    borderColor: "border-slate-200",
    shadow: "shadow-xs",
    subtitle: "Trade-offs & Failure Modes",
    tier: "Tier 2 · Systems-level",
  },
  SENIOR: {
    badge: "SENIOR",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    cardBg: "bg-white",
    borderColor: "border-slate-200",
    shadow: "shadow-xs",
    subtitle: "Trade-offs & Failure Modes",
    tier: "Tier 2 · Systems-level",
  },
  Staff: {
    badge: "STAFF+",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    cardBg: "bg-white",
    borderColor: "border-slate-200",
    shadow: "shadow-xs",
    subtitle: "Architecture & Org Blast Radius",
    tier: "Tier 3 · Strategic Impact",
  },
  STAFF: {
    badge: "STAFF+",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    cardBg: "bg-white",
    borderColor: "border-slate-200",
    shadow: "shadow-xs",
    subtitle: "Architecture & Org Blast Radius",
    tier: "Tier 3 · Strategic Impact",
  },
};

export function LevelExpectation({ levels }: LevelExpectationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
      {levels.map((level) => {
        const config = levelConfigs[level.title] || {
          badge: level.title.toUpperCase(),
          badgeBg: "bg-slate-50 text-slate-700 border-slate-200",
          cardBg: "bg-white",
          borderColor: "border-slate-200",
          shadow: "shadow-xs",
          subtitle: "Target Capability",
          tier: `Evaluation · ${level.title}`,
        };

        return (
          <div
            key={level.title}
            className={`flex flex-col justify-between p-5 ${config.cardBg} border ${config.borderColor} rounded-xl ${config.shadow}`}
          >
            <div>
              {/* Header: Badge + Label */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
                <span
                  className={`font-mono text-xs font-bold px-2.5 py-0.5 border rounded-md ${config.badgeBg}`}
                >
                  {config.badge}
                </span>
                <span className="font-sans font-medium text-xs text-slate-600">
                  {config.subtitle}
                </span>
              </div>

              {/* Description */}
              <p className="font-sans font-semibold text-sm text-slate-900 mb-3 leading-snug">
                {level.description}
              </p>

              {/* Bullet points */}
              <ul className="space-y-2">
                {level.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs sm:text-[0.84rem] text-slate-600 flex items-start gap-2"
                  >
                    <span className="text-blue-500 shrink-0 select-none">
                      •
                    </span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom evaluation tier stamp */}
            <div className="mt-5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[0.7rem] font-mono text-slate-600">
              <span>{config.tier}</span>
              <span className="font-sans font-bold text-xs text-slate-600">
                Level {config.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
