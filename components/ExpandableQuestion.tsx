"use client";

import { useState } from "react";

type ExpandableQuestionProps = {
  question: string;
  answer: string;
};

export function ExpandableQuestion({ question, answer }: ExpandableQuestionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-dashed border-[#171717]/25 last:border-b-0 py-2">
      <button
        className="w-full text-left py-2.5 flex items-start justify-between gap-4 group cursor-pointer"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="flex items-start gap-2.5">
          <span className="font-hand font-bold text-lg text-[#171717] mt-0.5 select-none">
            Q:
          </span>
          <span className="font-hand font-bold text-lg sm:text-xl text-[#171717] leading-snug group-hover:text-[#DC2626] transition-colors">
            {question}
          </span>
        </div>
        <span
          className={`shrink-0 mt-1 font-hand font-bold text-sm px-2 py-0.5 bg-[#FAF9F5] border border-[#171717] rounded shadow-xs transition-transform duration-200 ${
            open ? "bg-[#FFF0B8]" : ""
          }`}
        >
          {open ? "Hide ▲" : "Reveal Answer ▼"}
        </span>
      </button>

      {open && (
        <div className="pl-6 pr-2 py-3 my-2 bg-[#FAF9F5] border-l-2 border-[#171717] rounded-r-lg text-sm sm:text-[0.92rem] text-[#374151] leading-relaxed font-sans">
          <div className="font-hand font-bold text-xs uppercase text-[#6B7280] mb-1">
            Recommended Senior Response:
          </div>
          {answer}
        </div>
      )}
    </div>
  );
}
