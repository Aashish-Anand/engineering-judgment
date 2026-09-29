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
        className="flex items-center gap-2 px-3 py-1 bg-white border-[1.5px] border-[#171717] rounded-full shadow-[1.5px_1.5px_0px_#171717] hover:shadow-[2.5px_2.5px_0px_#171717] hover:-translate-y-0.5 transition-all text-xs font-hand font-bold text-[#171717]"
        aria-label="Search topics and concepts"
      >
        <span aria-hidden="true">🔍</span>
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden md:inline-block px-1.5 py-0.2 bg-[#FAF9F5] border border-[#171717]/30 rounded text-[10px] font-mono text-[#6B7280]">
          ⌘K
        </kbd>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white border-2 border-[#171717] rounded-2xl shadow-[4px_6px_0px_#171717] overflow-hidden flex flex-col max-h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b-2 border-[#171717] bg-[#FAF9F5]">
              <span className="text-lg select-none" aria-hidden="true">
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
                className="w-full bg-transparent text-sm sm:text-base font-sans text-[#171717] outline-hidden placeholder:text-[#9CA3AF]"
              />
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="px-1.5 py-0.5 border border-[#171717]/30 rounded text-xs font-mono text-[#6B7280] hover:bg-white"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto p-2 divide-y divide-[#171717]/10">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm font-hand text-[#6B7280]">
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
                      className={`p-3 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#FFF0B8] border border-[#171717] shadow-xs"
                          : "hover:bg-[#FAF9F5]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-hand font-bold text-sm sm:text-base text-[#171717] line-clamp-1">
                          {item.title}
                        </span>
                        <span
                          className={`shrink-0 text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border border-[#171717]/30 ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#4B5563] line-clamp-2 m-0 leading-relaxed font-sans">
                        {item.subtitle}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with Keyboard Hints */}
            <div className="px-4 py-2 bg-[#FAF9F5] border-t border-[#171717]/20 flex items-center justify-between text-[11px] font-mono text-[#6B7280]">
              <div className="flex items-center gap-3">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
              </div>
              <span>Engineering Judgment</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
