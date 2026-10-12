"use client";

import { useState } from "react";

type ExpandableQuestionProps = {
  question: string;
  answer: string;
};

export function ExpandableQuestion({ question, answer }: ExpandableQuestionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-b-0 py-2.5">
      <button
        className="w-full text-left py-2 flex items-start justify-between gap-4 group cursor-pointer"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="flex items-start gap-2.5">
          <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 mt-0.5 select-none shrink-0">
            Q
          </span>
          <span className="font-sans font-bold text-sm sm:text-base text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
            {question}
          </span>
        </div>
        <span
          className={`shrink-0 font-sans font-semibold text-xs px-2.5 py-1 rounded-md border transition-all ${
            open
              ? "bg-slate-100 text-slate-800 border-slate-300"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-2xs"
          }`}
        >
          {open ? "Hide ▲" : "Reveal Answer ▼"}
        </span>
      </button>

      {open && (
        <div className="pl-5 sm:pl-7 pr-3 py-3 my-2 bg-slate-50 border-l-2 border-blue-600 rounded-r-xl text-xs sm:text-sm text-slate-700 leading-relaxed font-sans shadow-2xs">
          <div className="font-mono font-bold text-[10px] uppercase tracking-wider text-blue-700 mb-1">
            Recommended Senior Response:
          </div>
          <p className="mb-0 text-slate-800 leading-relaxed font-sans">{answer}</p>
        </div>
      )}
    </div>
  );
}
