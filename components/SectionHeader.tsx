"use client";

import { useState, useCallback } from "react";

type SectionHeaderProps = {
  number: string;
  title: string;
  id: string;
  annotation?: string;
};

export function SectionHeader({ number, title, id, annotation }: SectionHeaderProps) {
  // Strip leading 0 if needed for circle
  const displayNum = number.replace(/^0+/, "") || number;
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [id]);

  return (
    <div id={id} className="scroll-mt-16 pt-10 mb-6 group">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="circle-num">
            {displayNum}
          </span>
          <h2 className="font-hand text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight leading-tight">
            {title}
          </h2>
          <button
            onClick={copyLink}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-[#FFF0B8] text-[#6B7280] hover:text-[#171717]"
            aria-label={`Copy link to "${title}"`}
            title="Copy link to section"
          >
            {copied ? (
              <span className="text-xs font-hand font-bold text-[#16A34A]">Copied!</span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 9.5L9.5 6.5" />
                <path d="M11 7.5L12.5 6A2.12 2.12 0 0 0 9.5 3L8 4.5" />
                <path d="M5 8.5L3.5 10A2.12 2.12 0 0 0 6.5 13L8 11.5" />
              </svg>
            )}
          </button>
        </div>

        {annotation && (
          <span className="font-hand font-bold text-sm text-[#4B5563] bg-[#FFF0B8] border border-[#171717] px-2.5 py-0.5 rounded shadow-xs transform -rotate-1">
            {annotation}
          </span>
        )}
      </div>

      <div className="mt-3 w-full border-b border-dashed border-[#171717]/20" />
    </div>
  );
}
