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
    <div id={id} className="scroll-mt-16 pt-8 mb-4 group">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="circle-num">
            {displayNum}
          </span>
          <h2 className="font-sans text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>
          <button
            onClick={copyLink}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-800"
            aria-label={`Copy link to "${title}"`}
            title="Copy link to section"
          >
            {copied ? (
              <span className="text-xs font-sans font-semibold text-emerald-600">Copied!</span>
            ) : (
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 9.5L9.5 6.5" />
                <path d="M11 7.5L12.5 6A2.12 2.12 0 0 0 9.5 3L8 4.5" />
                <path d="M5 8.5L3.5 10A2.12 2.12 0 0 0 6.5 13L8 11.5" />
              </svg>
            )}
          </button>
        </div>

        {annotation && (
          <span className="font-sans font-semibold text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
            {annotation}
          </span>
        )}
      </div>

      <div className="mt-3 w-full border-b border-slate-200/80" />
    </div>
  );
}
