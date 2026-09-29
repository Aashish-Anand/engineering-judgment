"use client";

import Link from "next/link";
import { useState } from "react";
import { CommandPalette } from "@/components/CommandPalette";

const navItems = [
  { label: "Problems", href: "/#problems" },
  { label: "Topics", href: "/#topics" },
  { label: "About", href: "/#about" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-40 w-full pt-3 pb-2 px-4 sm:px-8">
      <div className="wide-width mx-auto flex items-center justify-between gap-3">
        {/* Top-left: Small handwritten logo/wordmark with doodle lightbulb */}
        <Link href="/" className="flex items-center gap-2.5 no-underline group select-none shrink-0">
          <span className="text-2xl select-none transform -rotate-6 group-hover:rotate-0 transition-transform" aria-hidden="true">
            💡
          </span>
          <div className="flex flex-col">
            <span className="font-hand font-bold text-xl sm:text-2xl text-[#171717] leading-[1.05] tracking-tight">
              Engineering
            </span>
            <span className="font-hand font-bold text-lg sm:text-xl text-[#171717] leading-[1] tracking-tight -mt-0.5">
              Judgment
            </span>
          </div>
        </Link>

        {/* Right side: Search + Nav */}
        <div className="flex items-center gap-2.5">
          <CommandPalette />

          {/* Desktop: Small hand-drawn navigation annotations */}
          <nav className="hidden md:flex items-center gap-1 bg-white/80 border-[1.5px] border-[#171717] rounded-full px-4 py-1 shadow-[2px_2px_0px_#171717]">
            {navItems.map((item, index) => (
              <span key={item.label} className="inline-flex items-center">
                <Link
                  href={item.href}
                  className="font-hand text-lg font-bold text-[#171717] hover:text-[#DC2626] px-2 py-0.5 rounded transition-colors no-underline"
                >
                  {item.label}
                </Link>
                {index < navItems.length - 1 && (
                  <span className="font-hand text-[#171717]/40 select-none px-1">·</span>
                )}
              </span>
            ))}
          </nav>

          {/* Mobile: Tiny logo + hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 bg-white border-[1.5px] border-[#171717] rounded-md shadow-[1px_2px_0px_#171717] text-[#171717]"
              aria-label="Toggle navigation menu"
            >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {mobileOpen ? (
                <path
                  d="M5 5L15 15M5 15L15 5"
                  stroke="#171717"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <>
                  <path d="M3 5H17" stroke="#171717" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 10H17" stroke="#171717" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 15H17" stroke="#171717" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>

      {/* Mobile drop menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 p-3 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="font-hand text-lg font-bold text-[#171717] hover:bg-[#FFF0B8] px-3 py-1.5 rounded transition-colors no-underline"
              >
                {item.label} →
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
