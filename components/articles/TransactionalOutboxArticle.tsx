import { Breadcrumb } from "@/components/Breadcrumb";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ArticleNav } from "@/components/ArticleNav";
import { JudgmentQuiz } from "@/components/JudgmentQuiz";
import { ExecutiveBlueprint } from "@/components/ExecutiveBlueprint";
import { InlineCheck } from "@/components/InlineCheck";
import { CategoryBadge } from "@/components/CategoryBadge";
import { SectionHeader } from "@/components/SectionHeader";
import { MetricTable } from "@/components/MetricTable";
import { InsightCard } from "@/components/InsightCard";
import { ProblemStatement } from "@/components/ProblemStatement";
import { RelatedTopics } from "@/components/RelatedTopics";
import { TableOfContents } from "@/components/TableOfContents";
import { OutboxDiagram, OutboxRelayFlow } from "@/components/diagrams/OutboxDiagram";
import {
  OutboxRowLifecycle,
  DualWriteCrashTimeline,
  IdempotentConsumerExample,
  OutboxSchemaExample,
} from "@/components/diagrams/OutboxWorkedExamples";
import { OutboxLab } from "@/components/OutboxLab";
import { TradeoffDiagnosticsHub } from "@/components/TradeoffDiagnosticsHub";
import { CareerRubricHub } from "@/components/CareerRubricHub";
import { getTopicById } from "@/data/topics/catalog";
import {
  meta,
  tocItems,
  scenarioMetrics,
  tradeoffs,
  failureModes,
  expectations,
  followUps,
  judgmentQuiz,
} from "@/data/topics/transactional-outbox";

const OUTBOX_TRAPS = [
  {
    trapNum: "TRAP 01",
    question: "Why not wrap broker.publish() inside the SQL transaction?",
    explanation:
      "A slow broker or network round-trip holds the database transaction and locks open, consuming database connections. Under load, connection pool exhaustion takes down the entire application API in milliseconds.",
  },
  {
    trapNum: "TRAP 02",
    question: "Why not poll outbox with SELECT * FROM outbox WHERE published = false?",
    explanation:
      "As the outbox table grows to millions of historical rows, sequential scans without composite indexes or high-water marks kill disk IOPS. Furthermore, un-partitioned concurrent polling creates race conditions and re-orders events.",
  },
  {
    trapNum: "TRAP 03",
    question: "Why not rely on Kafka for exactly-once processing across services?",
    explanation:
      "Kafka's transactional producer only guarantees atomicity within Kafka topics, not across external databases. At-least-once delivery is the physical reality; consumer idempotency keys are non-negotiable.",
  },
];

