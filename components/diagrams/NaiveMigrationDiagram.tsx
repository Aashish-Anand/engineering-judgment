export function NaiveMigrationDiagram() {
  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
      <svg
        viewBox="0 0 440 160"
        className="w-full h-auto"
        role="img"
        aria-label="Naive migration: DB A dumps to DB B while production writes continue"
      >
        {/* DB A (Production) */}
        <rect
          x="25"
          y="25"
          width="125"
          height="55"
          rx="10"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="87.5"
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
          x="87.5"
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
          d="M152 52 C205 48 225 48 278 52"
          stroke="#171717"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polygon points="284,52 274,47 276,57" fill="#171717" />
        <text
          x="215"
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
          x="290"
          y="25"
          width="125"
          height="55"
          rx="10"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="352.5"
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
          x="352.5"
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
          d="M87.5 83 L87.5 110"
          stroke="#DC2626"
          strokeWidth="1.8"
          strokeDasharray="3 3"
        />
        <polygon points="87.5,82 83.5,89 91.5,89" fill="#DC2626" />
        <text
          x="95"
          y="126"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="12.5"
          fontWeight="bold"
          fill="#DC2626"
        >
          ⚡ 10M writes still arriving!
        </text>

        {/* "Wait..." annotation pointing to gap */}
        <text
          x="215"
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
          d="M215 86 C217 100 245 105 260 115"
          stroke="#DC2626"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="262,118 253,114 257,108" fill="#DC2626" />
      </svg>
    </div>
  );
}
