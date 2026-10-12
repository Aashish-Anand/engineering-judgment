"use client";

import { useState } from "react";

export type InlineCheckOption = {
  label: string;
  isCorrect: boolean;
  explanation: string;
};

type InlineCheckProps = {
  question: string;
  badge?: string;
  options: InlineCheckOption[];
  className?: string;
};

export function InlineCheck({
  question,
  badge = "💭 Architectural Gut Check · Predict before you scroll",
  options,
  className = "",
}: InlineCheckProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const selectedOption = selectedIdx !== null ? options[selectedIdx] : null;

  return (
    <div
      className={`my-8 p-5 sm:p-6 bg-[#FAF9F5] border-[1.5px] border-[#171717] rounded-[16px_14px_18px_13px/13px_17px_14px_18px] shadow-[3px_4px_0px_#171717] relative ${className}`}
    >
      {/* Top sticker badge */}
      <div className="absolute -top-3 left-5 sm:left-6">
        <span className="font-hand font-bold text-xs sm:text-sm px-3 py-0.5 bg-[#FFF0B8] border-[1.5px] border-[#171717] rounded-full shadow-[1px_1px_0px_#171717] text-[#171717]">
          {badge}
        </span>
      </div>

      <div className="pt-2">
        <h4 className="font-hand text-lg sm:text-xl font-bold text-[#171717] leading-snug mb-4">
          {question}
        </h4>

        {/* Options grid */}
        <div className="space-y-2.5 mb-4">
          {options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            let btnStyle =
              "bg-white border-[#171717] text-[#171717] hover:bg-[#F4F1EA]";

            if (selectedIdx !== null) {
              if (isSelected) {
                btnStyle = opt.isCorrect
                  ? "bg-[#DFF3DF] border-[#16A34A] text-[#14532D] shadow-[2px_2px_0px_#16A34A]"
                  : "bg-[#F9DDE5] border-[#DC2626] text-[#7F1D1D] shadow-[2px_2px_0px_#DC2626]";
              } else if (opt.isCorrect) {
                btnStyle =
                  "bg-white border-[#16A34A]/60 text-[#15803D] opacity-90";
              } else {
                btnStyle = "bg-white/60 border-[#171717]/30 text-[#6B7280]";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-[1.5px] font-sans text-sm sm:text-base font-medium transition-all cursor-pointer flex items-start gap-3 ${btnStyle}`}
              >
                <span
                  className={`shrink-0 w-6 h-6 rounded-full border border-[#171717] flex items-center justify-center font-mono text-xs font-bold ${
                    isSelected
                      ? opt.isCorrect
                        ? "bg-[#16A34A] text-white"
                        : "bg-[#DC2626] text-white"
                      : "bg-[#FAF9F5] text-[#171717]"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 leading-snug">{opt.label}</span>
                {isSelected && (
                  <span className="shrink-0 font-hand font-bold text-xs sm:text-sm px-2 py-0.5 rounded border border-current">
                    {opt.isCorrect ? "✓ Spot on" : "✗ Trap"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback revelation card */}
        {selectedOption && (
          <div
            className={`p-4 rounded-xl border-[1.5px] transition-all animate-fadeIn ${
              selectedOption.isCorrect
                ? "bg-[#DFF3DF] border-[#16A34A] text-[#14532D]"
                : "bg-[#F9DDE5] border-[#DC2626] text-[#7F1D1D]"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-hand font-bold text-base sm:text-lg">
                {selectedOption.isCorrect
                  ? "💡 Why that's correct:"
                  : "⚠️ Why this is a common pitfall:"}
              </span>
              <button
                type="button"
                onClick={() => setSelectedIdx(null)}
                className="text-xs font-mono font-semibold underline opacity-75 hover:opacity-100 cursor-pointer"
              >
                Try other options
              </button>
            </div>
            <p className="font-sans text-sm sm:text-base leading-relaxed mb-0">
              {selectedOption.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
