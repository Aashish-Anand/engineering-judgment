export function MigrationArchitectureDiagram() {
  return (
    <div className="w-full max-w-lg mx-auto p-5 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
      <svg
        viewBox="0 0 460 310"
        className="w-full h-auto"
        role="img"
        aria-label="Recommended Migration Architecture: Application writes to Primary DB A, replicating via Snapshot + CDC to Target DB B"
      >
        {/* Top: Application Box */}
        <rect
          x="165"
          y="12"
          width="130"
          height="42"
          rx="8"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="230"
          y="38"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="18"
          fontWeight="bold"
          fill="#171717"
        >
          Application
        </text>

        {/* Diagonal Arrow: App to DB A (Primary) */}
        <path
          d="M190 54 L115 102"
          stroke="#171717"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polygon points="110,105 120,103 116,95" fill="#171717" />
        <text
          x="125"
          y="75"
          fontFamily="var(--font-hand)"
          fontSize="13"
          fontWeight="bold"
          fill="#171717"
          transform="rotate(-25 125,75)"
        >
          reads + writes
        </text>

        {/* Diagonal Arrow: App to DB B (Target via Feature Flag) */}
        <path
          d="M270 54 L345 102"
          stroke="#171717"
          strokeWidth="1.8"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
        <polygon points="350,105 344,95 340,103" fill="#171717" />
        <text
          x="315"
          y="75"
          fontFamily="var(--font-hand)"
          fontSize="12"
          fontWeight="bold"
          fill="#4B5563"
          transform="rotate(25 315,75)"
        >
          dark read / cutover
        </text>

        {/* DB A (Primary) - Database cylinder shape */}
        <rect
          x="45"
          y="110"
          width="135"
          height="70"
          rx="12"
          fill="#DCEBFF"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="112"
          y="140"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="19"
          fontWeight="bold"
          fill="#171717"
        >
          DB A (Primary)
        </text>
        <text
          x="112"
          y="162"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="11"
          fontWeight="bold"
          fill="#171717"
        >
          100M R · 10M W
        </text>
        {/* "source" annotation */}
        <text
          x="112"
          y="198"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="13"
          fontWeight="bold"
          fill="#6B7280"
        >
          [Current Source of Truth]
        </text>

        {/* CDC + Snapshot Pipeline between DB A and DB B */}
        <path
          d="M185 145 L275 145"
          stroke="#DC2626"
          strokeWidth="2.5"
          strokeDasharray="5 3"
        />
        <polygon points="282,145 272,140 272,150" fill="#DC2626" />
        {/* Pipeline badge */}
        <rect
          x="192"
          y="116"
          width="78"
          height="22"
          rx="4"
          fill="#FFF0B8"
          stroke="#171717"
          strokeWidth="1.2"
        />
        <text
          x="231"
          y="131"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10"
          fontWeight="bold"
          fill="#171717"
        >
          Snapshot + CDC
        </text>

        {/* DB B (Target) */}
        <rect
          x="285"
          y="110"
          width="135"
          height="70"
          rx="12"
          fill="#DFF3DF"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="352"
          y="140"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="19"
          fontWeight="bold"
          fill="#171717"
        >
          DB B (Target)
        </text>
        <text
          x="352"
          y="162"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="11"
          fontWeight="bold"
          fill="#171717"
        >
          Replicating &amp; Lag &lt; 1s
        </text>
        <text
          x="352"
          y="198"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="13"
          fontWeight="bold"
          fill="#16A34A"
        >
          [New Target Engine]
        </text>

        {/* Handwritten Annotation: Keep both in sync! */}
        <g>
          <text
            x="231"
            y="180"
            textAnchor="middle"
            fontFamily="var(--font-hand)"
            fontSize="15"
            fontWeight="bold"
            fill="#171717"
          >
            Keep both in sync!
          </text>
          {/* Small spark lines */}
          <path d="M185 174 L192 178" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M277 178 L270 174" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Validation Checker Box at bottom */}
        <rect
          x="90"
          y="230"
          width="280"
          height="55"
          rx="8"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
        <text
          x="230"
          y="252"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="15"
          fontWeight="bold"
          fill="#171717"
        >
          Continuous Validation Pipeline
        </text>
        <text
          x="230"
          y="272"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fontWeight="600"
          fill="#4B5563"
        >
          Checksums · Row Count Audits · Re-read Divergence Checks
        </text>
        {/* Connecting check lines */}
        <line x1="112" y1="205" x2="112" y2="230" stroke="#171717" strokeWidth="1.2" strokeDasharray="2 2" />
        <line x1="352" y1="205" x2="352" y2="230" stroke="#171717" strokeWidth="1.2" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}
