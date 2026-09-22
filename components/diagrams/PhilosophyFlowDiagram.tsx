"use client";

export function PhilosophyFlowDiagram() {
  const steps = [
    { label: "Problem", desc: "What is breaking?", pastel: "#DCEBFF" },
    { label: "Constraint", desc: "What can't change?", pastel: "#FFF0B8" },
    { label: "Bottleneck", desc: "Where does it fail?", pastel: "#F9DDE5" },
    { label: "Decision", desc: "What can we change?", pastel: "#DFF3DF" },
    { label: "Trade-off", desc: "What are we giving up?", pastel: "#E7E1F8" },
    { label: "Failure", desc: "How can it break in prod?", pastel: "#F9DDE5" },
  ];

  const boxWidth = 220;
  const boxHeight = 52;
  const gap = 20;
  const totalHeight = steps.length * (boxHeight + gap) + 40;
  const centerX = 140;

  return (
    <div className="p-4 bg-white border-[1.5px] border-[#171717] rounded-[16px_14px_18px_13px] shadow-[3px_4px_0px_#171717] max-w-sm mx-auto">
      <div className="font-hand font-bold text-center text-lg text-[#171717] mb-2 border-b border-dashed border-[#171717]/20 pb-2">
        Senior Engineer&apos;s Whiteboard Chain
      </div>
      <svg
        viewBox={`0 0 280 ${totalHeight}`}
        className="w-full h-auto mx-auto"
        role="img"
        aria-label="Engineering thinking flow: Problem → Constraint → Bottleneck → Decision → Trade-off → Failure → What breaks next?"
      >
        {steps.map((step, i) => {
          const y = 8 + i * (boxHeight + gap);
          const x = centerX - boxWidth / 2;

          return (
            <g key={step.label}>
              {/* Sketched arrow from previous step */}
              {i > 0 && (
                <g>
                  <line
                    x1={centerX}
                    y1={y - gap}
                    x2={centerX}
                    y2={y}
                    stroke="#171717"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <polygon
                    points={`${centerX - 4},${y - 5} ${centerX + 4},${y - 5} ${centerX},${y}`}
                    fill="#171717"
                  />
                </g>
              )}

              {/* Hand-drawn box with pastel tint */}
              <rect
                x={x}
                y={y}
                width={boxWidth}
                height={boxHeight}
                rx="8"
                fill={step.pastel}
                stroke="#171717"
                strokeWidth="1.8"
              />

              {/* Step label in handwriting */}
              <text
                x={centerX}
                y={y + 22}
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fontFamily="var(--font-hand)"
                fill="#171717"
              >
                {step.label}
              </text>

              {/* Description in clean sans */}
              <text
                x={centerX}
                y={y + 40}
                textAnchor="middle"
                fontSize="11"
                fontFamily="var(--font-sans)"
                fontWeight="500"
                fill="#374151"
              >
                {step.desc}
              </text>
            </g>
          );
        })}

        {/* Final handwritten loop */}
        <g>
          <line
            x1={centerX}
            y1={totalHeight - 40}
            x2={centerX}
            y2={totalHeight - 24}
            stroke="#DC2626"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <polygon
            points={`${centerX - 4},${totalHeight - 29} ${centerX + 4},${totalHeight - 29} ${centerX},${totalHeight - 24}`}
            fill="#DC2626"
          />
          <text
            x={centerX}
            y={totalHeight - 8}
            textAnchor="middle"
            fontSize="15"
            fontFamily="var(--font-hand)"
            fontWeight="bold"
            fill="#DC2626"
          >
            ↳ What breaks next?
          </text>
        </g>
      </svg>
    </div>
  );
}
