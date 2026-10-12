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
  badge = "⚡ Quick Gut Check",
  options,
  className = "",
}: InlineCheckProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const selectedOption = selectedIdx !== null ? options[selectedIdx] : null;

  if (isCollapsed) {
    return (
      <div
        className={`my-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg shadow-2xs flex items-center justify-between gap-3 text-xs ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 border border-blue-200 px-1.5 py-0.5 rounded shrink-0">
            {badge}
          </span>
          <span className="font-sans font-semibold text-slate-700 truncate">
            {question}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="shrink-0 font-mono text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline flex items-center gap-1"
        >
          <span>Expand</span>
          <span>▾</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`my-3.5 p-3 sm:p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl shadow-2xs ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 border border-blue-200 px-1.5 py-0.5 rounded">
            {badge}
          </span>
          <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">
            predict before reading
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {selectedOption && (
            <button
              type="button"
              onClick={() => setSelectedIdx(null)}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="text-[11px] font-mono text-slate-400 hover:text-slate-700 cursor-pointer"
            title="Collapse quick quiz"
          >
            Collapse ▴
          </button>
        </div>
      </div>

      {/* Question */}
      <p className="font-sans text-xs sm:text-[13px] font-bold text-slate-900 leading-snug mb-2.5">
        {question}
      </p>

      {/* Compact Options */}
      <div className="space-y-1">
        {options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          let btnStyle =
            "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300";

          if (selectedIdx !== null) {
            if (isSelected) {
              btnStyle = opt.isCorrect
                ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-medium ring-1 ring-emerald-500"
                : "bg-red-50 border-red-500 text-red-950 font-medium ring-1 ring-red-500";
            } else if (opt.isCorrect) {
              btnStyle = "bg-emerald-50/40 border-emerald-300 text-emerald-900";
            } else {
              btnStyle = "bg-white/60 border-slate-200 text-slate-400 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`w-full text-left py-1.5 px-2.5 rounded-lg border font-sans text-xs transition-all cursor-pointer flex items-center gap-2 ${btnStyle}`}
            >
              <span
                className={`shrink-0 w-4 h-4 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                  isSelected
                    ? opt.isCorrect
                      ? "bg-emerald-600 text-white"
                      : "bg-red-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 leading-snug">{opt.label}</span>
              {isSelected && (
                <span
                  className={`shrink-0 font-sans font-bold text-[9px] px-1 py-0.2 rounded border ${
                    opt.isCorrect
                      ? "border-emerald-600 text-emerald-700 bg-emerald-50"
                      : "border-red-600 text-red-700 bg-red-50"
                  }`}
                >
                  {opt.isCorrect ? "✓ Correct" : "✗ Trap"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback revelation strip */}
      {selectedOption && (
        <div
          className={`mt-2 p-2 sm:p-2.5 rounded-lg border transition-all text-xs leading-relaxed ${
            selectedOption.isCorrect
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-amber-50 border-amber-200 text-amber-950"
          }`}
        >
          <div className="font-sans font-bold text-[11px] mb-0.5 flex items-center gap-1">
            {selectedOption.isCorrect ? (
              <span className="text-emerald-800">💡 Why that&apos;s correct:</span>
            ) : (
              <span className="text-amber-800">⚠️ Why this fails in production:</span>
            )}
          </div>
          <p className="font-sans text-[11px] leading-relaxed mb-0 text-slate-800">
            {selectedOption.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
