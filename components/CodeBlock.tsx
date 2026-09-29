"use client";

import { useState } from "react";

type CodeBlockProps = {
  code: string;
  language?: string;
  filename?: string;
  highlightLines?: number[];
};

/**
 * Notebook-styled code block with language/file header and interactive copy button.
 */
export function CodeBlock({
  code,
  language = "sql",
  filename,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement("textarea");
      textarea.value = code.trim();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="my-5 rounded-xl border-[1.5px] border-[#171717] bg-[#F4F1EA] shadow-[2px_3px_0px_#171717] overflow-hidden text-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-white/70 border-b border-[#171717]/20 select-none">
        <div className="flex items-center gap-2">
          {/* Subtle notebook dots */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-[#171717]/20 border border-[#171717]/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#171717]/20 border border-[#171717]/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#171717]/20 border border-[#171717]/40" />
          </div>
          {filename ? (
            <span className="font-mono text-xs font-semibold text-[#171717] ml-1">
              {filename}
            </span>
          ) : (
            <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#6B7280] ml-1">
              {language}
            </span>
          )}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-hand font-bold text-[#171717] hover:bg-white transition-colors border border-transparent hover:border-[#171717]/30"
          aria-label={copied ? "Copied to clipboard" : "Copy code"}
        >
          {copied ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16A34A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-[#16A34A]">Copied!</span>
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <pre className="m-0 p-4 bg-transparent border-none shadow-none text-xs sm:text-sm font-mono leading-relaxed overflow-x-auto text-[#171717]">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}
