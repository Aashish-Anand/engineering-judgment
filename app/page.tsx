import Link from "next/link";
import { Hero } from "@/components/Hero";
import { CategoryProblemCard } from "@/components/CategoryProblemCard";
import { LevelExpectation } from "@/components/LevelExpectation";
import { CategoryBadge } from "@/components/CategoryBadge";
import { PhilosophyFlowDiagram } from "@/components/diagrams/PhilosophyFlowDiagram";
import { FeaturedMiniDiagram } from "@/components/diagrams/FeaturedMiniDiagram";
import { exploreCategories, depthLevels, featuredTopic } from "@/data/homepage";
import { HighlightStroke } from "@/components/doodle/HighlightStroke";

export default function Home() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* ── 1. Hero ───────────────────────────────────────────── */}
      <Hero />

      {/* ── 2. Explore by problem type ────────────────────────── */}
      <section id="problems" className="py-6 px-6">
        <div className="wide-width mx-auto">
          {/* Section Heading with doodle spark lines */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-hand font-bold text-2xl text-[#171717] select-none" aria-hidden="true">
                \
              </span>
              <h2 className="font-hand text-3xl sm:text-4xl font-bold tracking-tight text-[#171717]">
                Explore by problem type
              </h2>
            </div>
            <p className="font-sans text-sm sm:text-base text-[#4B5563] max-w-xl">
              Categorized by where the system feels the pressure. Real production failure modes, not generic whiteboard trivia.
            </p>
          </div>

          {/* 8 Hand-drawn pastel category cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {exploreCategories.map((category) => (
              <CategoryProblemCard key={category.id} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Featured Problem ───────────────────────────────── */}
      <section id="featured" className="py-6 px-6">
        <div className="wide-width mx-auto">
          <div className="mb-4">
            <span className="font-hand font-bold text-xl sm:text-2xl text-[#171717] bg-[#FFF0B8] border border-[#171717] px-3 py-0.5 rounded shadow-[1px_1px_0px_#171717]">
              Featured Problem
            </span>
          </div>

          <Link
            href={featuredTopic.href}
            className="block no-underline group"
          >
            <div className="bg-white border-[1.5px] border-[#171717] rounded-[16px_14px_18px_13px/13px_17px_14px_18px] p-6 sm:p-8 shadow-[3px_4px_0px_#171717] group-hover:shadow-[4px_6px_0px_#171717] group-hover:-translate-y-0.5 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Left side: Metadata, Title, Tags, CTA */}
                <div className="md:col-span-8">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <CategoryBadge category={featuredTopic.category} />
                    <span className="font-hand text-sm font-bold px-2 py-0.5 bg-[#FAF9F5] border border-[#171717] rounded">
                      {featuredTopic.difficulty}
                    </span>
                    <span className="text-xs text-[#9CA3AF]">·</span>
                    <span className="font-hand text-sm font-semibold text-[#4B5563]">
                      ⏱️ {featuredTopic.readingTime}
                    </span>
                  </div>

                  <h3 className="font-hand text-2xl sm:text-3xl lg:text-[2rem] font-bold text-[#171717] leading-tight mb-3 group-hover:text-[#DC2626] transition-colors">
                    {featuredTopic.title}
                  </h3>

                  <p className="font-sans text-sm sm:text-base text-[#374151] leading-relaxed mb-4">
                    {featuredTopic.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {featuredTopic.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-hand text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded bg-[#FAF9F5] border border-[#171717] text-[#171717] shadow-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <span className="doodle-btn bg-[#FFF0B8] group-hover:bg-[#FFE894]">
                    Read the decision →
                  </span>
                </div>

                {/* Right side: Hand-drawn Mini Architecture Diagram */}
                <div className="md:col-span-4 flex justify-center">
                  <FeaturedMiniDiagram />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 4. Philosophy & Whiteboard Thinking ───────────────── */}
      <section id="about" className="py-8 px-6 bg-[#F4F1EA] border-y-[1.5px] border-[#171717]">
        <div className="wide-width mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left side text */}
            <div className="lg:col-span-7">
              <span className="font-hand font-bold text-lg text-[#DC2626] mb-2 block">
                How Senior Engineers Think
              </span>
              <h2 className="font-hand text-3xl sm:text-4xl font-bold text-[#171717] mb-4 leading-tight">
                Every architecture decision is a{" "}
                <HighlightStroke color="yellow">trade-off.</HighlightStroke>
              </h2>
              <div className="space-y-3 font-sans text-sm sm:text-base text-[#374151] leading-relaxed">
                <p>
                  This site doesn&apos;t just ask you to recite definitions. It walks you through what actually happens when writes are flowing at 10M/day, where replication lag accumulates, and what trade-off you are forced to make.
                </p>
                <p>
                  Every topic follows the same notebook reasoning chain: from the initial naive mistake, through the real physical constraints, to the chosen architecture, its trade-offs, and crucially — <strong>what breaks next</strong>.
                </p>
              </div>

              <div className="mt-5 p-4 bg-white border border-[#171717] rounded-xl shadow-[2px_2px_0px_#171717]">
                <p className="font-hand font-bold text-base sm:text-lg text-[#171717] mb-0">
                  &ldquo;A migration is not a copy problem. It&apos;s a synchronization problem followed by a traffic-switching problem.&rdquo;
                </p>
              </div>
            </div>

            {/* Right side diagram */}
            <div className="lg:col-span-5 flex justify-center">
              <PhilosophyFlowDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Engineering Depth / Level Expectations ─────────── */}
      <section id="topics" className="py-8 px-6">
        <div className="wide-width mx-auto">
          <div className="mb-4">
            <span className="font-hand font-bold text-lg text-[#4B5563] block mb-1">
              Depth &amp; Maturity
            </span>
            <h2 className="font-hand text-3xl sm:text-4xl font-bold text-[#171717] tracking-tight">
              Expectations at every level
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#4B5563] max-w-xl">
              How interviewers and principal engineers evaluate your design depth — from mechanical correctness to long-term operational ownership.
            </p>
          </div>

          <LevelExpectation levels={depthLevels} />
        </div>
      </section>
    </div>
  );
}
