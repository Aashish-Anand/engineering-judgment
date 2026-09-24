export function MigrationArchitectureDiagram() {
  return (
    <div className="w-full max-w-xl mx-auto p-5 sm:p-6 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
      <svg
        viewBox="0 0 540 330"
        className="w-full h-auto"
        role="img"
        aria-label="Recommended Migration Architecture: Application writes to Primary DB A, replicating via Snapshot + CDC to Target DB B"
      >
        {/* Top: Application Box */}
        <rect
          x="200"
          y="12"
          width="140"
          height="44"
          rx="8"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="270"
          y="39"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="16"
          fontWeight="bold"
          fill="#171717"
        >
          Application
        </text>

        {/* Diagonal Arrow: App to DB A (Primary) */}
        <path
          d="M200 52 L116 106"
          stroke="#171717"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polygon points="110,110 120,107 116,98" fill="#171717" />
        {/* Label with white pill background for zero collision */}
        <rect
          x="94"
          y="68"
          width="96"
          height="20"
          rx="4"
          fill="#FFFFFF"
          stroke="#171717"
          strokeWidth="1"
        />
        <text
          x="142"
          y="82"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="11.5"
          fontWeight="bold"
          fill="#171717"
        >
          reads + writes
        </text>

        {/* Diagonal Arrow: App to DB B (Target via Feature Flag) */}
        <path
          d="M340 52 L424 106"
          stroke="#171717"
          strokeWidth="1.8"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
        <polygon points="430,110 424,98 420,107" fill="#171717" />
        {/* Label with white pill background */}
        <rect
          x="356"
          y="68"
          width="122"
          height="20"
          rx="4"
          fill="#FFFFFF"
          stroke="#171717"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <text
          x="417"
          y="82"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="11"
          fontWeight="bold"
          fill="#4B5563"
        >
          dark read / cutover
        </text>

        {/* DB A (Primary) - Database box with ample padding */}
        <rect
          x="25"
          y="112"
          width="165"
          height="74"
          rx="10"
          fill="#DCEBFF"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="107.5"
          y="142"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="16"
          fontWeight="bold"
          fill="#171717"
        >
          DB A (Primary)
        </text>
        <text
          x="107.5"
          y="166"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10.5"
          fontWeight="600"
          fill="#374151"
        >
          100M reads · 10M writes
        </text>
        {/* "source" annotation below DB A */}
        <text
          x="107.5"
          y="208"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="11.5"
          fontWeight="600"
          fill="#4B5563"
        >
          [Current Source of Truth]
        </text>

        {/* CDC + Snapshot Pipeline between DB A and DB B */}
        <path
          d="M196 148 L342 148"
          stroke="#DC2626"
          strokeWidth="2.5"
          strokeDasharray="5 3"
        />
        <polygon points="348,148 338,143 338,153" fill="#DC2626" />
        {/* Pipeline badge - perfectly sized to enclose text */}
        <rect
          x="212"
          y="116"
          width="116"
          height="24"
          rx="5"
          fill="#FFF0B8"
          stroke="#171717"
          strokeWidth="1.2"
        />
        <text
          x="270"
          y="132"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10"
          fontWeight="bold"
          fill="#171717"
        >
          Snapshot + CDC
        </text>

        {/* DB B (Target) - Database box with ample padding */}
        <rect
          x="350"
          y="112"
          width="165"
          height="74"
          rx="10"
          fill="#DFF3DF"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="432.5"
          y="142"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="16"
          fontWeight="bold"
          fill="#171717"
        >
          DB B (Target)
        </text>
        <text
          x="432.5"
          y="166"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10.5"
          fontWeight="600"
          fill="#16A34A"
        >
          Replicating (Lag &lt; 1s)
        </text>
        <text
          x="432.5"
          y="208"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="11.5"
          fontWeight="600"
          fill="#16A34A"
        >
          [New Target Engine]
        </text>

        {/* Handwritten Annotation: Keep both in sync! */}
        <g>
          <text
            x="270"
            y="178"
            textAnchor="middle"
            fontFamily="var(--font-hand)"
            fontSize="13"
            fontWeight="bold"
            fill="#171717"
          >
            Keep both in sync!
          </text>
          {/* Small spark lines */}
          <path d="M208 174 L216 177" stroke="#171717" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M332 177 L324 174" stroke="#171717" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Validation Checker Box at bottom */}
        <rect
          x="80"
          y="246"
          width="380"
          height="54"
          rx="8"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
        <text
          x="270"
          y="268"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="14.5"
          fontWeight="bold"
          fill="#171717"
        >
          Continuous Validation Pipeline
        </text>
        <text
          x="270"
          y="287"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="10.5"
          fontWeight="600"
          fill="#4B5563"
        >
          Checksums · Row Count Audits · Re-read Divergence Checks
        </text>
        {/* Connecting check lines */}
        <line x1="107.5" y1="216" x2="107.5" y2="246" stroke="#171717" strokeWidth="1.2" strokeDasharray="2 2" />
        <line x1="432.5" y1="216" x2="432.5" y2="246" stroke="#171717" strokeWidth="1.2" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}
