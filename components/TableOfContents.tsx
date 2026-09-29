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

  // Track active section with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
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
      // Account for header offset
      const yOffset = -70;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  // Find active item index and label
  const activeIndex = items.findIndex((i) => i.id === activeId);
  const activeItem = activeIndex >= 0 ? items[activeIndex] : items[0];

  return (
    <>
      {/* ── Desktop: compact notebook index sidebar ────────────────── */}
      <nav
        className="hidden lg:block sticky top-8 self-start w-56 max-w-56 shrink-0 p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]"
        aria-label="Notebook Table of Contents"
      >
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#171717]/20">
          <div className="flex items-center gap-1.5">
            <span className="text-sm select-none" aria-hidden="true">
              📑
            </span>
            <span className="font-hand font-bold text-lg text-[#171717]">
              On this page
            </span>
          </div>
          {activeIndex >= 0 && (
            <span className="text-[11px] font-mono text-[#6B7280]">
              {activeIndex + 1}/{items.length}
            </span>
          )}
        </div>

        <ul className="space-y-1">
          {items.map((item, index) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item.id)}
                  type="button"
                  className={`w-full text-left flex items-center gap-2 py-1 px-1.5 rounded transition-all text-xs font-sans ${
                    isActive
                      ? "bg-[#FFF0B8] border border-[#171717] font-bold text-[#171717] shadow-xs"
                      : "text-[#4B5563] hover:text-[#171717] hover:bg-[#FAF9F5]"
                  }`}
                >
                  <span className="font-hand font-bold text-xs shrink-0 w-4 h-4 rounded-full border border-[#171717] flex items-center justify-center bg-white text-[#171717]">
                    {index + 1}
                  </span>
                  <span className="truncate leading-tight">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Mobile: Top active section bar ────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#FAF9F5]/95 backdrop-blur-xs border-b-[1.5px] border-[#171717] -mx-6 px-4 py-2 shadow-xs print:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          type="button"
          className="w-full flex items-center justify-between text-xs font-sans text-[#171717]"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-sm">📑</span>
            <span className="font-hand font-bold text-xs text-[#6B7280]">
              Section {activeIndex >= 0 ? activeIndex + 1 : 1}/{items.length}:
            </span>
            <span className="font-semibold text-xs text-[#171717] truncate">
              {activeItem ? activeItem.label : "Contents"}
            </span>
          </div>
          <span className="font-hand font-bold text-xs shrink-0 ml-2 bg-[#FFF0B8] border border-[#171717] px-2 py-0.5 rounded shadow-[1px_1px_0px_#171717]">
            Jump ▾
          </span>
        </button>
      </div>

      {/* ── Mobile: Floating Quick-TOC Button (Bottom-Left) ───────── */}
      <button
        onClick={() => setDrawerOpen(true)}
        type="button"
        className={`lg:hidden fixed bottom-6 left-6 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border-[1.5px] border-[#171717] shadow-[2px_2px_0px_#171717] font-hand font-bold text-xs text-[#171717] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#171717] active:translate-y-0 transition-all duration-150 print:hidden ${
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
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs print:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-full max-h-[80vh] bg-[#FAF9F5] border-t-2 border-[#171717] rounded-t-2xl p-5 shadow-2xl overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#171717]/20">
              <div className="flex items-center gap-2">
                <span className="text-lg">📑</span>
                <h3 className="font-hand font-bold text-xl text-[#171717] m-0">
                  Table of Contents
                </h3>
                <span className="text-xs font-mono text-[#6B7280]">
                  ({items.length} sections)
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                type="button"
                className="w-7 h-7 rounded-full border border-[#171717] flex items-center justify-center font-bold text-sm bg-white hover:bg-[#F4F1EA]"
                aria-label="Close Table of Contents"
              >
                ✕
              </button>
            </div>

            {/* Section links list */}
            <ul className="space-y-1.5 overflow-y-auto pr-1">
              {items.map((item, index) => {
                const isActive = activeId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleClick(item.id)}
                      type="button"
                      className={`w-full text-left flex items-center gap-3 py-2 px-2.5 rounded-lg text-sm font-sans transition-all ${
                        isActive
                          ? "bg-[#FFF0B8] font-bold text-[#171717] border border-[#171717] shadow-xs"
                          : "text-[#374151] hover:text-[#171717] hover:bg-white/80"
                      }`}
                    >
                      <span className="font-hand font-bold text-xs shrink-0 w-6 h-6 rounded-full border border-[#171717] flex items-center justify-center bg-white">
                        {index + 1}
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
