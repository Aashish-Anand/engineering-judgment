"use client";

import { useEffect, useState, useCallback } from "react";

type TocItem = {
  id: string;
  label: string;
};

type TableOfContentsProps = {
  items: TocItem[];
};

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);
  const [maxVisitedIndex, setMaxVisitedIndex] = useState<number>(-1);

  // Track active section with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const id = visible[0].target.id;
          setActiveId(id);
          const idx = items.findIndex((i) => i.id === id);
          if (idx >= 0) {
            setMaxVisitedIndex((prev) => Math.max(prev, idx));
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  // Track scroll position to reveal floating TOC button on mobile
  useEffect(() => {
    function onScroll() {
      setShowFloatingBtn(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on Escape key and lock body scroll
  useEffect(() => {
    if (!drawerOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  const handleClick = useCallback((id: string) => {
    setDrawerOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -70;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  // Find active item index and label
  const activeIndex = items.findIndex((i) => i.id === activeId);
  const activeItem = activeIndex >= 0 ? items[activeIndex] : items[0];

  const progressPercent = Math.min(
    100,
    Math.round(((maxVisitedIndex + 1) / items.length) * 100)
  );

  return (
    <>
      {/* ── Desktop: compact notebook index sidebar ────────────────── */}
      <nav
        className="hidden lg:block sticky top-8 self-start w-56 max-w-56 shrink-0 p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]"
        aria-label="Table of Contents"
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="font-sans font-bold text-xs uppercase tracking-wider text-slate-700">
              On this page
            </span>
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-400">
            {maxVisitedIndex >= 0 ? `${progressPercent}%` : `${items.length} sects`}
          </span>
        </div>

        {/* Clean progress meter */}
        <div className="w-full bg-slate-100 rounded-full h-1 mb-3 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(4, progressPercent)}%` }}
          />
        </div>

        <ul className="space-y-1">
          {items.map((item, index) => {
            const isActive = activeId === item.id;
            const isCompleted = index <= maxVisitedIndex && !isActive;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item.id)}
                  type="button"
                  className={`w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-md transition-all text-xs font-sans ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200/70"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] font-bold shrink-0 w-4 h-4 rounded flex items-center justify-center ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : isCompleted
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </span>
                  <span className="truncate leading-tight">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Mobile: Top active section bar ────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 -mx-6 px-4 py-2 shadow-xs print:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          type="button"
          className="w-full flex items-center justify-between text-xs font-sans text-slate-800"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="font-sans font-medium text-xs text-slate-400">
              {activeIndex >= 0 ? activeIndex + 1 : 1}/{items.length}:
            </span>
            <span className="font-semibold text-xs text-slate-900 truncate">
              {activeItem ? activeItem.label : "Contents"}
            </span>
          </div>
          <span className="font-sans font-semibold text-xs shrink-0 ml-2 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded text-slate-700">
            Jump ▾
          </span>
        </button>
      </div>

      {/* ── Mobile: Floating Quick-TOC Button (Bottom-Left) ───────── */}
      <button
        onClick={() => setDrawerOpen(true)}
        type="button"
        className={`lg:hidden fixed bottom-6 left-6 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200 shadow-md font-sans font-semibold text-xs text-slate-800 hover:bg-slate-50 transition-all duration-150 print:hidden ${
          showFloatingBtn
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Open Table of Contents"
      >
        <span>📑</span>
        <span>
          {activeIndex >= 0
            ? `${activeIndex + 1}/${items.length}`
            : "Sections"}
        </span>
      </button>

      {/* ── Mobile Drawer / Bottom Sheet ─────────────────────────── */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs print:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-full max-h-[80vh] bg-white border-t border-slate-200 rounded-t-2xl p-5 shadow-2xl overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-bold text-base text-slate-900 m-0">
                  Table of Contents
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  ({items.length} sections)
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                type="button"
                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center font-bold text-sm bg-slate-50 hover:bg-slate-100 text-slate-600"
                aria-label="Close Table of Contents"
              >
                ✕
              </button>
            </div>

            {/* Mobile drawer progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1 mb-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              />
            </div>

            {/* Section links list */}
            <ul className="space-y-1.5 overflow-y-auto pr-1">
              {items.map((item, index) => {
                const isActive = activeId === item.id;
                const isCompleted = index <= maxVisitedIndex && !isActive;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleClick(item.id)}
                      type="button"
                      className={`w-full text-left flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-sm font-sans transition-all ${
                        isActive
                          ? "bg-blue-50 font-semibold text-blue-700 border border-blue-200"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`font-mono text-xs font-bold shrink-0 w-5 h-5 rounded flex items-center justify-center ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : isCompleted
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isCompleted ? "✓" : index + 1}
                      </span>
                      <span className="leading-snug">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
