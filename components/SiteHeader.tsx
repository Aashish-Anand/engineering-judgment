"use client";

import Link from "next/link";
import { useState } from "react";
import neo from "./Neo.module.css";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandPalette } from "@/components/CommandPalette";
import { useProgress } from "@/components/useProgress";
import { dueReviewKeys } from "@/data/progress";
import { learningPaths } from "@/data/learning-paths";

const navItems = [
  { label: "Library", href: "/library" },
  { label: "Paths", href: "/paths" },
  { label: "Review", href: "/review" },
  { label: "About", href: "/#about" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  // Badge count only; /review itself drops keys whose question text has since changed.
  const due = dueReviewKeys(useProgress()).length;
  const badge = (label: string) => (label === "Review" && due > 0 ? <span className={neo.navBadge} aria-label={`${due} due`}>{due}</span> : null);

  return (
    <header className={`sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-2xs ${neo.header}`}>
      <div className="page-shell site-header-row h-18 flex items-center justify-between gap-4">
        {/* Left: Clean Brand Identity */}
        <Link
          href="/"
          className="flex items-center gap-2.5 no-underline group select-none shrink-0 whitespace-nowrap"
        >
          {/* Custom Architectural Layer Emblem */}
          <div className="w-8 h-8 rounded-sm bg-slate-800 flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform shrink-0">
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

          <div className="flex items-baseline whitespace-nowrap">
            <span className="font-sans font-semibold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
              Engineering
            </span>
            <span className="font-sans font-semibold text-base sm:text-lg text-slate-900 tracking-tight leading-none ml-1">
              Judgment
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors no-underline whitespace-nowrap shrink-0"
            >
              {item.label}{badge(item.label)}
            </Link>
          ))}
        </nav>

        {/* Right: Search & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          <CommandPalette />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            type="button"
            className="lg:hidden p-2 rounded-lg border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
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
        <div className="lg:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-4 space-y-4 shadow-lg animate-fadeIn">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
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
                  <span>{item.label}{badge(item.label)}</span>
                  <span className="font-mono text-slate-600 text-xs">→</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Learning paths
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {learningPaths.map((path) => (
                <Link
                  key={path.slug}
                  href={`/paths#${path.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/60 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors no-underline"
                >
                  <span>{path.title}</span>
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                    {path.steps.length} articles
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
