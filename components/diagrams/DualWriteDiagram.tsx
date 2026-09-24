export function DualWriteDiagram() {
  return (
    <div className="w-full max-w-xl mx-auto p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
      <svg
        viewBox="0 0 480 230"
        className="w-full h-auto"
        role="img"
        aria-label="Dual write failure: Application writes to DB A successfully, but write to DB B fails"
      >
        {/* Application Box */}
        <rect
          x="170"
          y="10"
          width="140"
          height="42"
          rx="8"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="240"
          y="36"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="16"
          fontWeight="bold"
          fill="#171717"
        >
          Application
        </text>

        {/* Forking Arrows */}
        <path
          d="M195 52 C170 70 130 75 108 98"
          stroke="#171717"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polygon points="105,103 115,97 109,92" fill="#171717" />
        <rect x="90" y="62" width="64" height="20" rx="4" fill="#FFFFFF" stroke="#16A34A" strokeWidth="1" />
        <text
          x="122"
          y="76"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="12"
          fontWeight="bold"
          fill="#16A34A"
        >
          Write 1
        </text>

        <path
          d="M285 52 C310 70 350 75 372 98"
          stroke="#171717"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polygon points="375,103 371,92 365,97" fill="#171717" />
        <rect x="326" y="62" width="64" height="20" rx="4" fill="#FFFFFF" stroke="#DC2626" strokeWidth="1" />
        <text
          x="358"
          y="76"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="12"
          fontWeight="bold"
          fill="#DC2626"
        >
          Write 2
        </text>

        {/* DB A */}
        <rect
          x="30"
          y="106"
          width="155"
          height="54"
          rx="10"
          fill="#DFF3DF"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="107.5"
          y="130"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="15"
          fontWeight="bold"
          fill="#171717"
        >
          DB A (Source)
        </text>
        <text
          x="107.5"
          y="148"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10.5"
          fontWeight="bold"
          fill="#16A34A"
        >
          ✓ committed
        </text>

        {/* DB B */}
        <rect
          x="295"
          y="106"
          width="155"
          height="54"
          rx="10"
          fill="#F9DDE5"
          stroke="#DC2626"
          strokeWidth="2"
        />
        <text
          x="372.5"
          y="130"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="15"
          fontWeight="bold"
          fill="#171717"
        >
          DB B (Target)
        </text>
        <text
          x="372.5"
          y="148"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10.5"
          fontWeight="bold"
          fill="#DC2626"
        >
          ✗ network timeout
        </text>

        {/* Divergence Warning Box */}
        <rect
          x="25"
          y="174"
          width="430"
          height="46"
          rx="8"
          fill="#FDE8E8"
          stroke="#DC2626"
          strokeWidth="1.4"
        />
        <text
          x="240"
          y="193"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="13"
          fontWeight="bold"
          fill="#DC2626"
        >
          ⚠ Silent Divergence: Partial Write Failure
        </text>
        <text
          x="240"
          y="209"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="10"
          fontWeight="600"
          fill="#DC2626"
        >
          DB A commits while DB B drops write — no distributed 2PC rollback
        </text>
      </svg>
    </div>
  );
}
