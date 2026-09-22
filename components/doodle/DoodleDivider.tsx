type DoodleDividerProps = {
  className?: string;
  variant?: "wavy" | "dashed" | "line";
};

export function DoodleDivider({ className = "", variant = "wavy" }: DoodleDividerProps) {
  if (variant === "wavy") {
    return (
      <div className={`w-full overflow-hidden my-6 ${className}`} aria-hidden="true">
        <svg
          className="w-full h-3 text-[#171717]/30"
          preserveAspectRatio="none"
          viewBox="0 0 1200 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 6 Q 30 1, 60 6 T 120 6 T 180 6 T 240 6 T 300 6 T 360 6 T 420 6 T 480 6 T 540 6 T 600 6 T 660 6 T 720 6 T 780 6 T 840 6 T 900 6 T 960 6 T 1020 6 T 1080 6 T 1140 6 T 1200 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`w-full border-t-[1.5px] border-dashed border-[#171717]/25 my-6 ${className}`}
      aria-hidden="true"
    />
  );
}
