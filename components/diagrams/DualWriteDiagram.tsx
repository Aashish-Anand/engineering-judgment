export function DualWriteDiagram() {
  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
      <svg
        viewBox="0 0 420 220"
        className="w-full h-auto"
        role="img"
        aria-label="Dual write failure: Application writes to DB A successfully, but write to DB B fails"
      >
        {/* Application Box */}
        <rect
          x="145"
          y="12"
          width="130"
          height="40"
          rx="8"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="210"
          y="37"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="17"
          fontWeight="bold"
          fill="#171717"
        >
          Application
        </text>

        {/* Forking Arrows */}
        <path
          d="M170 52 C150 70 110 75 90 98"
          stroke="#171717"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polygon points="87,103 97,97 91,92" fill="#171717" />
        <text
          x="95"
          y="70"
          fontFamily="var(--font-hand)"
          fontSize="13"
          fontWeight="bold"
          fill="#16A34A"
        >
          Write 1
        </text>

        <path
          d="M250 52 C270 70 310 75 330 98"
          stroke="#171717"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polygon points="333,103 329,92 323,97" fill="#171717" />
        <text
          x="320"
          y="70"
          fontFamily="var(--font-hand)"
          fontSize="13"
          fontWeight="bold"
          fill="#DC2626"
        >
          Write 2
        </text>

        {/* DB A */}
        <rect
          x="30"
          y="108"
          width="120"
          height="50"
          rx="10"
          fill="#DFF3DF"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="90"
          y="132"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="17"
          fontWeight="bold"
          fill="#171717"
        >
          DB A (Source)
        </text>
        <text
          x="90"
          y="150"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="11"
          fontWeight="bold"
          fill="#16A34A"
        >
          ✓ committed
        </text>

        {/* DB B */}
        <rect
          x="270"
          y="108"
          width="120"
          height="50"
          rx="10"
          fill="#F9DDE5"
          stroke="#DC2626"
          strokeWidth="2"
        />
        <text
          x="330"
          y="132"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="17"
          fontWeight="bold"
          fill="#171717"
        >
          DB B (Target)
        </text>
        <text
          x="330"
          y="150"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="11"
          fontWeight="bold"
          fill="#DC2626"
        >
          ✗ network timeout
        </text>

        {/* Divergence Warning Box */}
        <rect
          x="50"
          y="178"
          width="320"
          height="32"
          rx="6"
          fill="#FDE8E8"
          stroke="#DC2626"
          strokeWidth="1.2"
        />
        <text
          x="210"
          y="199"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="14"
          fontWeight="bold"
          fill="#DC2626"
        >
          ⚠ Silent divergence: partial write failure with no distributed rollback!
        </text>
      </svg>
    </div>
  );
}
