"use client";

export function FeaturedMiniDiagram() {
  return (
    <div className="relative p-2 bg-[#FAF9F5] border-[1.5px] border-[#171717] rounded-xl shadow-[2px_2px_0px_#171717]">
      <svg
        viewBox="0 0 240 140"
        className="w-full max-w-[210px]"
        role="img"
        aria-label="Hand-drawn diagram: App replicating from DB A to DB B via CDC"
      >
        {/* App Box */}
        <rect
          x="85"
          y="6"
          width="70"
          height="28"
          rx="6"
          fill="#FFFFFF"
          stroke="#171717"
          strokeWidth="1.8"
        />
        <text
          x="120"
          y="25"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="15"
          fontWeight="bold"
          fill="#171717"
        >
          App
        </text>

        {/* Diagonal Arrow: App to DB A */}
        <path
          d="M100 35 L70 54"
          stroke="#171717"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <polygon points="66,54 75,54 71,48" fill="#171717" />

        {/* Diagonal Arrow: App to DB B */}
        <path
          d="M140 35 L170 54"
          stroke="#171717"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <polygon points="174,54 165,54 169,48" fill="#171717" />

        {/* DB A (Primary) */}
        <rect
          x="20"
          y="58"
          width="82"
          height="42"
          rx="8"
          fill="#DCEBFF"
          stroke="#171717"
          strokeWidth="1.8"
        />
        <text
          x="61"
          y="77"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="14"
          fontWeight="bold"
          fill="#171717"
        >
          DB A
        </text>
        <text
          x="61"
          y="92"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="9"
          fontWeight="600"
          fill="#4B5563"
        >
          (Primary)
        </text>

        {/* DB B (Target) */}
        <rect
          x="138"
          y="58"
          width="82"
          height="42"
          rx="8"
          fill="#DFF3DF"
          stroke="#171717"
          strokeWidth="1.8"
        />
        <text
          x="179"
          y="77"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="14"
          fontWeight="bold"
          fill="#171717"
        >
          DB B
        </text>
        <text
          x="179"
          y="92"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="9"
          fontWeight="600"
          fill="#4B5563"
        >
          (Target)
        </text>

        {/* CDC Replicating Arrow */}
        <path
          d="M104 79 L134 79"
          stroke="#171717"
          strokeWidth="1.8"
          strokeDasharray="4 2"
        />
        <polygon points="135,79 128,75 128,83" fill="#171717" />
        <text
          x="119"
          y="72"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="9"
          fontWeight="bold"
          fill="#171717"
        >
          CDC
        </text>

        {/* Annotation: Keep it in sync! */}
        <text
          x="120"
          y="125"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="14"
          fontWeight="bold"
          fill="#171717"
        >
          Keep it in sync!
        </text>
        {/* Spark lines */}
        <path d="M72 118 L78 122" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M168 122 L162 118" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
