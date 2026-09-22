import { ThoughtBubble } from "./ThoughtBubble";
import { DoodleArrow } from "./DoodleArrow";

export function EngineerDoodle() {
  return (
    <div className="relative w-full max-w-[380px] mx-auto select-none">
      {/* Curved annotation at top right */}
      <div className="absolute -top-10 -right-2 hidden sm:flex items-center gap-1.5">
        <span className="font-hand text-base font-bold text-[#171717] transform -rotate-3">
          Real problems. Better decisions.
        </span>
        <DoodleArrow direction="curved-down-right" width={32} height={24} />
      </div>

      {/* Thought bubble above engineer */}
      <div className="mb-3 flex justify-center">
        <ThoughtBubble>
          <div className="text-center space-y-0.5">
            <div>What is breaking?</div>
            <div>Why is it breaking?</div>
            <div className="text-[#DC2626]">What can we change?</div>
          </div>
        </ThoughtBubble>
      </div>

      {/* Engineer at desk SVG Illustration */}
      <div className="relative flex justify-center items-center">
        <svg
          viewBox="0 0 280 200"
          className="w-full max-w-[260px] h-auto drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Desk line */}
          <path
            d="M20 180C70 178 210 178 260 180"
            stroke="#171717"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Coffee Mug */}
          <rect
            x="220"
            y="148"
            width="22"
            height="28"
            rx="4"
            fill="#FFFFFF"
            stroke="#171717"
            strokeWidth="2"
          />
          <path
            d="M242 154C248 154 250 166 242 168"
            stroke="#171717"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Steam */}
          <path
            d="M226 142C224 136 228 132 226 126"
            stroke="#6B7280"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M234 140C232 134 236 130 234 124"
            stroke="#6B7280"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Chair back */}
          <path
            d="M95 100C85 110 80 150 78 180"
            stroke="#171717"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Engineer Body / Shirt */}
          <path
            d="M110 120C125 112 155 112 170 120L185 180H95L110 120Z"
            fill="#374151"
            stroke="#171717"
            strokeWidth="2"
          />

          {/* Neck */}
          <rect
            x="133"
            y="105"
            width="14"
            height="18"
            rx="3"
            fill="#F4E0D0"
            stroke="#171717"
            strokeWidth="1.5"
          />

          {/* Head */}
          <path
            d="M125 82C125 65 155 65 155 82C155 98 125 98 125 82Z"
            fill="#F4E0D0"
            stroke="#171717"
            strokeWidth="2"
          />

          {/* Face details */}
          {/* Eyes */}
          <circle cx="135" cy="80" r="2" fill="#171717" />
          <circle cx="145" cy="80" r="2" fill="#171717" />
          {/* Smile */}
          <path
            d="M137 87C140 90 143 89 145 87"
            stroke="#171717"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Hair */}
          <path
            d="M120 75C122 55 158 55 160 75C155 68 145 68 140 68C132 68 125 72 120 75Z"
            fill="#171717"
          />
          <path
            d="M122 72C118 78 120 86 123 88"
            stroke="#171717"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Arms typing */}
          <path
            d="M110 135L135 155L145 158"
            stroke="#171717"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M170 135L155 155L148 158"
            stroke="#171717"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Laptop Base */}
          <path
            d="M130 162L175 162"
            stroke="#171717"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Laptop Screen (angled open) */}
          <polygon
            points="145,130 185,132 178,162 138,162"
            fill="#FFFFFF"
            stroke="#171717"
            strokeWidth="2"
          />
          {/* Laptop code icon </> */}
          <text
            x="160"
            y="149"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="9"
            fontWeight="bold"
            fill="#171717"
          >
            &lt;/&gt;
          </text>
        </svg>

        {/* Floating sticky notes next to engineer */}
        <div className="absolute right-0 top-12 flex flex-col gap-2 transform translate-x-2">
          <div className="font-hand font-bold text-xs sm:text-sm px-2.5 py-1 bg-[#FFF0B8] border-[1.5px] border-[#171717] rounded shadow-[1px_2px_0px_#171717] transform rotate-3">
            Trade-offs
          </div>
          <div className="font-hand font-bold text-xs sm:text-sm px-2.5 py-1 bg-[#F9DDE5] border-[1.5px] border-[#171717] rounded shadow-[1px_2px_0px_#171717] transform -rotate-2">
            Failure modes
          </div>
          <div className="font-hand font-bold text-xs sm:text-sm px-2.5 py-1 bg-[#FFF0B8] border-[1.5px] border-[#171717] rounded shadow-[1px_2px_0px_#171717] transform rotate-2">
            What breaks next?
          </div>
        </div>
      </div>
    </div>
  );
}
