export function CutoverDiagram() {
  const stages = [
    { a: 100, b: 0, label: "Start", tag: "100% A" },
    { a: 99, b: 1, label: "Canary", tag: "1% B" },
    { a: 80, b: 20, label: "Ramp", tag: "20% B" },
    { a: 50, b: 50, label: "Split", tag: "50% B" },
    { a: 0, b: 100, label: "Cutover", tag: "100% B" },
  ];

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
      <svg
        viewBox="0 0 440 180"
        className="w-full h-auto"
        role="img"
        aria-label="Gradual cutover stages with hand-drawn progress bars"
      >
        {stages.map((stage, i) => {
          const x = 20 + i * 82;
          const totalH = 75;
          const aH = (stage.a / 100) * totalH;
          const bH = (stage.b / 100) * totalH;

          return (
            <g key={stage.label}>
              {/* Stage title */}
              <text
                x={x + 28}
                y="18"
                textAnchor="middle"
                fontFamily="var(--font-hand)"
                fontSize="15"
                fontWeight="bold"
                fill="#171717"
              >
                {stage.label}
              </text>

              {/* Progress Bar Container */}
              <g>
                {/* DB A segment */}
                {aH > 0 && (
                  <rect
                    x={x}
                    y={28}
                    width="56"
                    height={aH}
                    fill="#DCEBFF"
                    stroke="#171717"
                    strokeWidth="1.5"
                    rx={bH === 0 ? 6 : 4}
                  />
                )}
                {/* DB B segment */}
                {bH > 0 && (
                  <rect
                    x={x}
                    y={28 + aH}
                    width="56"
                    height={bH}
                    fill="#DFF3DF"
                    stroke="#171717"
                    strokeWidth="1.5"
                    rx={aH === 0 ? 6 : 4}
                  />
                )}
              </g>

              {/* Stage percentage label */}
              <text
                x={x + 28}
                y={120}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="10"
                fontWeight="bold"
                fill="#171717"
              >
                {stage.tag}
              </text>

              {/* Arrow between stages */}
              {i < stages.length - 1 && (
                <g>
                  <path
                    d={`M${x + 60} 65 L${x + 76} 65`}
                    stroke="#171717"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <polygon
                    points={`${x + 78},65 ${x + 72},62 ${x + 72},68`}
                    fill="#171717"
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(110, 140)">
          <rect x="0" y="0" width="16" height="12" rx="3" fill="#DCEBFF" stroke="#171717" strokeWidth="1.2" />
          <text x="22" y="10" fontFamily="var(--font-hand)" fontSize="14" fontWeight="bold" fill="#171717">
            DB A (Primary)
          </text>

          <rect x="120" y="0" width="16" height="12" rx="3" fill="#DFF3DF" stroke="#171717" strokeWidth="1.2" />
          <text x="142" y="10" fontFamily="var(--font-hand)" fontSize="14" fontWeight="bold" fill="#171717">
            DB B (Target)
          </text>
        </g>

        {/* Rollback note */}
        <text
          x="220"
          y="172"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="13"
          fontWeight="bold"
          fill="#DC2626"
        >
          ✓ Instant rollback supported via reverse CDC at every stage
        </text>
      </svg>
    </div>
  );
}
