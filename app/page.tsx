import Link from "next/link";
import { Hero } from "@/components/Hero";
import { CategoryProblemCard } from "@/components/CategoryProblemCard";
import { LevelExpectation } from "@/components/LevelExpectation";
import { CategoryBadge } from "@/components/CategoryBadge";
import { PhilosophyFlowDiagram } from "@/components/diagrams/PhilosophyFlowDiagram";
import { FeaturedMiniDiagram } from "@/components/diagrams/FeaturedMiniDiagram";
import { exploreCategories, depthLevels, featuredTopic } from "@/data/homepage";

export default function Home() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* ── 1. Hero ───────────────────────────────────────────── */}
      <Hero />

      {/* ── 2. Explore by problem type ────────────────────────── */}
      <section id="problems" className="py-6 px-6">
        <div className="wide-width mx-auto">
          {/* Section Heading */}
          <div className="mb-6">
            <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
              Explore by problem type
            </h2>
            <p className="font-sans text-sm sm:text-base text-slate-600 max-w-xl">
              Categorized by where the system feels the pressure. Real production failure modes, not generic whiteboard trivia.
            </p>
          </div>

          {/* 8 Clean category cards */}
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
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full shadow-2xs">
              ★ Flagship Architecture Blueprint
            </span>
          </div>

          <Link
            href={featuredTopic.href}
            className="block no-underline group"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs group-hover:border-blue-200 group-hover:shadow-sm group-hover:-translate-y-0.5 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Left side: Metadata, Title, Tags, CTA */}
                <div className="md:col-span-8">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <CategoryBadge category={featuredTopic.category} />
                    <span className="font-sans text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full">
                      {featuredTopic.difficulty}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="font-sans text-xs font-medium text-slate-500">
                      ⏱️ {featuredTopic.readingTime}
                    </span>
                  </div>

                  <h3 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors">
                    {featuredTopic.title}
                  </h3>

                  <p className="font-sans text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                    {featuredTopic.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {featuredTopic.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-sans text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 shadow-2xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className="font-sans text-xs sm:text-sm font-bold py-2.5 px-4 bg-blue-600 group-hover:bg-blue-700 text-white rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-colors">
                    Read the architectural blueprint →
                  </span>
                </div>

                {/* Right side: Architecture Diagram Preview */}
                <div className="md:col-span-4 flex justify-center">
                  <FeaturedMiniDiagram />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 4. Philosophy & Staff Thinking ───────────────────── */}
      <section id="about" className="py-12 px-6 bg-slate-100/60 border-y border-slate-200">
        <div className="wide-width mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left side text */}
            <div className="lg:col-span-7">
              <span className="font-mono text-xs uppercase tracking-wider font-bold text-blue-600 mb-2 block">
                How Senior Engineers Think
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                Every architecture decision is a{" "}
                <span className="text-blue-600 underline decoration-blue-300 decoration-wavy underline-offset-4">trade-off.</span>
              </h2>
              <div className="space-y-3 font-sans text-sm sm:text-base text-slate-600 leading-relaxed">
                <p>
                  This site doesn&apos;t just ask you to recite definitions. It walks you through what actually happens when writes are flowing at 10M/day, where replication lag accumulates, and what trade-off you are forced to make.
                </p>
                <p>
                  Every topic follows the same rigorous reasoning chain: from the initial naive mistake, through the real physical constraints, to the chosen architecture, its trade-offs, and crucially — <strong>what breaks next</strong>.
                </p>
              </div>

              <div className="mt-5 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <p className="font-sans font-semibold text-sm sm:text-base text-slate-800 mb-0 italic">
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
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Depth &amp; Maturity
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Expectations at every level
            </h2>
            <p className="font-sans text-sm sm:text-base text-slate-600 max-w-xl">
              How interviewers and principal engineers evaluate your design depth — from mechanical correctness to long-term operational ownership.
            </p>
          </div>

          <LevelExpectation levels={depthLevels} />
        </div>
      </section>
    </div>
  );
}
