"use client";

import { useEffect, useState, useRef, useId } from "react";
import { useRouter } from "next/navigation";
import { matchesTopic } from "@/data/library";
import { topicCatalog, type TopicCatalogEntry } from "@/data/topics/catalog";
import { TERM_GLOSSARY, type TermDef } from "@/components/TermTooltip";
import { matchScore, searchArticles, type SearchArticle, type SearchHit } from "@/data/search";

type SearchResult = {
  key: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  href?: string;
};

type ResultGroup = { key: string; label: string; results: SearchResult[] };

const hitBadges: Record<SearchHit["kind"], { badge: string; badgeColor: string }> = {
  section: { badge: "SECTION", badgeColor: "bg-[#DFF3DF]" },
  heading: { badge: "SECTION", badgeColor: "bg-[#DFF3DF]" },
  failure: { badge: "FAILURE MODE", badgeColor: "bg-[#F9DDE5]" },
  "wrong-answer": { badge: "WRONG ANSWER", badgeColor: "bg-[#F9DDE5]" },
  "follow-up": { badge: "FOLLOW-UP", badgeColor: "bg-[#E7E1F8]" },
};

const topicResult = (topic: TopicCatalogEntry): SearchResult => ({
  key: topic.href,
  title: topic.meta.title,
  subtitle: topic.meta.subtitle,
  badge: topic.meta.category,
  badgeColor: "bg-[#DCEBFF]",
  href: topic.href,
});

const conceptResults: SearchResult[] = Object.entries(TERM_GLOSSARY).map(([key, def]: [string, TermDef]) => ({
  key: `term:${key}`,
  title: def.term,
  subtitle: def.definition,
  badge: "CONCEPT",
  badgeColor: "bg-[#FFF0B8]",
}));

// Section and term search: built at build time, fetched once on first open.
let searchIndex: Promise<SearchArticle[]> | undefined;
function loadSearchIndex() {
  searchIndex ??= fetch("/search-index.json")
    .then((response) => (response.ok ? response.json() : []))
    .catch(() => {
      searchIndex = undefined;
      return [];
    });
  return searchIndex;
}

/**
 * One group per article: its matching sections and terms, plus the article
 * itself when the article matches. A title or slug match scores like a hit;
 * a tag or alias match scores lowest, so "rollback" lands on the section.
 */
function articleGroups(index: readonly SearchArticle[], q: string): ResultGroup[] {
  const hitsByArticle = new Map(searchArticles(index, q).map((group) => [group.article.id, group]));
  const groups = topicCatalog.map((topic) => {
    const titleScore = Math.max(
      matchScore(topic.meta.title, q),
      matchScore(topic.prompt, q),
      matchScore(topic.meta.slug.replaceAll("-", " "), q),
    );
    const topicScore = titleScore || (matchesTopic(topic, q) ? 1 : 0);
    const hits = hitsByArticle.get(topic.id)?.hits ?? [];
    const scored = [
      ...(topicScore ? [{ score: topicScore, result: topicResult(topic) }] : []),
      ...hits.map((hit) => ({
        score: hit.score,
        result: { key: `${hit.href}:${hit.text}`, title: hit.text, subtitle: hit.section, href: hit.href, ...hitBadges[hit.kind] },
      })),
    ].sort((a, b) => b.score - a.score);
    return { key: topic.id, label: topic.prompt, score: scored[0]?.score ?? 0, results: scored.map(({ result }) => result) };
  });
  return groups.filter((group) => group.score > 0).sort((a, b) => b.score - a.score);
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [index, setIndex] = useState<SearchArticle[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const id = useId();

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
      loadSearchIndex().then(setIndex);
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  // Filter results: matching articles with their sections, then concepts
  const q = query.toLowerCase().trim();
  const groups: ResultGroup[] = q
    ? [
        ...articleGroups(index, q),
        {
          key: "concepts",
          label: "Concepts",
          results: conceptResults.filter(
            (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q),
          ),
        },
      ].filter((group) => group.results.length > 0)
    : [{ key: "articles", label: "Articles", results: topicCatalog.slice(0, 8).map(topicResult) }]; // Default recent/top items
  const filtered = groups.flatMap((group) => group.results);
  const optionId = (idx: number) => `${id}-option-${idx}`;

  // Keep the selected result visible while arrowing through a long list
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, isOpen]);

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
        className="flex items-center justify-between gap-3 px-2 sm:px-3 py-1.5 h-9 bg-slate-100/80 hover:bg-slate-100 hover:border-slate-300 border border-slate-200/90 rounded-lg transition-all text-xs font-sans font-medium text-slate-600 cursor-pointer shadow-2xs whitespace-nowrap shrink-0 w-9 sm:w-40 lg:w-56"
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
            className="text-slate-600 shrink-0"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="hidden sm:inline text-slate-600 text-xs truncate">Search architecture...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono font-medium text-slate-600 shadow-2xs shrink-0">
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
            role="dialog"
            aria-modal="true"
            aria-label="Search articles, sections, and concepts"
            className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-200 bg-slate-50/70">
              <span className="text-base select-none text-slate-600" aria-hidden="true">
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
                role="combobox"
                aria-expanded="true"
                aria-controls={`${id}-results`}
                aria-activedescendant={filtered[selectedIndex] ? optionId(selectedIndex) : undefined}
                aria-autocomplete="list"
                aria-label="Search"
                placeholder="Search topics, failure modes, CDC, partition keys..."
                className="w-full bg-transparent text-sm sm:text-base font-sans text-slate-900 outline-hidden placeholder:text-slate-400"
              />
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="px-1.5 py-0.5 border border-slate-200 rounded text-xs font-mono text-slate-600 hover:bg-white cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Results List, grouped by article */}
            {filtered.length === 0 && (
              <div className="py-8 text-center text-sm font-sans text-slate-600">
                No matching engineering topics or concepts found.
              </div>
            )}
            <div ref={listRef} id={`${id}-results`} role="listbox" aria-label="Search results" hidden={filtered.length === 0} className="overflow-y-auto p-2">
              {groups.map((group, groupIdx) => {
                const offset = groups.slice(0, groupIdx).reduce((total, g) => total + g.results.length, 0);
                return (
                  <div key={group.key} role="group" aria-labelledby={`${id}-group-${groupIdx}`} className="py-1 border-t border-slate-100 first:border-t-0">
                    <div id={`${id}-group-${groupIdx}`} role="presentation" className="px-3 pt-2 pb-1 text-[11px] font-mono font-bold uppercase tracking-wide text-slate-600 line-clamp-1">
                      {group.label}
                    </div>
                    {group.results.map((item, i) => {
                      const idx = offset + i;
                      const isSelected = idx === selectedIndex;
                      return (
                        <div
                          key={item.key}
                          id={optionId(idx)}
                          role="option"
                          aria-selected={isSelected}
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
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer with Keyboard Hints */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
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
