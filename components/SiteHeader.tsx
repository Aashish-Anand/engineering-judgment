"use client";

import Link from "next/link";
import { useState } from "react";
import { CommandPalette } from "@/components/CommandPalette";

const navItems = [
  { label: "Blueprints", href: "/#problems" },
  { label: "Interactive Labs", href: "/#about" },
  { label: "Career Rubric", href: "/#topics" },
  { label: "About", href: "/#about" },
];

const quickTopics = [
  { name: "Database Migration", href: "/topics/database/safely-migrate-production-database", badge: "10M Writes" },
  { name: "Survive Flash Sale", href: "/topics/traffic/survive-flash-sale", badge: "5M RPS" },
  { name: "Transactional Outbox", href: "/topics/correctness/transactional-outbox", badge: "At-Least-Once" },
  { name: "Fix Hot Partition", href: "/topics/traffic/fix-hot-partition", badge: "Key Salting" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-2xs">
      <div className="wide-width mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Identity with Layered System Mark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 no-underline group select-none shrink-0"
        >
          {/* Custom Architectural Layer Emblem */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>

          <div className="flex items-baseline">
            <span className="font-sans font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
              Engineering
            </span>
            <span className="font-sans font-bold text-base sm:text-lg text-blue-600 tracking-tight leading-none ml-1">
              Judgment
            </span>
          </div>

          <span className="hidden xl:inline-flex items-center text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200/80 rounded-md ml-1.5">
            Architecture Under Pressure
          </span>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors no-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Search & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <CommandPalette />

          <Link
            href="/#problems"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors no-underline"
          >
            <span>Explore Blueprints</span>
            <span className="font-mono text-xs">→</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            type="button"
            className="md:hidden p-2 rounded-lg border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-4 space-y-4 shadow-lg animate-fadeIn">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Navigation
            </span>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-sans text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors no-underline flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="font-mono text-slate-400 text-xs">→</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Production Blueprints
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {quickTopics.map((topic) => (
                <Link
                  key={topic.name}
                  href={topic.href}
                  onClick={() => setMobileOpen(false)}
                  className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/60 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors no-underline"
                >
                  <span>{topic.name}</span>
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                    {topic.badge}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
