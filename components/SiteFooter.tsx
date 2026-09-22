import { DoodleArrow } from "./doodle/DoodleArrow";
import { DoodleDivider } from "./doodle/DoodleDivider";

export function SiteFooter() {
  return (
    <footer className="w-full pt-6 pb-12 px-6">
      <div className="wide-width mx-auto">
        <DoodleDivider variant="wavy" />

        <div className="flex flex-col items-center justify-center text-center py-6 select-none">
          {/* Mountain sketch with flag */}
          <div className="mb-3">
            <svg
              width="64"
              height="40"
              viewBox="0 0 64 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block"
              aria-hidden="true"
            >
              {/* Left mountain */}
              <polygon
                points="12,36 28,10 44,36"
                fill="#FAF9F5"
                stroke="#171717"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Flag on left peak */}
              <line x1="28" y1="10" x2="28" y2="3" stroke="#171717" strokeWidth="1.5" />
              <polygon points="28,3 36,6 28,9" fill="#DC2626" stroke="#171717" strokeWidth="1" />
              {/* Right mountain */}
              <polygon
                points="32,36 46,16 58,36"
                fill="#FAF9F5"
                stroke="#171717"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Snowcap lines */}
              <path d="M22 20 Q 28 24 34 20" stroke="#171717" strokeWidth="1.5" fill="none" />
              <path d="M41 23 Q 46 26 51 23" stroke="#171717" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          {/* Handwritten closing statement with pastel highlight */}
          <div className="relative inline-block mb-3">
            <span className="absolute inset-x-[-6px] bottom-0 top-1 -z-10 bg-[#E7E1F8] rounded-[4px_6px_3px_5px] transform -rotate-1" />
            <h3 className="font-hand text-2xl sm:text-3xl font-bold text-[#171717] px-2">
              Better models. Better decisions.
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-[#4B5563] mb-4">
            <DoodleArrow direction="curved-down-right" width={28} height={20} />
            <span className="font-hand font-semibold text-base sm:text-lg">
              Not just what to build, but what to think about.
            </span>
          </div>

          {/* Small notebook closing note */}
          <div className="font-hand text-lg text-[#171717] mb-2 font-bold">
            &ldquo;Better systems start with better questions.&rdquo;
          </div>

          <div className="text-xs font-mono text-[#9CA3AF]">
            Engineering Judgment · Architecture Under Pressure
          </div>
        </div>
      </div>
    </footer>
  );
}
