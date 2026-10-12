import { Breadcrumb } from "@/components/Breadcrumb";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ArticleNav } from "@/components/ArticleNav";
import { JudgmentQuiz } from "@/components/JudgmentQuiz";
import { CategoryBadge } from "@/components/CategoryBadge";
import { SectionHeader } from "@/components/SectionHeader";
import { MetricTable } from "@/components/MetricTable";
import { InsightCard } from "@/components/InsightCard";
import { ProblemStatement } from "@/components/ProblemStatement";
import { RelatedTopics } from "@/components/RelatedTopics";
import { TableOfContents } from "@/components/TableOfContents";
import { ExecutiveBlueprint } from "@/components/ExecutiveBlueprint";
import { InlineCheck } from "@/components/InlineCheck";
import { NaiveMigrationDiagram } from "@/components/diagrams/NaiveMigrationDiagram";
import { CapacitySizingLab } from "@/components/CapacitySizingLab";
import { CutoverWorkbench } from "@/components/CutoverWorkbench";
import { TradeoffDiagnosticsHub } from "@/components/TradeoffDiagnosticsHub";
import { CareerRubricHub } from "@/components/CareerRubricHub";

import * as article from "@/data/topics/safely-migrate-production-database";

export function DatabaseMigrationArticle() {
  const {
    meta,
    tocItems,
    scenarioMetrics,
    relatedTopics,
  } = article;

  return (
    <article className="pt-4 pb-16 px-4 sm:px-6">
      <div className="wide-width mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Problems", href: "/" },
            { label: "Data", href: "/#problems" },
            { label: "Database Migration" },
          ]}
        />

        {/* Modern Editorial Header */}
        <header className="mb-8 pb-8 border-b border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Title, Subtitle, Tags */}
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <CategoryBadge category={meta.category} size="md" />
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded">
                  {meta.difficulty}
                </span>
                <span className="text-xs text-slate-300">·</span>
                <span className="font-mono text-xs text-slate-500 font-medium">
                  ⏱️ {meta.readingTime}
                </span>
              </div>

              <h1 className="font-sans text-2xl sm:text-3xl lg:text-[2.25rem] font-bold text-slate-900 leading-[1.2] tracking-tight mb-3">
                {meta.title}
              </h1>

              <p className="font-sans text-base sm:text-lg text-slate-600 leading-relaxed mb-4">
                &ldquo;{meta.subtitle}&rdquo;
              </p>

              <div className="flex flex-wrap gap-1.5">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Architecture Context Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                  <span className="font-sans font-bold text-xs uppercase tracking-wider text-slate-500">
                    Production Context
                  </span>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                    High Pressure
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Daily Scale</span>
                    <span className="font-bold text-slate-900">100M Reads · 10M Writes</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Peak QPS</span>
                    <span className="font-semibold text-slate-900">~2,300 RPS / 250 WPS</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Target SLA</span>
                    <span className="font-semibold text-emerald-600">Zero Downtime</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Primary Strategy</span>
                    <span className="font-semibold text-slate-800">CDC + Shadow Dual-Write</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Rollback SLA</span>
                    <span className="font-semibold text-blue-600">&lt; 30s Reverse Sync</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 30-Second Executive Blueprint */}
        <ExecutiveBlueprint
          timeToRead="30-Second Architecture Blueprint"
          bottleneck="Production writes never stop (~115 WPS). A database dump takes 6 hours and is instantly missing 2.5M concurrent customer mutations."
          solution="Snapshot + CDC Stream + Keyset Cursor Backfill + Stripe-style Shadow Reads + Zero-downtime Cutover with Reverse Replication."
          goldenRule="Never switch live writes to the target database until Reverse CDC is actively replicating back to the legacy primary."
          keyMetrics={[
            { label: "Target CDC Lag", value: "< 1.0 second" },
            { label: "Backfill Batch", value: "1,000 rows (Keyset cursor)" },
            { label: "Rollback Recovery", value: "< 30s zero-data-loss" },
          ]}
        />

        {/* Main Content Layout with Sticky TOC */}
        <div className="flex gap-10 items-start">
          {/* Sticky TOC */}
          <TableOfContents items={tocItems} />

          {/* Article Main Reading Column */}
          <div className="flex-1 min-w-0 prose-width space-y-10">
            {/* ── 01 — The Problem & Live Capacity Calculator ──── */}
            <section id="the-problem" className="scroll-mt-16">
              <SectionHeader
                number="01"
                title="The Production Constraint & Workload Scale"
                id="the-problem"
                annotation="100M Reads / 10M Writes"
              />
              <ProblemStatement>
                <p>
                  We have an active production database handling significant traffic. We must migrate to a new database technology, infrastructure, or schema <strong>without taking the system offline and without losing customer writes</strong>.
                </p>
                <p className="font-sans text-base text-slate-900 font-semibold mb-0">
                  &ldquo;This is not a database copy problem. It is a live distributed synchronization problem.&rdquo;
                </p>
              </ProblemStatement>

              <div className="my-5">
                <MetricTable rows={scenarioMetrics} />
              </div>

              {/* Interactive Sizing Widget */}
              <CapacitySizingLab />
            </section>

            {/* ── 02 — The Naive Snapshot Trap & Gut Check ─────── */}
            <section id="the-mistake" className="scroll-mt-16">
              <SectionHeader
                number="02"
                title="The Obvious Mistake: Static Dump & Restore"
                id="the-mistake"
              />
              <p className="text-slate-700 leading-relaxed">
                The initial instinct is often: <strong>dump the database using pg_dump and restore it on the target</strong>. It seems intuitive—export everything, import into the new system, switch DNS. But in an active production system, this guaranteed data loss.
              </p>

              <div className="my-6">
                <ScrollReveal>
                  <NaiveMigrationDiagram />
                </ScrollReveal>
              </div>

              <InlineCheck
                question="Architectural Gut Check: Your database is 2 TB. You take a pg_dump starting at 2:00 AM, which finishes at 6:00 AM. Can you flip production DNS to DB B at 6:01 AM?"
                options={[
                  {
                    label: "Yes, because pg_dump runs in a single consistent transaction snapshot.",
                    isCorrect: false,
                    explanation: "pg_dump is consistent with 2:00 AM! All 4 hours of live production mutations that arrived between 2:00 AM and 6:00 AM are missing from DB B. Flipping DNS drops 4 hours of customer activity.",
                  },
                  {
                    label: "No, because the new database is missing 4 hours of concurrent production writes (~1.6M rows).",
                    isCorrect: true,
                    explanation: "Spot on! In a 10M write/day system, that 4-hour window leaves ~1,600,000 customer writes completely missing from DB B. Static snapshots must always be paired with a Change Data Capture (CDC) stream.",
                  },
                  {
                    label: "Yes, as long as you clear Redis and restart application pods.",
                    isCorrect: false,
                    explanation: "Clearing caches and restarting pods does not replay missing persistent rows into PostgreSQL.",
                  },
                ]}
              />
            </section>

            {/* ── 03 — Mental Model ────────────────────────────── */}
            <section id="mental-model" className="scroll-mt-16">
              <SectionHeader
                number="03"
                title="The Core Mental Model: Synchronize, Then Switch"
                id="mental-model"
              />
              <ScrollReveal>
                <InsightCard title="The Architectural Invariant">
                  A production database migration is a <strong>continuous synchronization problem</strong> followed by a <strong>gradual traffic-switching problem</strong>.
                </InsightCard>
              </ScrollReveal>
              <p className="text-slate-700 leading-relaxed">
                First, bring the target to identical state with the source while traffic flows freely. Then, move traffic gradually without serving stale reads or losing in-flight writes. Conflating these two stages is where most migrations fail.
              </p>
            </section>

            {/* ── 04 — Interactive Migration Workbench ─────────── */}
            <section id="workbench" className="scroll-mt-16">
              <SectionHeader
                number="04"
                title="Interactive Cutover Workbench & Lifecycle Pipeline"
                id="workbench"
                annotation="5-Phase Control Panel"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                Explore each phase of the migration lifecycle below. Inspect live topology flows, examine the non-blocking keyset backfill query and Stripe shadow read comparator, and shift live production traffic with real-time incident controls:
              </p>

              <ScrollReveal>
                <CutoverWorkbench />
              </ScrollReveal>
            </section>

            {/* ── 05 — Trade-offs, Runbook & Traps Hub ──────────── */}
            <section id="tradeoffs-hub" className="scroll-mt-16">
              <SectionHeader
                number="05"
                title="Trade-offs, Incident Runbook & Production Traps"
                id="tradeoffs-hub"
                annotation="Decision Matrix"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                Compare architectural approaches, review automated telemetry responses for the 7 classic failure modes, and study the top traps that cause migrations to overrun:
              </p>

              <ScrollReveal>
                <TradeoffDiagnosticsHub />
              </ScrollReveal>
            </section>

            {/* ── 06 — Staff+ Interview & Career Rubric ─────────── */}
            <section id="career-rubric" className="scroll-mt-16">
              <SectionHeader
                number="06"
                title="Engineering Level Rubric & Interview Synthesis"
                id="career-rubric"
                annotation="L4 to Staff Evaluation"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                How top tech companies evaluate migration design across engineering seniority levels, complete with verbal synthesis and follow-up probing questions:
              </p>

              <ScrollReveal>
                <CareerRubricHub />
              </ScrollReveal>
            </section>

            {/* ── 07 — Judgment Quiz ───────────────────────────── */}
            {article.judgmentQuiz && (
              <section id="judgment-quiz" className="scroll-mt-16">
                <SectionHeader
                  number="07"
                  title="Test Your Judgment: Production Migration"
                  id="judgment-quiz"
                />
                <ScrollReveal>
                  <JudgmentQuiz
                    title="Zero-Downtime Migration Judgment Test"
                    questions={article.judgmentQuiz}
                  />
                </ScrollReveal>
              </section>
            )}

            {/* ── 08 — Related Architectures ───────────────────── */}
            <section id="related" className="scroll-mt-16 pt-4">
              <SectionHeader
                number="08"
                title="Related System Architecture Deep Dives"
                id="related"
              />
              <RelatedTopics topics={relatedTopics} />
              <div className="mt-8">
                <ArticleNav currentId="database-migration" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
