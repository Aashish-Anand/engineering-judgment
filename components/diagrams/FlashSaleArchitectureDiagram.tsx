export function FlashSaleArchitectureDiagram() {
  return (
    <div className="w-full max-w-xl mx-auto p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
      <svg
        viewBox="0 0 540 505"
        className="w-full h-auto"
        role="img"
        aria-label="Flash sale layered funnel architecture: Traffic sheds progressively from 10M buyers to Redis Lua to Kafka to DB"
      >
        {/* Level 1: 10M Buyers */}
        <rect
          x="25"
          y="10"
          width="380"
          height="44"
          rx="8"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="1.8"
        />
        <text
          x="215"
          y="32"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="15"
          fontWeight="bold"
          fill="#171717"
        >
          10M Concurrent Buyers (~2,000,000 Peak RPS)
        </text>

        {/* Down arrow 1 */}
        <path d="M215 54 L215 76" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" />
        <polygon points="215,81 211,73 219,73" fill="#171717" />
        <text x="360" y="70" fontFamily="var(--font-hand)" fontSize="11.5" fontWeight="bold" fill="#6B7280">
          ↳ Bot &amp; static traffic
        </text>

        {/* Level 2: CDN Edge & Cloud WAF */}
        <rect
          x="40"
          y="84"
          width="350"
          height="48"
          rx="8"
          fill="#DCEBFF"
          stroke="#171717"
          strokeWidth="1.8"
        />
        <text
          x="215"
          y="105"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="14.5"
          fontWeight="bold"
          fill="#171717"
        >
          CDN Edge &amp; Cloud WAF (Edge Caching)
        </text>
        <text
          x="215"
          y="122"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="9.5"
          fontWeight="500"
          fill="#374151"
        >
          Static asset caching · JA3 bot fingerprinting · Sheds 70%
        </text>

        {/* Down arrow 2 */}
        <path d="M215 132 L215 154" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" />
        <polygon points="215,159 211,151 219,151" fill="#171717" />
        <text x="360" y="148" fontFamily="var(--font-hand)" fontSize="11.5" fontWeight="bold" fill="#6B7280">
          ↳ ~600,000 RPS
        </text>

        {/* Level 3: Virtual Waiting Room */}
        <rect
          x="60"
          y="162"
          width="310"
          height="48"
          rx="8"
          fill="#FFF0B8"
          stroke="#171717"
          strokeWidth="1.8"
        />
        <text
          x="215"
          y="183"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="14"
          fontWeight="bold"
          fill="#171717"
        >
          Virtual Waiting Room (Fair Queuing)
        </text>
        <text
          x="215"
          y="200"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="9.5"
          fontWeight="500"
          fill="#374151"
        >
          Signed queue tokens · Leaky-bucket release (50K/sec)
        </text>

        {/* Down arrow 3 */}
        <path d="M215 210 L215 232" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" />
        <polygon points="215,237 211,229 219,229" fill="#171717" />
        <text x="360" y="226" fontFamily="var(--font-hand)" fontSize="11.5" fontWeight="bold" fill="#6B7280">
          ↳ Controlled 50K RPS
        </text>

        {/* Level 4: Redis Lua In-Memory Stock Gate */}
        <rect
          x="80"
          y="240"
          width="270"
          height="52"
          rx="8"
          fill="#DFF3DF"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="215"
          y="262"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="14.5"
          fontWeight="bold"
          fill="#171717"
        >
          Redis In-Memory Stock Gate
        </text>
        <text
          x="215"
          y="281"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10"
          fontWeight="bold"
          fill="#16A34A"
        >
          Single-threaded atomic Lua: DECRBY &lt; 0.5ms
        </text>

        {/* Down arrow 4 */}
        <path d="M215 292 L215 314" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" />
        <polygon points="215,319 211,311 219,311" fill="#171717" />
        <text x="360" y="308" fontFamily="var(--font-hand)" fontSize="11.5" fontWeight="bold" fill="#16A34A">
          ↳ Exactly 10,000 wins
        </text>

        {/* Level 5: Kafka Queue */}
        <rect
          x="100"
          y="322"
          width="230"
          height="48"
          rx="8"
          fill="#E7E1F8"
          stroke="#171717"
          strokeWidth="1.8"
        />
        <text
          x="215"
          y="343"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="14"
          fontWeight="bold"
          fill="#171717"
        >
          Kafka Order Buffer Queue
        </text>
        <text
          x="215"
          y="359"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="9.5"
          fontWeight="500"
          fill="#374151"
        >
          Partitioned by userId · Decouples DB spike
        </text>

        {/* Down arrow 5 */}
        <path d="M215 370 L215 392" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" />
        <polygon points="215,397 211,389 219,389" fill="#171717" />
        <text x="360" y="386" fontFamily="var(--font-hand)" fontSize="11.5" fontWeight="bold" fill="#6B7280">
          ↳ Smooth 500 WPS
        </text>

        {/* Level 6: Database Settlement Worker */}
        <rect
          x="120"
          y="400"
          width="190"
          height="50"
          rx="10"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="215"
          y="422"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="14.5"
          fontWeight="bold"
          fill="#171717"
        >
          Database Settlement
        </text>
        <text
          x="215"
          y="440"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="9.5"
          fontWeight="600"
          fill="#16A34A"
        >
          Batched INSERTs · Zero Overdraft
        </text>

        {/* Funnel Note Pill Container */}
        <rect
          x="35"
          y="464"
          width="470"
          height="28"
          rx="6"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="1.2"
        />
        <text
          x="270"
          y="483"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="12"
          fontWeight="bold"
          fill="#16A34A"
        >
          ✓ Traffic shed progressively: 10M buyers ➔ exactly 10,000 DB orders
        </text>
      </svg>
    </div>
  );
}
