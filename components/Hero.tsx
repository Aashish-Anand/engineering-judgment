"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HighlightStroke } from "./doodle/HighlightStroke";
import { EngineerDoodle } from "./doodle/EngineerDoodle";
import { heroContent } from "@/data/homepage";

const placeholders = [
  "Safely migrate a production database",
  "Survive a 10M-user flash sale",
  "Prevent poison messages from retrying",
  "Make a payment API strictly idempotent",
  "Handle database connection exhaustion",
];

export function Hero() {
  const router = useRouter();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const target = placeholders[placeholderIndex];

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
          setPlaceholderIndex((i) => (i + 1) % placeholders.length);
          setTyping(true);
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [displayed, typing, placeholderIndex]);

  const handleSearchSubmit = () => {
    // If the active placeholder is flash sale, go to flash sale, else go to database migration
    if (displayed.toLowerCase().includes("flash")) {
      router.push("/topics/traffic/survive-flash-sale");
    } else {
      router.push("/topics/database/safely-migrate-production-database");
    }
  };

  return (
    <section className="relative pt-6 pb-14 sm:pb-20 px-6 overflow-hidden">
      <div className="wide-width mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading, Subtitle, Search, CTA */}
          <div className="lg:col-span-7">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-3">
              <span className="font-hand font-bold text-base sm:text-lg text-[#4B5563]">
                {heroContent.eyebrow}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-hand text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#171717] leading-[1.08] mb-5">
              Engineering decisions{" "}
              <HighlightStroke color="blue">under pressure.</HighlightStroke>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#374151] leading-relaxed max-w-xl mb-8 font-sans">
              {heroContent.subtitle}
            </p>

            {/* ── Notebook Search Box ───────────────────────────── */}
            <div className="mb-6 max-w-lg">
              <div className="bg-white border-[1.5px] border-[#171717] rounded-[14px_16px_13px_15px/15px_13px_16px_14px] p-3.5 sm:p-4 shadow-[2px_3px_0px_#171717]">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#171717]/15 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none" aria-hidden="true">
                      🔍
                    </span>
                    <span className="font-hand font-bold text-base sm:text-lg text-[#171717]">
                      What are you trying to solve?
                    </span>
                  </div>
                  <button
                    onClick={handleSearchSubmit}
                    className="shrink-0 w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold text-sm hover:bg-[#374151] active:translate-y-0.5 transition-all shadow-xs"
                    title="View topic"
                    aria-label="Search"
                  >
                    →
                  </button>
                </div>

                <div
                  onClick={handleSearchSubmit}
                  className="font-hand text-lg sm:text-xl text-[#4B5563] cursor-pointer hover:text-[#171717] flex items-center gap-1.5 py-0.5"
                >
                  <span className="text-[#171717]/50 select-none">↳</span>
                  <span className="text-[#171717] font-semibold">&ldquo;{displayed}&rdquo;</span>
                  <span className="inline-block w-0.5 h-5 bg-[#171717] animate-pulse" />
                </div>
              </div>

              {/* Scribbled suggested topics */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
                <span className="font-hand font-bold text-sm sm:text-base text-[#6B7280]">
                  Try:
                </span>
                {heroContent.suggestedQueries.map((q) => (
                  q.href ? (
                    <Link
                      key={q.label}
                      href={q.href}
                      className="font-hand text-sm sm:text-base font-semibold text-[#171717] bg-white border border-[#171717] px-2 py-0.5 rounded shadow-[1px_1px_0px_#171717] hover:bg-[#FFF0B8] transition-colors no-underline"
                    >
                      {q.label}
                    </Link>
                  ) : (
                    <span
                      key={q.label}
                      className="font-hand text-sm sm:text-base font-medium text-[#6B7280] bg-[#FAF9F5] border border-[#171717]/40 px-2 py-0.5 rounded opacity-80"
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
                className="doodle-btn bg-[#FFF0B8] hover:bg-[#FFE894]"
              >
                {heroContent.primaryCta.label}
              </Link>
              <Link
                href={heroContent.secondaryCta.href}
                className="font-hand text-lg font-bold text-[#171717] underline decoration-2 underline-offset-4 hover:text-[#DC2626] transition-colors"
              >
                {heroContent.secondaryCta.label}
              </Link>
            </div>
          </div>

          {/* Right Column: Hand-drawn Engineer Doodle with Thought Bubble */}
          <div className="lg:col-span-5 flex justify-center">
            <EngineerDoodle />
          </div>
        </div>
      </div>
    </section>
  );
}
