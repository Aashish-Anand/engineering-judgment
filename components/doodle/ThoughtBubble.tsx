import type { ReactNode } from "react";

type ThoughtBubbleProps = {
  children: ReactNode;
  className?: string;
};

export function ThoughtBubble({ children, className = "" }: ThoughtBubbleProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Cloud-like bubble body */}
      <div className="bg-white border-[1.5px] border-[#171717] rounded-[24px_22px_28px_20px/20px_26px_22px_24px] px-5 py-3.5 shadow-[2px_2px_0px_#171717]">
        <div className="font-hand text-base sm:text-lg font-bold text-[#171717] leading-snug">
          {children}
        </div>
      </div>
      {/* Thought bubble trailing circles */}
      <div className="absolute -bottom-3 left-8 flex flex-col items-center gap-0.5">
        <span className="w-2.5 h-2.5 rounded-full bg-white border-[1.5px] border-[#171717] shadow-[1px_1px_0px_#171717]" />
        <span className="w-1.5 h-1.5 rounded-full bg-white border-[1.2px] border-[#171717] -ml-2" />
      </div>
    </div>
  );
}
