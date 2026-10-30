import { BlueprintArticleFrame } from "./BlueprintArticleFrame";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ArticleNav } from "@/components/ArticleNav";
import { ArticleQuizEntry } from "@/components/ArticleQuizEntry";
import { SectionHeader } from "@/components/SectionHeader";
import { RelatedTopics } from "@/components/RelatedTopics";
import { InlineCheck } from "@/components/InlineCheck";
import { NaiveMigrationDiagram } from "@/components/diagrams/NaiveMigrationDiagram";
import { CapacitySizingLab } from "@/components/CapacitySizingLab";
import { CutoverWorkbench } from "@/components/CutoverWorkbench";
import { InPractice } from "@/components/InPractice";
import { FencedCutoverSequence, MigrationOwnershipLanes } from "@/components/diagrams/MigrationPhaseDiagrams";
import { TradeoffDiagnosticsHub } from "@/components/TradeoffDiagnosticsHub";
import { CareerRubricHub } from "@/components/CareerRubricHub";

import * as article from "@/data/topics/safely-migrate-production-database";
import neo from "@/components/Neo.module.css";

export function DatabaseMigrationArticle() {
  const {
    tocItems,
    relatedTopics,
  } = article;

  return (
    <BlueprintArticleFrame topicId="database-migration" toc={tocItems}>

            {/* ── 01 — The Problem & Live Capacity Calculator ──── */}
            <section id="the-problem" className="scroll-mt-28">
              <SectionHeader
                number="01"
                title="Workload and constraints"
                id="the-problem"
              />
              <p className="reading-copy">The source handles 100 million reads and 10 million writes each day. We need to move that workload to a new database without interrupting the application or losing acknowledged writes. The largest table holds about 250 million rows, roughly 500 GB of row data at 2 KB per row.</p>
              <p className="reading-copy">Daily volume is only the starting point. Ten million writes per day averages about 116 writes per second; a 3× burst raises that to 348. Change the assumptions below to see how much capacity the replication pipeline needs.</p>
              <p className="scenario-note">The cutover workbench later uses a separate illustrative load of 2,300 reads and 250 writes per second. Calculator inputs do not change that simulation.</p>

              {/* Interactive Sizing Widget */}
              <div className={neo.labPanel}><CapacitySizingLab /></div>
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

              <div className={neo.articleFigure}>
                <ScrollReveal>
                  <NaiveMigrationDiagram />
                </ScrollReveal>
              </div>

              <InlineCheck
                className={neo.conceptCheck}
                question="Architectural Gut Check: The dump of your 250-million-row database starts at 2:00 AM, and the restore on DB B finishes at 6:00 AM. Can you flip production DNS to DB B at 6:01 AM?"
                options={[
                  {
                    label: "Yes, because pg_dump runs in a single consistent transaction snapshot.",
                    isCorrect: false,
                    explanation: "pg_dump is consistent, but only as of 2:00 AM. All 4 hours of live production mutations that arrived between 2:00 AM and 6:00 AM are missing from DB B. Flipping DNS drops 4 hours of customer activity.",
                  },
                  {
                    label: "No, because the new database is missing 4 hours of concurrent production writes (~1.7M).",
                    isCorrect: true,
                    explanation: "Right. At 10M writes per day, a 4-hour window holds about 1.7 million inserts, updates, and deletes that never reached DB B. A snapshot must be paired with a change stream that starts at the snapshot's exact position.",
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
              <p className="reading-copy">There are two proven ways to keep the target synchronized. <strong>Change data capture</strong> reads the source database&apos;s log, so one writer stays authoritative and every change is captured, including writes from jobs and other services. <strong>Application dual writes</strong> change the code to write both stores. Stripe&apos;s published migrations use four phases: dual-write, read from both and compare, write only to the new store, then remove the old. Dual writes suit a single codebase that owns every write and needs to reshape data; CDC suits databases with many writers. This blueprint uses CDC.</p>
              <p className="reading-copy">The rest of this blueprint follows that split: five phases that build confidence in the target, and one short, fenced moment where write ownership actually moves.</p>
              <div className={neo.decisionNote}><span className="eyebrow">A decision to carry forward</span><h3>Copied ≠ caught up.<br />Caught up ≠ safe to switch.</h3><p>Verify the data, drain in-flight writes, and protect the rollback path before transferring ownership.</p></div>
            </section>

            {/* ── 04 — The Five Phases ──────────────────────────── */}
            <section id="phases" className="scroll-mt-28">
              <SectionHeader
                number="04"
                title="Run the migration in five phases"
                id="phases"
              />
              <p className="reading-copy">Each phase has an exit condition. Move to the next one only when the evidence says the previous one is done, not when the calendar says so.</p>
              <MigrationOwnershipLanes />

              <h3>1. Seed the target from a known position</h3>
              <p className="reading-copy">Create the change-data-capture (CDC) position first. In PostgreSQL that is a logical replication slot, which remembers a point in the write-ahead log (WAL), the ordered record of every committed change. Then copy existing rows in a snapshot that is consistent with that same position. The order matters: if you copy first and start capturing later, every write between the two moments is silently lost.</p>
              <p className="reading-copy">For 250 million rows, copy in small keyset batches (<code>WHERE id &gt; last_id ORDER BY id LIMIT 1000</code>) with a short pause between batches. Offset pagination gets slower on every page, and an unthrottled copy competes with customer queries for disk and CPU on the source.</p>

              <h3>2. Stream every change from that position</h3>
              <p className="reading-copy">The CDC consumer reads the WAL from the recorded position and applies inserts, updates, and deletes to DB B in commit order. Because the backfill and the stream overlap, the same row can arrive twice. Make every apply idempotent: upsert by primary key and let the newer WAL position win, so replaying a change is harmless.</p>
              <p className="reading-copy">Watch two signals. Lag (how far DB B trails A, in seconds) tells you whether the target keeps up. Retained WAL on the source tells you whether a stalled consumer is quietly filling A&apos;s disk, because the slot keeps every log segment it has not acknowledged.</p>

              <h3>3. Validate before you trust the target</h3>
              <p className="reading-copy">Matching row counts prove quantity, not correctness. Compare checksums per primary-key range (for example, one hash per 100,000 IDs) and re-check ranges that changed during the comparison. Add shadow reads: serve the customer from A, read the same record from B in the background, and record any difference. Finally, check business invariants such as account balance totals and orphaned foreign keys.</p>
              <p className="reading-copy">Exit condition: divergence stays at zero across a full traffic cycle, including the batch jobs that only run at night.</p>

              <h3>4. Move reads gradually</h3>
              <p className="reading-copy">Reads can ramp safely (1%, 20%, 50%, 100%) because A still owns every write, so rolling back is only a routing change. Mind replication lag: a user who just saved something should read from A, or from B only after B has applied that write&apos;s position. Otherwise the user sees their own change disappear.</p>

              <h3>5. Transfer write ownership, then keep a way back</h3>
              <p className="reading-copy">Writes cannot be split by a random percentage. If both databases accept writes to the same row, they conflict and neither is the source of truth. Ownership moves either in one short, fenced switch, or tenant by tenant, so that every key has exactly one writer at any moment. The workbench below models the tenant-by-tenant version.</p>
              <ol>
                <li>Confirm lag is below the threshold (for example, under one second) and validation is clean.</li>
                <li>Prepare reverse replication from B to A, ready to start the moment B accepts writes.</li>
                <li>Fence A: hold writes at the application or proxy for a few seconds. Requests wait briefly instead of failing.</li>
                <li>Wait until B has applied A&apos;s final WAL position.</li>
                <li>Route writes to B, release the held requests, and start the reverse stream.</li>
                <li>Watch errors, latency, and reverse-stream lag. Rolling back is the same procedure in the other direction.</li>
              </ol>
              <FencedCutoverSequence />
              <p className="reading-copy">In practice, &ldquo;zero downtime&rdquo; means no visible outage. A write hold of a few seconds is usually part of it, and it is far safer than letting two databases accept the same writes.</p>
              <p className="reading-copy">Keep A in sync for at least one full business cycle (month-end jobs, weekly reports) before you decommission it. Some divergence only shows up when a rare query finally runs.</p>

              <InPractice
                title="Tools teams use for each phase"
                points={[
                  "PostgreSQL logical replication (publications and subscriptions), or Debezium's PostgreSQL connector, streams WAL changes from a replication slot.",
                  "AWS DMS runs a full load plus ongoing replication (CDC); for PostgreSQL it reads changes through a logical replication slot. AWS states there is no latency SLA for CDC, so measure lag rather than assume it.",
                  "Keeping a reverse stream for rollback is bidirectional replication. DMS supports it only with loopback prevention enabled, otherwise each change echoes back to the database it came from.",
                  "Stripe's published migrations used application dual writes in four steps (dual write, move reads, move writes, remove old data) and verified read paths with GitHub's Scientist library.",
                ]}
                sources={[
                  ["PostgreSQL: Logical replication", "https://www.postgresql.org/docs/current/logical-replication.html"],
                  ["Debezium: PostgreSQL connector", "https://debezium.io/documentation/reference/stable/connectors/postgresql.html"],
                  ["AWS DMS: Ongoing replication", "https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Task.CDC.html"],
                  ["Stripe: Online migrations at scale", "https://stripe.com/blog/online-migrations"],
                ]}
              />
            </section>

            {/* ── 05 — Interactive Migration Workbench ─────────── */}
            <section id="workbench" className="scroll-mt-28">
              <SectionHeader
                number="05"
                title="Explore the migration"
                id="workbench"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                Step through the phases, then try a cutover. The slider moves tenants (and their reads and writes) from A to B. Introduce replication lag or a validation mismatch and observe how the system responds. Numbers here are an illustrative peak load, not the calculator above.
              </p>

              <ScrollReveal>
                <div className={neo.labPanel}>
                <CutoverWorkbench />
                </div>
              </ScrollReveal>
            </section>

            {/* ── 06 — Trade-offs, Runbook & Traps Hub ──────────── */}
            <section id="tradeoffs-hub" className="scroll-mt-28">
              <SectionHeader
                number="06"
                title="Trade-offs and failure modes"
                id="tradeoffs-hub"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                Compare synchronization approaches, see how each failure mode is detected and handled, and review the traps that make migrations overrun.
              </p>

              <ScrollReveal>
                <div className={neo.detailPanel}><TradeoffDiagnosticsHub /></div>
              </ScrollReveal>
            </section>

            {/* ── 07 — Interview & Career Rubric ────────────────── */}
            <section id="career-rubric" className="scroll-mt-28">
              <SectionHeader
                number="07"
                title="Explain the decision"
                id="career-rubric"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                What a strong explanation covers at each engineering level, a 60-second summary, and the follow-up questions interviewers commonly ask.
              </p>

              <ScrollReveal>
                <div className={neo.detailPanel}><CareerRubricHub initiallyExpanded={false} /></div>
              </ScrollReveal>
            </section>

            {/* ── 08 — Judgment Quiz ───────────────────────────── */}
            {article.judgmentQuiz && (
              <section id="judgment-quiz" className="scroll-mt-28">
                <SectionHeader
                  number="08"
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

            {/* ── 09 — Related Architectures ───────────────────── */}
            <section id="related" className="scroll-mt-28 pt-4">
              <SectionHeader
                number="09"
                title="Keep exploring"
                id="related"
              />
              <RelatedTopics ids={relatedTopics} />
              <div className="mt-8">
                <ArticleNav currentId="database-migration" />
              </div>
            </section>
    </BlueprintArticleFrame>
  );
}
