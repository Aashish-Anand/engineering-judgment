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
      className={`my-8 p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-xs relative ${className}`}
    >
      {/* Top sticker badge */}
      <div className="absolute -top-3 left-5 sm:left-6">
        <span className="font-sans font-bold text-xs px-3 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full shadow-xs">
          {badge}
        </span>
      </div>

      <div className="pt-2">
        <h4 className="font-sans text-base sm:text-lg font-bold text-slate-900 leading-snug mb-4">
          {question}
        </h4>

        {/* Options grid */}
        <div className="space-y-2.5 mb-4">
          {options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            let btnStyle =
              "bg-white border-slate-200 text-slate-800 hover:bg-slate-50";

            if (selectedIdx !== null) {
              if (isSelected) {
                btnStyle = opt.isCorrect
                  ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500"
                  : "bg-red-50 border-red-500 text-red-900 ring-1 ring-red-500";
              } else if (opt.isCorrect) {
                btnStyle =
                  "bg-white border-emerald-300 text-emerald-800 opacity-90";
              } else {
                btnStyle = "bg-slate-50/60 border-slate-200 text-slate-400";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-lg border font-sans text-sm font-medium transition-all cursor-pointer flex items-start gap-3 ${btnStyle}`}
              >
                <span
                  className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold ${
                    isSelected
                      ? opt.isCorrect
                        ? "bg-emerald-600 text-white"
                        : "bg-red-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 leading-snug">{opt.label}</span>
                {isSelected && (
                  <span className="shrink-0 font-sans font-bold text-xs px-2 py-0.5 rounded border border-current">
                    {opt.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback revelation card */}
        {selectedOption && (
          <div
            className={`p-4 rounded-lg border transition-all animate-fadeIn ${
              selectedOption.isCorrect
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : "bg-red-50 border-red-200 text-red-950"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-sans font-bold text-sm sm:text-base">
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
            <p className="font-sans text-xs sm:text-sm leading-relaxed mb-0">
              {selectedOption.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
