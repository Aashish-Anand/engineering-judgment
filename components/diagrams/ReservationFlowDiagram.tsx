export function ReservationFlowDiagram() {
  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
      <svg
        viewBox="0 0 460 220"
        className="w-full h-auto"
        role="img"
        aria-label="Reservation lifecycle flow with hand-drawn branches for success and TTL expiration"
      >
        {/* Starting Node: Stock Reserved */}
        <rect
          x="10"
          y="80"
          width="130"
          height="55"
          rx="10"
          fill="#FFF0B8"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="75"
          y="104"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="17"
          fontWeight="bold"
          fill="#171717"
        >
          Inventory Reserved
        </text>
        <text
          x="75"
          y="122"
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
          d="M 140 102 C 170 102 180 40 215 40"
          fill="none"
          stroke="#16A34A"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polygon points="218,40 210,36 210,44" fill="#16A34A" />

        {/* Fork to Lower Path (TTL Expiry) */}
        <path
          d="M 140 114 C 170 114 180 175 215 175"
          fill="none"
          stroke="#DC2626"
          strokeWidth="2"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
        <polygon points="218,175 210,171 210,179" fill="#DC2626" />

        {/* Upper Path: Payment Success */}
        <rect
          x="220"
          y="15"
          width="230"
          height="52"
          rx="8"
          fill="#DFF3DF"
          stroke="#16A34A"
          strokeWidth="1.8"
        />
        <text
          x="335"
          y="36"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="16"
          fontWeight="bold"
          fill="#16A34A"
        >
          ✓ Payment Received &lt; 10 min
        </text>
        <text
          x="335"
          y="54"
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
          x="220"
          y="150"
          width="230"
          height="52"
          rx="8"
          fill="#FDE8E8"
          stroke="#DC2626"
          strokeWidth="1.8"
        />
        <text
          x="335"
          y="171"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="16"
          fontWeight="bold"
          fill="#DC2626"
        >
          ✗ TTL Expired / User Dropped
        </text>
        <text
          x="335"
          y="189"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="9.5"
          fontWeight="500"
          fill="#374151"
        >
          Worker returns +1 to Redis · Slot given to next user
        </text>

        {/* Central annotation badge */}
        <rect
          x="145"
          y="95"
          width="100"
          height="24"
          rx="4"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="1.2"
        />
        <text
          x="195"
          y="111"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="13"
          fontWeight="bold"
          fill="#171717"
        >
          Zero Leaked Units
        </text>
      </svg>
    </div>
  );
}
