import { Breadcrumb } from "@/components/Breadcrumb";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ArticleNav } from "@/components/ArticleNav";
import { ArticleQuizEntry } from "@/components/ArticleQuizEntry";
import { SectionHeader } from "@/components/SectionHeader";
import { RelatedTopics } from "@/components/RelatedTopics";
import { TableOfContents } from "@/components/TableOfContents";
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
    relatedTopics,
  } = article;

  return (
    <article className="migration-article page-shell pt-6 pb-20">
      <div className="wide-width mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Problems", href: "/" },
            { label: "Data", href: "/#problems" },
            { label: "Database Migration" },
          ]}
        />

        <header className="migration-header">
          <div><p className="eyebrow">Data / Blueprint 01 · {meta.readingTime}</p>
            <h1>{meta.title}</h1>
            <p className="article-deck">Keep the system available while you synchronize, validate, and transfer ownership of production writes.</p>
          </div>
          <aside className="scenario-context" aria-label="Scenario assumptions">
            <span className="eyebrow">The scenario</span>
            <dl><div><dt>Daily reads</dt><dd>100 million</dd></div><div><dt>Daily writes</dt><dd>10 million</dd></div><div><dt>Downtime budget</dt><dd>Zero</dd></div><div><dt>Approach</dt><dd>Snapshot + CDC</dd></div></dl>
          </aside>
        </header>
        <div className="article-thesis"><span className="eyebrow">The central idea</span><p>A snapshot copies the database at one moment. Production writes continue afterward, so the target immediately falls behind. The migration has two jobs: keep the databases synchronized, then transfer traffic while preserving a way back.</p></div>

        {/* Main Content Layout with Sticky TOC */}
        <div className="article-layout">
          {/* Sticky TOC */}
          <TableOfContents items={tocItems} />

          {/* Article Main Reading Column */}
          <div className="article-content min-w-0 space-y-12">
            {/* ── 01 — The Problem & Live Capacity Calculator ──── */}
            <section id="the-problem" className="scroll-mt-28">
              <SectionHeader
                number="01"
                title="Workload and constraints"
                id="the-problem"
              />
              <p className="reading-copy">The source handles 100 million reads and 10 million writes each day. We need to move that workload to a new database without interrupting the application or losing acknowledged writes.</p>
              <p className="reading-copy">Daily volume is only the starting point. Ten million writes per day averages about 116 writes per second; a 3× burst raises that to 348. Change the assumptions below to see how much capacity the replication pipeline needs.</p>
              <p className="scenario-note">The cutover workbench later uses a separate illustrative load of 2,300 reads and 250 writes per second. Calculator inputs do not change that simulation.</p>

              {/* Interactive Sizing Widget */}
              <CapacitySizingLab />
            </section>

            {/* ── 02 — The Naive Snapshot Trap & Gut Check ─────── */}
            <section id="the-mistake" className="scroll-mt-28">
              <SectionHeader
                number="02"
                title="Why a snapshot falls behind"
                id="the-mistake"
              />
              <p className="text-slate-700 leading-relaxed">
                The initial instinct is often: <strong>dump the database using pg_dump and restore it on the target</strong>. It seems intuitive—export everything, import into the new system, switch DNS. But in an active production system, the target will be missing writes received after the snapshot began.
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
            <section id="mental-model" className="scroll-mt-28">
              <SectionHeader
                number="03"
                title="Synchronize, then switch"
                id="mental-model"
              />
              <p className="reading-copy">Separate data synchronization from traffic ownership. A target can contain the right records and still be unsafe to promote if recent writes are in flight or the rollback path has fallen behind.</p>
              <p className="text-slate-700 leading-relaxed">
                First, bring the target to identical state with the source while traffic flows freely. Then, move traffic gradually without serving stale reads or losing in-flight writes. Conflating these two stages is where most migrations fail.
              </p>
            </section>

            {/* ── 04 — Interactive Migration Workbench ─────────── */}
            <section id="workbench" className="scroll-mt-28">
              <SectionHeader
                number="04"
                title="Explore the migration"
                id="workbench"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                Step through the migration, then try a cutover. Introduce replication lag or a validation mismatch and observe how the system responds.
              </p>

              <ScrollReveal>
                <CutoverWorkbench />
              </ScrollReveal>
            </section>

            {/* ── 05 — Trade-offs, Runbook & Traps Hub ──────────── */}
            <section id="tradeoffs-hub" className="scroll-mt-28">
              <SectionHeader
                number="05"
                title="Trade-offs and failure modes"
                id="tradeoffs-hub"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                Compare architectural approaches, review automated telemetry responses for the 7 classic failure modes, and study the top traps that cause migrations to overrun:
              </p>

              <ScrollReveal>
                <TradeoffDiagnosticsHub />
              </ScrollReveal>
            </section>

            {/* ── 06 — Staff+ Interview & Career Rubric ─────────── */}
            <section id="career-rubric" className="scroll-mt-28">
              <SectionHeader
                number="06"
                title="Explain the decision"
                id="career-rubric"
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
              <section id="judgment-quiz" className="scroll-mt-28">
                <SectionHeader
                  number="07"
                  title="Test your judgment"
                  id="judgment-quiz"
                />
                <ScrollReveal>
                  <ArticleQuizEntry
                    quizHref="/topics/database/safely-migrate-production-database/quiz"
                    title="Zero-Downtime Migration Judgment Test"
                    questions={article.judgmentQuiz}
                  />
                </ScrollReveal>
              </section>
            )}

            {/* ── 08 — Related Architectures ───────────────────── */}
            <section id="related" className="scroll-mt-28 pt-4">
              <SectionHeader
                number="08"
                title="Keep exploring"
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
