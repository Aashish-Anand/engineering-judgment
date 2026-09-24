export function InventoryRaceDiagram() {
  return (
    <div className="w-full max-w-xl mx-auto p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
      <svg
        viewBox="0 0 540 310"
        className="w-full h-auto"
        role="img"
        aria-label="Inventory race condition comparison: Naive vs Atomic Redis Lua script"
      >
        {/* ── TOP: Without Atomicity ── */}
        <rect
          x="12"
          y="10"
          width="516"
          height="132"
          rx="10"
          fill="#FAF9F5"
          stroke="#DC2626"
          strokeWidth="1.8"
        />
        <text
          x="24"
          y="31"
          fontFamily="var(--font-hand)"
          fontSize="14.5"
          fontWeight="bold"
          fill="#DC2626"
        >
          WITHOUT ATOMICITY · Naive SELECT + UPDATE
        </text>

        {/* Thread A track */}
        <rect
          x="24"
          y="42"
          width="230"
          height="42"
          rx="6"
          fill="#FFFFFF"
          stroke="#171717"
          strokeWidth="1.2"
        />
        <text x="34" y="58" fontSize="10.5" fontFamily="var(--font-mono)" fontWeight="bold" fill="#171717">
          Thread A: Read stock = 1
        </text>
        <text x="34" y="74" fontSize="10" fontFamily="var(--font-sans)" fontWeight="600" fill="#16A34A">
          Writes stock = 0 ➔ Reserved ✓
        </text>

        {/* Thread B track */}
        <rect
          x="266"
          y="42"
          width="250"
          height="42"
          rx="6"
          fill="#FDE8E8"
          stroke="#DC2626"
          strokeWidth="1.5"
        />
        <text x="276" y="58" fontSize="10.5" fontFamily="var(--font-mono)" fontWeight="bold" fill="#171717">
          Thread B: Read stock = 1 (stale!)
        </text>
        <text x="276" y="74" fontSize="10" fontFamily="var(--font-sans)" fontWeight="bold" fill="#DC2626">
          Writes stock = -1 ➔ OVERSOLD ✗
        </text>

        {/* Race Window Callout */}
        <rect x="24" y="94" width="492" height="34" rx="6" fill="#F9DDE5" stroke="#DC2626" strokeWidth="1.2" />
        <text
          x="270"
          y="115"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="12.5"
          fontWeight="bold"
          fill="#DC2626"
        >
          ⚠ Race window: 2 buyers charged for 1 available iPhone!
        </text>

        {/* ── BOTTOM: With Redis Lua Script ── */}
        <rect
          x="12"
          y="152"
          width="516"
          height="146"
          rx="10"
          fill="#DFF3DF"
          stroke="#171717"
          strokeWidth="1.8"
        />
        <text
          x="24"
          y="173"
          fontFamily="var(--font-hand)"
          fontSize="14.5"
          fontWeight="bold"
          fill="#171717"
        >
          WITH REDIS ATOMIC LUA SCRIPT · Single-Threaded Engine
        </text>

        {/* Execution step 1 */}
        <rect
          x="24"
          y="184"
          width="224"
          height="44"
          rx="6"
          fill="#FFFFFF"
          stroke="#171717"
          strokeWidth="1.5"
        />
        <text x="34" y="202" fontSize="10.5" fontFamily="var(--font-mono)" fontWeight="bold" fill="#171717">
          1. Thread A Lua EVAL
        </text>
        <text x="34" y="218" fontSize="10" fontFamily="var(--font-sans)" fontWeight="600" fill="#16A34A">
          stock &ge; 1 ➔ DECR to 0 ➔ Won ✓
        </text>

        {/* Arrow to step 2 */}
        <path d="M254 206 L270 206" stroke="#171717" strokeWidth="1.8" />
        <polygon points="274,206 268,203 268,209" fill="#171717" />

        {/* Execution step 2 */}
        <rect
          x="278"
          y="184"
          width="238"
          height="44"
          rx="6"
          fill="#FAF9F5"
          stroke="#171717"
          strokeWidth="1.2"
        />
        <text x="288" y="202" fontSize="10.5" fontFamily="var(--font-mono)" fontWeight="bold" fill="#171717">
          2. Thread B Lua EVAL
        </text>
        <text x="288" y="218" fontSize="10" fontFamily="var(--font-sans)" fontWeight="500" fill="#6B7280">
          stock == 0 ➔ Return 0 (Sold Out)
        </text>

        {/* Guarantee Banner Box */}
        <rect
          x="24"
          y="242"
          width="492"
          height="38"
          rx="6"
          fill="#FFFFFF"
          stroke="#16A34A"
          strokeWidth="1.2"
        />
        <text
          x="270"
          y="266"
          textAnchor="middle"
          fontFamily="var(--font-hand)"
          fontSize="12"
          fontWeight="bold"
          fill="#16A34A"
        >
          ✓ Zero interleaving: Exactly 10,000 reservations succeed · 0 overselling
        </text>
      </svg>
    </div>
  );
}
