"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { topicCatalog } from "@/data/topics/catalog";
import { TERM_GLOSSARY, type TermDef } from "@/components/TermTooltip";

type SearchResult = {
  type: "topic" | "term";
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  href?: string;
  termKey?: string;
};

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function openPalette() {
    setQuery("");
    setSelectedIndex(0);
    setIsOpen(true);
  }

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuery("");
        setSelectedIndex(0);
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  // Prepare searchable items
  const allResults: SearchResult[] = [
    // Topics
    ...topicCatalog.map((topic) => ({
      type: "topic" as const,
      title: topic.meta.title,
      subtitle: topic.meta.subtitle,
      badge: topic.meta.category,
      badgeColor: "bg-[#DCEBFF]",
      href: topic.href,
    })),
    // Terms from Glossary
    ...Object.entries(TERM_GLOSSARY).map(([key, def]: [string, TermDef]) => ({
      type: "term" as const,
      title: def.term,
      subtitle: def.definition,
      badge: "CONCEPT",
      badgeColor: "bg-[#FFF0B8]",
      termKey: key,
    })),
  ];

  // Filter results
  const q = query.toLowerCase().trim();
  const filtered = q
    ? allResults.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q)
      )
    : allResults.slice(0, 8); // Default recent/top items

  // Handle keyboard selection
  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? Math.max(0, filtered.length - 1) : prev - 1
      );
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  }

  function handleSelect(item: SearchResult) {
    setIsOpen(false);
    if (item.href) {
      router.push(item.href);
    }
  }

  return (
    <>
      {/* Trigger Button in Header */}
      <button
        onClick={openPalette}
        type="button"
        className="flex items-center justify-between gap-3 px-3 py-1.5 h-9 bg-slate-100/80 hover:bg-slate-100 hover:border-slate-300 border border-slate-200/90 rounded-lg transition-all text-xs font-sans font-medium text-slate-600 cursor-pointer shadow-2xs whitespace-nowrap shrink-0 w-36 sm:w-48 lg:w-56"
        aria-label="Search architecture topics and concepts (Cmd+K)"
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400 shrink-0"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-slate-500 text-xs truncate">Search architecture...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono font-medium text-slate-400 shadow-2xs shrink-0">
          ⌘K
        </kbd>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/40 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-200 bg-slate-50/70">
              <span className="text-base select-none text-slate-400" aria-hidden="true">
                🔍
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Search topics, failure modes, CDC, partition keys..."
                className="w-full bg-transparent text-sm sm:text-base font-sans text-slate-900 outline-hidden placeholder:text-slate-400"
              />
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="px-1.5 py-0.5 border border-slate-200 rounded text-xs font-mono text-slate-500 hover:bg-white cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto p-2 divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm font-sans text-slate-500">
                  No matching engineering topics or concepts found.
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.title}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-xl cursor-pointer transition-colors border ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-200 shadow-2xs"
                          : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-sans font-bold text-sm sm:text-base text-slate-900 line-clamp-1">
                          {item.title}
                        </span>
                        <span
                          className={`shrink-0 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border border-slate-200 ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 m-0 leading-relaxed font-sans">
                        {item.subtitle}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with Keyboard Hints */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <div className="flex items-center gap-3">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
              </div>
              <span className="font-sans font-semibold text-slate-600">Engineering Judgment</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
