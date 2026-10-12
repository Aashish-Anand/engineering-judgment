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
        {/* Top-left: Clean modern wordmark */}
        <Link href="/" className="flex items-center gap-2.5 no-underline group select-none shrink-0">
          <span className="text-xl select-none" aria-hidden="true">
            💡
          </span>
          <div className="flex flex-col">
            <span className="font-sans font-extrabold text-lg sm:text-xl text-slate-900 leading-tight tracking-tight">
              Engineering
            </span>
            <span className="font-sans font-bold text-base sm:text-lg text-blue-600 leading-tight tracking-tight -mt-0.5">
              Judgment
            </span>
          </div>
        </Link>

        {/* Right side: Search + Nav */}
        <div className="flex items-center gap-2.5">
          <CommandPalette />

          {/* Desktop: Clean modern navigation pill */}
          <nav className="hidden md:flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full px-3.5 py-1.5 shadow-xs">
            {navItems.map((item, index) => (
              <span key={item.label} className="inline-flex items-center">
                <Link
                  href={item.href}
                  className="font-sans text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 px-2 py-0.5 rounded transition-colors no-underline"
                >
                  {item.label}
                </Link>
                {index < navItems.length - 1 && (
                  <span className="text-slate-300 select-none px-1">·</span>
                )}
              </span>
            ))}
          </nav>

          {/* Mobile: Hamburger button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 bg-white border border-slate-200 rounded-lg shadow-xs text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Toggle navigation menu"
            >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {mobileOpen ? (
                <path
                  d="M5 5L15 15M5 15L15 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <>
                  <path d="M3 5H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>

      {/* Mobile drop menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 p-3 bg-white border border-slate-200 rounded-xl shadow-md">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="font-sans text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors no-underline"
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
