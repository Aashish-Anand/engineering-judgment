"use client";

import { useEffect, useState } from "react";

type TocItem = {
  id: string;
  label: string;
};

type TableOfContentsProps = {
  items: TocItem[];
};

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const handleClick = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Desktop: compact notebook index sidebar */}
      <nav
        className="hidden lg:block sticky top-8 self-start w-56 max-w-56 shrink-0 p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]"
        aria-label="Notebook Table of Contents"
      >
        <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-[#171717]/20">
          <span className="text-sm select-none" aria-hidden="true">
            📑
          </span>
          <span className="font-hand font-bold text-lg text-[#171717]">
            On this page
          </span>
        </div>

        <ul className="space-y-1">
          {items.map((item, index) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item.id)}
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

      {/* Mobile: collapsible notebook drawer */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#FAF9F5] border-b-[1.5px] border-[#171717] -mx-6 px-6 py-2.5 shadow-sm">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between text-xs font-hand font-bold text-[#171717]"
        >
          <div className="flex items-center gap-2">
            <span>📑</span>
            <span className="text-base">On this page</span>
            <span className="text-xs font-sans font-medium text-[#6B7280]">
              ({items.length} sections)
            </span>
          </div>
          <span className="text-sm">{mobileOpen ? "▲ Close" : "▼ Expand"}</span>
        </button>

        {mobileOpen && (
          <div className="mt-2 pt-2 border-t border-dashed border-[#171717]/20 max-h-72 overflow-y-auto">
            <ul className="space-y-1">
              {items.map((item, index) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleClick(item.id)}
                    className={`w-full text-left flex items-center gap-2 py-1 px-2 rounded text-xs font-sans ${
                      activeId === item.id
                        ? "bg-[#FFF0B8] font-bold text-[#171717] border border-[#171717]"
                        : "text-[#4B5563] hover:text-[#171717]"
                    }`}
                  >
                    <span className="font-hand font-bold text-xs shrink-0 w-4 h-4 rounded-full border border-[#171717] flex items-center justify-center bg-white">
                      {index + 1}
                    </span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
