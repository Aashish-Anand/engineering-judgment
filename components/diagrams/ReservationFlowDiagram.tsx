export function ReservationFlowDiagram() {
  return (
    <div className="w-full max-w-xl mx-auto p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
      <svg
        viewBox="0 0 540 220"
        className="w-full h-auto"
        role="img"
        aria-label="Reservation lifecycle flow with hand-drawn branches for success and TTL expiration"
      >
        {/* Starting Node: Stock Reserved */}
        <rect
          x="15"
          y="80"
          width="160"
          height="56"
          rx="10"
          fill="#FFF0B8"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="95"
          y="104"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="14.5"
          fontWeight="bold"
          fill="#171717"
        >
          Inventory Reserved
        </text>
        <text
          x="95"
          y="123"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10"
          fontWeight="bold"
          fill="#171717"
        >
          ⏱️ 10-min TTL Clock
        </text>

        {/* Fork to Upper Path (Payment Success) */}
        <path
          d="M 175 96 C 190 70 220 42 254 42"
          fill="none"
          stroke="#16A34A"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polygon points="258,42 250,38 250,46" fill="#16A34A" />

        {/* Fork to Lower Path (TTL Expiry) */}
        <path
          d="M 175 120 C 190 146 220 175 254 175"
          fill="none"
          stroke="#DC2626"
          strokeWidth="2"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
        <polygon points="258,175 250,171 250,179" fill="#DC2626" />

        {/* Central annotation badge placed cleanly between branches */}
        <rect
          x="188"
          y="95"
          width="108"
          height="26"
          rx="5"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="1.2"
        />
        <text
          x="242"
          y="112"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="11.5"
          fontWeight="bold"
          fill="#171717"
        >
          Zero Leaked Units
        </text>

        {/* Upper Path: Payment Success */}
        <rect
          x="262"
          y="15"
          width="262"
          height="54"
          rx="8"
          fill="#DFF3DF"
          stroke="#16A34A"
          strokeWidth="1.8"
        />
        <text
          x="393"
          y="37"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="14.5"
          fontWeight="bold"
          fill="#16A34A"
        >
          ✓ Payment Received &lt; 10 min
        </text>
        <text
          x="393"
          y="55"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="9.5"
          fontWeight="500"
          fill="#374151"
        >
          Order confirmed · Permanent inventory deduction
        </text>

        {/* Lower Path: TTL Expired */}
        <rect
          x="262"
          y="148"
          width="262"
          height="54"
          rx="8"
          fill="#FDE8E8"
          stroke="#DC2626"
          strokeWidth="1.8"
        />
        <text
          x="393"
          y="170"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="14.5"
          fontWeight="bold"
          fill="#DC2626"
        >
          ✗ TTL Expired / User Dropped
        </text>
        <text
          x="393"
          y="188"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="9.5"
          fontWeight="500"
          fill="#374151"
        >
          Worker returns +1 to Redis · Slot given to next user
        </text>
      </svg>
    </div>
  );
}
