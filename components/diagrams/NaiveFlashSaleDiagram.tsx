export function NaiveFlashSaleDiagram() {
  return (
    <div className="w-full max-w-xl mx-auto p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
      <svg
        viewBox="0 0 540 280"
        className="w-full h-auto"
        role="img"
        aria-label="Naive flash sale: 10M users hit DB directly causing connection pool crash and oversold stock"
      >
        {/* 10M Concurrent Users Node */}
        <rect
          x="125"
          y="10"
          width="250"
          height="48"
          rx="10"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="250"
          y="32"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="17"
          fontWeight="bold"
          fill="#171717"
        >
          10M Concurrent Users
        </text>
        <text
          x="250"
          y="48"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="11"
          fontWeight="500"
          fill="#6B7280"
        >
          All click &ldquo;Buy Now&rdquo; at 12:00:00 PM
        </text>

        {/* Sketched Down Arrow with 2M RPS label */}
        <path
          d="M250 58 L250 96"
          stroke="#DC2626"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <polygon points="250,102 245,92 255,92" fill="#DC2626" />
        <rect x="272" y="66" width="144" height="22" rx="4" fill="#FDE8E8" stroke="#DC2626" strokeWidth="1" />
        <text
          x="344"
          y="81"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10"
          fontWeight="bold"
          fill="#DC2626"
        >
          ~2,000,000 Peak RPS!
        </text>

        {/* App Servers / Pool Exhaustion */}
        <rect
          x="125"
          y="104"
          width="250"
          height="52"
          rx="10"
          fill="#FAF9F5"
          stroke="#DC2626"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <text
          x="250"
          y="126"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="16"
          fontWeight="bold"
          fill="#171717"
        >
          App Server Layer
        </text>
        <text
          x="250"
          y="144"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="10.5"
          fontWeight="bold"
          fill="#DC2626"
        >
          Connection Pool Exhausted (50/50 max)
        </text>

        {/* Left Side 504 Timeouts sticker */}
        <rect x="12" y="110" width="100" height="40" rx="6" fill="#F9DDE5" stroke="#DC2626" strokeWidth="1.2" />
        <text x="62" y="126" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fontWeight="bold" fill="#DC2626">
          504 Timeouts
        </text>
        <text x="62" y="140" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="8.5" fill="#6B7280">
          Cascading Failures
        </text>
        <path d="M112 130 L125 130" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="2 2" />

        {/* Down Arrow to DB */}
        <path
          d="M250 156 L250 188"
          stroke="#DC2626"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <polygon points="250,194 245,184 255,184" fill="#DC2626" />
        <text
          x="265"
          y="178"
          fontFamily="var(--font-mono)"
          fontSize="9.5"
          fontWeight="bold"
          fill="#6B7280"
        >
          SELECT FOR UPDATE (Row Lock)
        </text>

        {/* Database Single Row Failure */}
        <rect
          x="125"
          y="196"
          width="250"
          height="56"
          rx="10"
          fill="#FDE8E8"
          stroke="#DC2626"
          strokeWidth="2"
        />
        <text
          x="250"
          y="220"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="16"
          fontWeight="bold"
          fill="#171717"
        >
          Single DB Row: iPhone 16
        </text>
        <text
          x="250"
          y="240"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="11"
          fontWeight="bold"
          fill="#DC2626"
        >
          stock = -142 (OVERSOLD!)
        </text>

        {/* Right side deadlock note */}
        <rect x="395" y="203" width="130" height="42" rx="6" fill="#F9DDE5" stroke="#DC2626" strokeWidth="1.2" />
        <text x="460" y="221" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fontWeight="bold" fill="#DC2626">
          Deadlocks
        </text>
        <text x="460" y="236" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="8.5" fill="#6B7280">
          Lock Serialization
        </text>
        <path d="M375 224 L395 224" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}
