export function NaiveMigrationDiagram() {
  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
      <svg
        viewBox="0 0 420 160"
        className="w-full h-auto"
        role="img"
        aria-label="Naive migration: DB A dumps to DB B while production writes continue"
      >
        {/* DB A (Production) */}
        <rect
          x="20"
          y="25"
          width="120"
          height="55"
          rx="10"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="80"
          y="48"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="17"
          fontWeight="bold"
          fill="#171717"
        >
          DB A
        </text>
        <text
          x="80"
          y="66"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fontWeight="600"
          fill="#4B5563"
        >
          (Production)
        </text>

        {/* Sketched Dump Arrow */}
        <path
          d="M145 52 C200 48 220 48 268 52"
          stroke="#171717"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polygon points="274,52 264,47 266,57" fill="#171717" />
        <text
          x="208"
          y="42"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="15"
          fontWeight="bold"
          fill="#171717"
        >
          &ldquo;just dump it&rdquo;
        </text>

        {/* DB B (New) */}
        <rect
          x="280"
          y="25"
          width="120"
          height="55"
          rx="10"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="340"
          y="48"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="17"
          fontWeight="bold"
          fill="#171717"
        >
          DB B
        </text>
        <text
          x="340"
          y="66"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fontWeight="600"
          fill="#4B5563"
        >
          (New)
        </text>

        {/* Ongoing Writes Annotation */}
        <path
          d="M80 83 L80 110"
          stroke="#DC2626"
          strokeWidth="1.8"
          strokeDasharray="3 3"
        />
        <polygon points="80,82 76,89 84,89" fill="#DC2626" />
        <text
          x="80"
          y="126"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="13"
          fontWeight="bold"
          fill="#DC2626"
        >
          ⚡ 10M writes still arriving!
        </text>

        {/* "Wait..." annotation pointing to gap */}
        <text
          x="208"
          y="80"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="18"
          fontWeight="bold"
          fill="#DC2626"
        >
          Wait...
        </text>
        <path
          d="M208 86 C210 100 240 105 255 115"
          stroke="#DC2626"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="257,118 248,114 252,108" fill="#DC2626" />
      </svg>
    </div>
  );
}