const OUTBOX_WHITEBOARD = [
  { label: "1. Begin TX", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "2. Insert Order", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "3. Insert Outbox Row", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "4. Commit TX", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { label: "5. Relay Poll / CDC", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { label: "6. Idempotent Consumer", color: "bg-purple-50 text-purple-700 border-purple-200" },
];

const OUTBOX_INTERVIEW_SYNTHESIS = `Whenever a business mutation and an event notification must both occur, never execute two separate network writes. Instead, write the event payload to an outbox table within the exact same database transaction as the business entity.

Because ACID transactions guarantee atomicity, the event either persists or rolls back with the data—eliminating both lost events and phantom ghost events.

An asynchronous relay—either an indexed polling worker with SKIP LOCKED or a Debezium CDC connector reading the WAL—tails the table and publishes to Kafka. Finally, because network retries make delivery at-least-once, downstream consumers deduplicate using the outbox row's unique event ID.`;

const OUTBOX_TEN_X = [
  "Outbox table bloat (>10M rows) causing index degradation; requires partitioning by day and aggressive cleanup jobs.",
  "CDC WAL retention exhaustion when the message broker pauses or Kafka connectors fail.",
  "Relay worker throughput bottleneck under 50K WPS; requires horizontal relay partitioning by aggregate_id.",
  "Consumer replay storms upon relay recovery; requires distributed rate limiting and dead-letter queues.",
];

const OUTBOX_AVOID = [
  "Calling remote message brokers from inside SQL transactions.",
  "Publishing events after commit without an outbox table (guaranteed lost events on crash).",
  "Assuming message brokers guarantee exactly-once delivery across external distributed services.",
  "Un-partitioned concurrent polling queries that cause race conditions and out-of-order events.",
];

export function TransactionalOutboxArticle() {
  const relatedTopics = ["database-migration", "flash-sale"].map((id) => {
    const topic = getTopicById(id as "database-migration" | "flash-sale");
    return { title: topic.meta.title, category: topic.meta.category, href: topic.href };
  });

  return (
    <article className="pt-4 pb-16 px-4 sm:px-6">
      <div className="wide-width mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Problems", href: "/" },
            { label: "Correctness", href: "/#problems" },
            { label: "Transactional Outbox" },
          ]}
        />

        {/* Editorial Header */}
        <header className="mb-8 pb-8 border-b border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column */}
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

            {/* Right Column: Context Summary Card */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                  <span className="font-sans font-bold text-xs uppercase tracking-wider text-slate-500">
                    Production Context
                  </span>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                    Data Correctness
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Service</span>
                    <span className="font-bold text-slate-900">Order Processing</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Peak Write Rate</span>
                    <span className="font-semibold text-slate-900">5,000 orders / sec</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Target Invariant</span>
                    <span className="font-semibold text-emerald-600">Zero Lost / Ghost Events</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Primary Strategy</span>
                    <span className="font-semibold text-slate-800">Atomic Outbox + Relay</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Availability</span>
                    <span className="font-semibold text-blue-600">Broker Decoupled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 30-Second Executive Blueprint */}
        <ExecutiveBlueprint
          timeToRead="30-Second Architecture Blueprint"
          bottleneck="Writing to PostgreSQL and publishing to Kafka in the same HTTP request is an uncoordinated dual write. Crashes cause silent data loss (lost events) or phantom records (ghost events)."
          solution="Transactional Outbox Pattern: Insert the event payload into an outbox table in the exact same database transaction as the business entity ➔ Asynchronously relay via Polling or Debezium CDC ➔ Deduplicate at consumer with event IDs."
          goldenRule="Never execute two uncoordinated remote network writes in the same user request; make the event part of the database transaction."
          keyMetrics={[
            { label: "Target Delivery", value: "At-least-once guaranteed" },
            { label: "Event Lag (CDC)", value: "< 50ms WAL tailing" },
            { label: "Consumer Safety", value: "100% Idempotent de-duplication" },
          ]}
        />

        {/* Main Content Layout with Sticky TOC */}
        <div className="flex gap-10 items-start">
          {/* Sticky TOC */}
          <TableOfContents items={tocItems} />

          {/* Article Main Column */}
          <div className="flex-1 min-w-0 prose-width space-y-10">
            {/* ── 01 — The Dual-Write Problem & Live Simulator ── */}
            <section id="the-problem" className="scroll-mt-16">
              <SectionHeader
                number="01"
                title="The Production Constraint & Workload Scale"
                id="the-problem"
                annotation="5,000 Orders/sec"
              />
              <ProblemStatement>
                <p>
                  Every purchase must save an order in the database <strong>and</strong> emit an event to the message broker so payment, inventory, and fulfillment services can act.
                </p>
                <p className="font-sans text-base text-slate-900 font-semibold mb-0">
                  &ldquo;A network partition between your database commit and your broker publish is not an edge case. At 5,000 orders/sec, it is a mathematical certainty.&rdquo;
                </p>
              </ProblemStatement>

              <div className="my-5">
                <MetricTable rows={scenarioMetrics} />
              </div>

              {/* Interactive Polling vs CDC Simulator */}
              <OutboxLab />
            </section>

            {/* ── 02 — The Obvious Mistake & Gut Check ───────── */}
            <section id="the-mistake" className="scroll-mt-16">
              <SectionHeader
                number="02"
                title="The Obvious Mistake: Publishing After or Inside Commit"
                id="the-mistake"
              />
              <p className="text-slate-700 leading-relaxed">
                The intuitive design writes to the database, then publishes to the message broker. If the process crashes, the network times out, or the broker is unavailable between those two steps, the database commit succeeds but the event is never sent:
              </p>

              <div className="my-6">
                <ScrollReveal>
                  <OutboxDiagram />
                </ScrollReveal>
              </div>

              <div className="my-6">
                <ScrollReveal>
                  <DualWriteCrashTimeline />
                </ScrollReveal>
              </div>

              <InlineCheck
                question="Architectural Gut Check: Why can't we just call kafka.publish() inside our DB transaction so that if Kafka fails, the DB rolls back?"
                options={[
                  {
                    label: "It works reliably and is standard production practice.",
                    isCorrect: false,
                    explanation: "Kafka is not an XA resource and does not participate in Postgres transactions. If the broker accepts the message but the DB commit later fails, Kafka cannot 'unsend' the message. Worse, broker latency blocks DB connections.",
                  },
                  {
                    label: "It couples database throughput to broker latency, causing rapid connection pool exhaustion.",
                    isCorrect: true,
                    explanation: "Spot on! Holding a DB connection open while awaiting a remote network round-trip to Kafka will exhaust connection pools (50–200 slots) in milliseconds under load, taking down your entire API.",
                  },
                  {
                    label: "Kafka brokers automatically reject any messages sent from within SQL transactions.",
                    isCorrect: false,
                    explanation: "Kafka has no visibility into database transactions. It will append the message to the log immediately, leading to phantom ghost events if the DB transaction aborts.",
                  },
                ]}
              />
            </section>

            {/* ── 03 — Core Mental Model ─────────────────────── */}
            <section id="mental-model" className="scroll-mt-16">
              <SectionHeader
                number="03"
                title="The Core Mental Model: Make the Event Part of the Data"
                id="mental-model"
              />
              <ScrollReveal>
                <InsightCard title="The Architectural Invariant">
                  Two independent distributed systems cannot be made atomically consistent without coordination. Instead of coordinating two systems, <strong>write the event to the same database in the same transaction</strong>.
                </InsightCard>
              </ScrollReveal>
              <p className="text-slate-700 leading-relaxed">
                The database already provides ACID atomicity. If we save the event inside the database as part of the business transaction, it is guaranteed to commit if and only if the order commits. A separate relay process then delivers the event asynchronously.
              </p>
            </section>

            {/* ── 04 — Outbox Architecture & Relay Engine ────── */}
            <section id="architecture" className="scroll-mt-16">
              <SectionHeader
                number="04"
                title="Outbox Architecture, Schema & Relay Engine"
                id="architecture"
                annotation="Polling vs CDC"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                The resolved architecture decouples the user request from the message broker. The application touches only its local database:
              </p>

              <div className="my-6">
                <ScrollReveal>
                  <OutboxDiagram resolved={true} />
                </ScrollReveal>
              </div>

              <div className="my-6">
                <ScrollReveal>
                  <OutboxSchemaExample />
                </ScrollReveal>
              </div>

              <div className="my-6">
                <ScrollReveal>
                  <OutboxRowLifecycle />
                </ScrollReveal>
              </div>

              <div className="my-6">
                <ScrollReveal>
                  <OutboxRelayFlow />
                </ScrollReveal>
              </div>

              <InlineCheck
                question="Architectural Gut Check: Why not just poll the outbox table with SELECT * FROM outbox WHERE published_at IS NULL ORDER BY id ASC LIMIT 100?"
                options={[
                  {
                    label: "That is the standard polling relay query, but requires an indexed partial cursor and SKIP LOCKED for concurrent workers.",
                    isCorrect: true,
                    explanation: "Spot on! Plain polling without SKIP LOCKED causes concurrent workers to lock each other. A partial index ON outbox (id) WHERE published_at IS NULL ensures the query stays fast even with 50M historical rows.",
                  },
                  {
                    label: "PostgreSQL prohibits using LIMIT in queries that contain ORDER BY.",
                    isCorrect: false,
                    explanation: "PostgreSQL fully supports ORDER BY with LIMIT; it is standard SQL syntax.",
                  },
                  {
                    label: "Polling queries always corrupt transactional serializability in PostgreSQL.",
                    isCorrect: false,
                    explanation: "SELECT queries do not corrupt serializability, but unindexed table scans create disk I/O bottlenecks.",
                  },
                ]}
              />

              <div className="my-6">
                <ScrollReveal>
                  <IdempotentConsumerExample />
                </ScrollReveal>
              </div>
            </section>

            {/* ── 05 — Trade-offs, Runbook & Traps Hub ───────── */}
            <section id="tradeoffs-hub" className="scroll-mt-16">
              <SectionHeader
                number="05"
                title="Trade-offs, Incident Runbook & Production Traps"
                id="tradeoffs-hub"
                annotation="Decision Matrix"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                Compare relay architectures, review failure recovery procedures, and study the top traps when publishing mission-critical events:
              </p>

              <ScrollReveal>
                <TradeoffDiagnosticsHub
                  approachesTitle="1. Outbox Relay Architecture Options"
                  approachesHeaders={["Relay Approach", "Advantage", "Trade-off / Operational Risk"]}
                  approachesRows={tradeoffs}
                  keyTradeoffsTitle="2. Key Correctness & Ordering Trade-offs"
                  keyTradeoffsHeaders={["Decision", "Benefit", "Cost / Complexity"]}
                  keyTradeoffsRows={[
                    ["Per-Aggregate Ordering", "Simple partitioning by aggregate_id", "No global cross-aggregate ordering"],
                    ["At-Least-Once Relay", "Guaranteed zero lost events", "Downstream must implement idempotency keys"],
                    ["Synchronous Dual Write", "Zero extra tables or workers", "Inconsistent on any process or network failure"],
                  ]}
                  failureModesTitle="Outbox Failure Modes, Detection & Runbook"
                  failureModesHeaders={["Failure Mode", "Detection Signal", "Mitigation & Operational Response"]}
                  failureModesRows={failureModes}
                  trapsTitle="The 3 Classic Outbox Production Traps"
                  traps={OUTBOX_TRAPS}
                  tenXTitle="What Happens at 10× Scale (50,000 Events / Sec)?"
                  tenXProblems={OUTBOX_TEN_X}
                  avoidTitle="⚠️ Anti-patterns that cause data loss or pool exhaustion:"
                  avoidList={OUTBOX_AVOID}
                />
              </ScrollReveal>
            </section>

            {/* ── 06 — Staff+ Interview & Career Rubric ──────── */}
            <section id="career-rubric" className="scroll-mt-16">
              <SectionHeader
                number="06"
                title="Engineering Level Rubric & Interview Synthesis"
                id="career-rubric"
                annotation="L4 to Staff Evaluation"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                How tech companies evaluate event publishing design across engineering seniority levels, complete with verbal synthesis and follow-up probing questions:
              </p>

              <ScrollReveal>
                <CareerRubricHub
                  interviewAnswer={OUTBOX_INTERVIEW_SYNTHESIS}
                  levelExpectations={expectations}
                  followUpQuestions={followUps}
                  whiteboardChain={OUTBOX_WHITEBOARD}
                />
              </ScrollReveal>
            </section>

            {/* ── 07 — Judgment Quiz ────────────────────────── */}
            {judgmentQuiz && (
              <section id="judgment-quiz" className="scroll-mt-16">
                <SectionHeader
                  number="07"
                  title="Test Your Judgment: Transactional Outbox"
                  id="judgment-quiz"
                />
                <ScrollReveal>
                  <JudgmentQuiz
                    title="Transactional Outbox Judgment Test"
                    questions={judgmentQuiz}
                  />
                </ScrollReveal>
              </section>
            )}

            {/* ── 08 — Related Architectures ────────────────── */}
            <section id="related" className="scroll-mt-16 pt-4">
              <SectionHeader
                number="08"
                title="Related System Architecture Deep Dives"
                id="related"
              />
              <RelatedTopics topics={relatedTopics} />
              <div className="mt-8">
                <ArticleNav currentId="transactional-outbox" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
