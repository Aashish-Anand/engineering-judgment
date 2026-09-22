export function FlashSaleArchitectureDiagram() {
  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
      <svg
        viewBox="0 0 460 480"
        className="w-full h-auto"
        role="img"
        aria-label="Flash sale layered funnel architecture: Traffic sheds progressively from 10M buyers to Redis Lua to Kafka to DB"
      >
        {/* Level 1: 10M Buyers */}
        <rect
          x="30"
          y="10"
          width="400"
          height="44"
          rx="8"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="1.8"
        />
        <text
          x="230"
          y="32"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="17"
          fontWeight="bold"
          fill="#171717"
        >
          10M Concurrent Buyers (~2,000,000 Peak RPS)
        </text>

        {/* Down arrow 1 */}
        <path d="M230 54 L230 76" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" />
        <polygon points="230,81 226,73 234,73" fill="#171717" />
        <text x="330" y="70" fontFamily="var(--font-hand)" fontSize="12" fontWeight="bold" fill="#6B7280">
          ↳ Bot &amp; static traffic
        </text>

        {/* Level 2: CDN Edge & Cloud WAF */}
        <rect
          x="50"
          y="84"
          width="360"
          height="48"
          rx="8"
          fill="#DCEBFF"
          stroke="#171717"
          strokeWidth="1.8"
        />
        <text
          x="230"
          y="106"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="16"
          fontWeight="bold"
          fill="#171717"
        >
          CDN Edge &amp; Cloud WAF (Cloudflare / Fastly)
        </text>
        <text
          x="230"
          y="122"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="10"
          fontWeight="500"
          fill="#374151"
        >
          Static asset caching · JA3 bot fingerprinting · Sheds 70% of spikes
        </text>

        {/* Down arrow 2 */}
        <path d="M230 132 L230 154" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" />
        <polygon points="230,159 226,151 234,151" fill="#171717" />
        <text x="335" y="148" fontFamily="var(--font-hand)" fontSize="12" fontWeight="bold" fill="#6B7280">
          ↳ ~600,000 RPS
        </text>

        {/* Level 3: Virtual Waiting Room */}
        <rect
          x="75"
          y="162"
          width="310"
          height="48"
          rx="8"
          fill="#FFF0B8"
          stroke="#171717"
          strokeWidth="1.8"
        />
        <text
          x="230"
          y="184"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="16"
          fontWeight="bold"
          fill="#171717"
        >
          Virtual Waiting Room (Fair Queuing)
        </text>
        <text
          x="230"
          y="200"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="10"
          fontWeight="500"
          fill="#374151"
        >
          Cryptographic signed queue tokens · Leaky-bucket release (50K/sec)
        </text>

        {/* Down arrow 3 */}
        <path d="M230 210 L230 232" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" />
        <polygon points="230,237 226,229 234,229" fill="#171717" />
        <text x="335" y="226" fontFamily="var(--font-hand)" fontSize="12" fontWeight="bold" fill="#6B7280">
          ↳ Controlled 50k RPS
        </text>

        {/* Level 4: Redis Lua In-Memory Stock Gate */}
        <rect
          x="95"
          y="240"
          width="270"
          height="54"
          rx="8"
          fill="#DFF3DF"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="230"
          y="262"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="17"
          fontWeight="bold"
          fill="#171717"
        >
          Redis In-Memory Stock Gate
        </text>
        <text
          x="230"
          y="282"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="11"
          fontWeight="bold"
          fill="#16A34A"
        >
          Single-threaded atomic Lua: DECRBY &lt; 0.5ms
        </text>

        {/* Down arrow 4 */}
        <path d="M230 294 L230 316" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" />
        <polygon points="230,321 226,313 234,313" fill="#171717" />
        <text x="330" y="310" fontFamily="var(--font-hand)" fontSize="12" fontWeight="bold" fill="#16A34A">
          ↳ Exactly 10,000 wins
        </text>

        {/* Level 5: Kafka Queue */}
        <rect
          x="115"
          y="324"
          width="230"
          height="48"
          rx="8"
          fill="#E7E1F8"
          stroke="#171717"
          strokeWidth="1.8"
        />
        <text
          x="230"
          y="346"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="16"
          fontWeight="bold"
          fill="#171717"
        >
          Kafka Order Buffer Queue
        </text>
        <text
          x="230"
          y="362"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="10"
          fontWeight="500"
          fill="#374151"
        >
          Partitioned by userId · Decouples write spike from DB
        </text>

        {/* Down arrow 5 */}
        <path d="M230 372 L230 394" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" />
        <polygon points="230,399 226,391 234,391" fill="#171717" />
        <text x="330" y="388" fontFamily="var(--font-hand)" fontSize="12" fontWeight="bold" fill="#6B7280">
          ↳ Smooth 500 WPS
        </text>

        {/* Level 6: Database Settlement Worker */}
        <rect
          x="135"
          y="402"
          width="190"
          height="54"
          rx="10"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="2"
        />
        <text
          x="230"
          y="424"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="17"
          fontWeight="bold"
          fill="#171717"
        >
          Database Settlement
        </text>
        <text
          x="230"
          y="442"
          textAnchor="middle"
          fontFamily="var(--font-sans)"
          fontSize="10"
          fontWeight="600"
          fill="#16A34A"
        >
          Batched INSERTs · Zero Overdraft
        </text>

        {/* Funnel Note */}
        <text
          x="230"
          y="472"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="13"
          fontWeight="bold"
          fill="#171717"
        >
          ✓ Traffic shed progressively: 10M buyers ➔ exactly 10,000 database records
        </text>
      </svg>
    </div>
  );
}
