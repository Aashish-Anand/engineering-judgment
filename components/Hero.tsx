"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArchitecturePressurePreview } from "./ArchitecturePressurePreview";
import { heroContent } from "@/data/homepage";
import { topicCatalog } from "@/data/topics/catalog";

const availableProblems = topicCatalog.map(({ href, prompt }) => ({ href, prompt }));

export function Hero() {
  const router = useRouter();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const target = availableProblems[placeholderIndex].prompt;

    if (typing) {
      if (displayed.length < target.length) {
        const timer = setTimeout(() => {
          setDisplayed(target.slice(0, displayed.length + 1));
        }, 40);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setTyping(false), 2400);
        return () => clearTimeout(timer);
      }
    } else {
      if (displayed.length > 0) {
        const timer = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, 22);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setPlaceholderIndex((i) => (i + 1) % availableProblems.length);
          setTyping(true);
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [displayed, typing, placeholderIndex]);

  const handleSearchSubmit = () => {
    router.push(availableProblems[placeholderIndex].href);
  };

  return (
    <section className="relative pt-6 pb-14 sm:pb-20 px-6 overflow-hidden">
      <div className="wide-width mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading, Subtitle, Search, CTA */}
          <div className="lg:col-span-7">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {heroContent.eyebrow}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-5">
              Engineering decisions{" "}
              <span className="text-blue-600">under pressure.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-8 font-sans">
              {heroContent.subtitle}
            </p>

            {/* ── Interactive Search Box ───────────────────────────── */}
            <div className="mb-6 max-w-lg">
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none" aria-hidden="true">
                      🔍
                    </span>
                    <span className="font-sans font-semibold text-xs sm:text-sm text-slate-500 uppercase tracking-wider">
                      Explore an architectural bottleneck
                    </span>
                  </div>
                  <button
                    onClick={handleSearchSubmit}
                    className="shrink-0 w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs hover:bg-blue-700 active:translate-y-0.5 transition-all shadow-2xs cursor-pointer"
                    title="Open this problem"
                    aria-label={`Open ${availableProblems[placeholderIndex].prompt}`}
                  >
                    →
                  </button>
                </div>

                <div
                  onClick={handleSearchSubmit}
                  className="font-sans text-base sm:text-lg font-semibold text-slate-900 cursor-pointer hover:text-blue-600 flex items-center gap-2 py-0.5 transition-colors"
                >
                  <span className="text-slate-400 select-none font-mono">↳</span>
                  <span className="text-slate-900 font-semibold tracking-tight">&ldquo;{displayed}&rdquo;</span>
                  <span className="inline-block w-0.5 h-5 bg-blue-600 animate-pulse" />
                </div>
              </div>

              {/* Suggested topics */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Popular:
                </span>
                {heroContent.suggestedQueries.map((q) => (
                  q.href ? (
                    <Link
                      key={q.label}
                      href={q.href}
                      className="font-sans text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs hover:border-blue-300 hover:text-blue-600 hover:-translate-y-0.5 transition-all no-underline inline-flex items-center gap-1.5"
                    >
                      <span>{q.label}</span>
                      <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1 py-0.2 rounded leading-tight">
                        Read
                      </span>
                    </Link>
                  ) : (
                    <span
                      key={q.label}
                      className="font-sans text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md"
                    >
                      {q.label}
                    </span>
                  )
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={heroContent.primaryCta.href}
                className="font-sans text-xs sm:text-sm font-bold py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs no-underline"
              >
                {heroContent.primaryCta.label}
              </Link>
              <Link
                href={heroContent.secondaryCta.href}
                className="font-sans text-xs sm:text-sm font-semibold py-2.5 px-4 text-slate-600 hover:text-slate-900 transition-colors no-underline"
              >
                {heroContent.secondaryCta.label}
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive System Architecture Pressure Console */}
          <div className="lg:col-span-5 flex justify-center">
            <ArchitecturePressurePreview />
          </div>
        </div>
      </div>
    </section>
  );
}
