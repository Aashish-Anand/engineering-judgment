import { Breadcrumb } from "@/components/Breadcrumb";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ArticleNav } from "@/components/ArticleNav";
import { CodeBlock } from "@/components/CodeBlock";
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
import { FailureCallout } from "@/components/doodle/FailureCallout";
import { NaiveFlashSaleDiagram } from "@/components/diagrams/NaiveFlashSaleDiagram";
import { FlashSaleArchitectureDiagram } from "@/components/diagrams/FlashSaleArchitectureDiagram";
import { InventoryRaceDiagram } from "@/components/diagrams/InventoryRaceDiagram";
import { ReservationFlowDiagram } from "@/components/diagrams/ReservationFlowDiagram";
import { FlashSaleLab } from "@/components/FlashSaleLab";
import { TradeoffDiagnosticsHub } from "@/components/TradeoffDiagnosticsHub";
import { CareerRubricHub } from "@/components/CareerRubricHub";

import * as article from "@/data/topics/survive-flash-sale";

const FLASH_SALE_TRAPS = [
  {
    trapNum: "TRAP 01",
    question: "Why not rely on Kubernetes Horizontal Pod Autoscaler (HPA)?",
    explanation:
      "Kubernetes HPA takes 45–90 seconds to observe metrics and spin up new pod containers. The 10,000 iPhones sell out in 3 seconds. The spike is completely over before the first new pod reaches ready status.",
  },
  {
    trapNum: "TRAP 02",
    question: "Why not process payments before deducting stock?",
    explanation:
      "External payment gateways (Stripe, Adyen) take 1,500–3,000ms per transaction. Bombarding them with 2,000,000 concurrent API calls triggers rate limits and causes thousands of cards to be billed for items that just sold out.",
  },
  {
    trapNum: "TRAP 03",
    question: "Why not let stock go negative and cancel excess orders?",
    explanation:
      "Selling 10,500 items when you only have 10,000 units requires canceling 500 orders post-sale. This creates credit card chargeback penalties, PR outrage, and legal liabilities. Zero overselling must be an inviolable invariant.",
  },
];

const FLASH_SALE_WHITEBOARD = [
  { label: "1. Funnel Edge", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { label: "2. Queue Token", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { label: "3. Redis Lua", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "4. Kafka Buffer", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "5. DB Settlement", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { label: "6. Reconciliation", color: "bg-purple-50 text-purple-700 border-purple-200" },
];

export function FlashSaleArticle() {
  const {
    meta,
    tocItems,
    scenarioMetrics,
    inventoryApproaches,
    keyTradeoffs,
    failureModes,
    tenXProblems,
    avoidList,
    interviewAnswer,
    levelExpectations,
    followUpQuestions,
    relatedTopics,
    saleStrategies,
  } = article;

  return (
    <article className="pt-4 pb-16 px-4 sm:px-6">
      <div className="wide-width mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Problems", href: "/" },
            { label: "Traffic", href: "/#problems" },
            { label: "Flash Sale" },
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
                    Extreme Traffic Surge
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Event Scale</span>
                    <span className="font-bold text-slate-900">10M Users · 10K Units</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Peak Burst</span>
                    <span className="font-semibold text-slate-900">~2,000,000 RPS (0–5s)</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Target Invariant</span>
                    <span className="font-semibold text-emerald-600">Zero Overselling</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Primary Strategy</span>
                    <span className="font-semibold text-slate-800">Virtual Queue + Redis Lua</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">Admission Rate</span>
                    <span className="font-semibold text-blue-600">10,000 req / sec Drip</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 30-Second Executive Blueprint */}
        <ExecutiveBlueprint
          timeToRead="30-Second Architecture Blueprint"
          bottleneck="10M concurrent users hit a single inventory counter at 12:00:00 PM (~2M RPS). Relational row locks serialize, starving database connection pools in 5ms."
          solution="Multi-Tier Admission Funnel: Edge Virtual Waiting Room sheds 99.5% ➔ In-memory atomic Redis Lua script reserves stock with 10m TTL ➔ Kafka buffers DB settlement."
          goldenRule="Never allow incoming traffic to touch relational storage during the sale; decouple in-memory reservation from asynchronous payment settlement."
          keyMetrics={[
            { label: "Available Stock", value: "Strictly 10,000 units (0 overselling)" },
            { label: "Edge Admission Drip", value: "10,000 req/s to backend" },
            { label: "Reservation TTL", value: "10 minutes auto-restock" },
          ]}
        />

        {/* Main Content Layout with Sticky TOC */}
        <div className="flex gap-10 items-start">
          {/* Sticky TOC */}
          <TableOfContents items={tocItems} />

          {/* Article Main Column */}
          <div className="flex-1 min-w-0 prose-width space-y-10">
            {/* ── 01 — Problem & Live Simulator ─────────────── */}
            <section id="the-problem" className="scroll-mt-16">
              <SectionHeader
                number="01"
                title="The Production Constraint & Workload Scale"
                id="the-problem"
                annotation="10M Users / 10K Items"
              />
              <ProblemStatement>
                <p>
                  An e-commerce retailer is launching a high-profile flash sale: <strong>10,000 discounted iPhone units</strong> made available to a waiting audience of <strong>10 million users</strong> at exactly 12:00:00 PM.
                </p>
                <p className="font-sans text-base text-slate-900 font-semibold mb-0">
                  &ldquo;When 10 million concurrent buyers hit one row, the database isn&apos;t slow — it&apos;s mathematically serialized.&rdquo;
                </p>
              </ProblemStatement>

              <div className="my-5">
                <MetricTable
                  rows={scenarioMetrics}
                  sideNote="10,000 items sold in under 3 seconds. The challenge is 9.99M rejections without taking down the infrastructure."
                />
              </div>

              {/* Interactive Simulator */}
              <FlashSaleLab />
            </section>

            {/* ── 02 — The Naive Row-Lock Trap ──────────────── */}
            <section id="the-mistake" className="scroll-mt-16">
              <SectionHeader
                number="02"
                title="The Obvious Mistake: Relational Row Locking"
                id="the-mistake"
              />
              <p className="text-slate-700 leading-relaxed">
                The most intuitive approach is writing directly to the relational database with an ACID transaction and row-level locking:
              </p>
              <CodeBlock
                language="sql"
                filename="naive-transaction.sql"
                code={`BEGIN TRANSACTION;
SELECT stock FROM items WHERE id = ? FOR UPDATE;
-- if stock > 0:
UPDATE items SET stock = stock - 1 WHERE id = ?;
INSERT INTO orders (user_id, item_id) VALUES (?, ?);
COMMIT;`}
              />

              <div className="my-6">
                <ScrollReveal>
                  <NaiveFlashSaleDiagram />
                </ScrollReveal>
              </div>

              <FailureCallout title="Wait... lock contention and connection pool exhaustion occur in milliseconds!">
                Under 2,000,000 incoming requests per second, every single database connection attempts to acquire an exclusive lock on the exact same row. Database connection pools (typically 50–200 connections) are saturated within 5 milliseconds, causing cascading 504 timeouts across every other service sharing the database.
              </FailureCallout>

              <InlineCheck
                question="Architectural Gut Check · The Read Replica Illusion: Why can't we just scale read replicas to absorb the 2,000,000 RPS surge during the flash sale launch?"
                options={[
                  {
                    label: "Read replicas solve it, provided you balance incoming requests with round-robin DNS.",
                    isCorrect: false,
                    explanation: "Purchasing is fundamentally a WRITE operation! Every buy attempt decrements a shared inventory counter. Read replicas cannot process writes; all 2,000,000 RPS funnel straight to the single primary database writer.",
                  },
                  {
                    label: "Replicas only scale reads; purchasing is write contention on a single shared row.",
                    isCorrect: true,
                    explanation: "Spot on! Ten million buyers are competing to update the exact same row. Read replicas do nothing for write locks. The primary database connection pool exhausts in 5 milliseconds, causing cascading 504 gateway timeouts.",
                  },
                  {
                    label: "Read replicas cannot execute ACID transactions in PostgreSQL.",
                    isCorrect: false,
                    explanation: "Replicas can execute read-only transactions, but they are prohibited from executing row updates.",
                  },
                ]}
              />
            </section>

            {/* ── 03 — Core Mental Model ────────────────────── */}
            <section id="mental-model" className="scroll-mt-16">
              <SectionHeader
                number="03"
                title="The Core Mental Model: Admission First, Settle Later"
                id="mental-model"
              />
              <ScrollReveal>
                <InsightCard title="The Architectural Invariant">
                  A flash sale is an <strong>admission control problem</strong> followed by a <strong>reservation reconciliation problem</strong>.
                </InsightCard>
              </ScrollReveal>
              <p className="text-slate-700 leading-relaxed">
                Do not let 10 million buyers touch your transaction layer. First, shed 99.5% of traffic at the edge and queue layers using cryptographically signed admission tokens. Second, serialize the final 10,000 item allocations in memory using an atomic Lua script in Redis. Third, confirm orders asynchronously via decoupled Kafka queues.
              </p>
            </section>

            {/* ── 04 — Funnel Pipeline & Lua Gate ───────────── */}
            <section id="architecture" className="scroll-mt-16">
              <SectionHeader
                number="04"
                title="Funnel Architecture & Atomic Lua Reservation"
                id="architecture"
                annotation="Zero Overselling Pipeline"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                The diagram below illustrates the progressive filtering funnel. Each layer sheds an order of magnitude of pressure before requests ever touch relational storage:
              </p>

              <div className="my-6">
                <ScrollReveal>
                  <FlashSaleArchitectureDiagram />
                </ScrollReveal>
              </div>

              {/* 4 Clean Strategy Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                {saleStrategies.map((s) => (
                  <div
                    key={s.name}
                    className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <h4 className="font-sans text-sm sm:text-base font-bold text-slate-900 m-0">
                        {s.name}
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-0 font-sans">
                      {s.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* 10-Minute Hold Lifecycle */}
              <div className="my-6">
                <ScrollReveal>
                  <ReservationFlowDiagram />
                </ScrollReveal>
              </div>

              {/* Concurrency Interleaving & Lua Solution */}
              <div className="my-6">
                <ScrollReveal>
                  <InventoryRaceDiagram />
                </ScrollReveal>
              </div>

              <CodeBlock
                language="lua"
                filename="redis-atomic-gate.lua"
                code={`-- KEYS[1]: 'stock:iphone_16'
-- KEYS[2]: 'reservation:user:' .. user_id
-- ARGV[1]: user_id
-- ARGV[2]: ttl_seconds (600 = 10 minutes)

-- 1. Idempotency: Prevent the same user from clicking Buy twice
if redis.call('exists', KEYS[2]) == 1 then
    return 2 -- Already reserved
end

-- 2. Atomically verify and decrement available stock
local current_stock = tonumber(redis.call('get', KEYS[1]))
if current_stock and current_stock > 0 then
    redis.call('decr', KEYS[1])
    redis.call('set', KEYS[2], 'HELD', 'EX', ARGV[2])
    return 1 -- Success: 1 unit held
else
    return 0 -- Sold out: shed request immediately
end`}
              />

              <InlineCheck
                question="Architectural Gut Check · The Redis Failover Trap: Redis handles the 10,000 decrements in memory. If your Redis Primary crashes and Sentinel promotes a replica, what risk emerges?"
                options={[
                  {
                    label: "No risk — Redis replication is synchronous and guarantees zero data loss.",
                    isCorrect: false,
                    explanation: "Standard Redis replication is asynchronous for maximum write speed. If the primary crashes before in-flight replication packets reach the replica, the promoted replica will still show available stock, leading to duplicate allocations and overselling.",
                  },
                  {
                    label: "Asynchronous replication lag between master and replica can resurrect sold stock, causing overselling.",
                    isCorrect: true,
                    explanation: "Spot on! If the primary decrements from 1 to 0 and crashes before replicating to the standby, the replica is promoted with stock = 1. A new buyer claims that unit, resulting in 10,001 sold units. Real production systems maintain a safety buffer (e.g. allocate only 9,800 units) or use Redis WAIT.",
                  },
                  {
                    label: "Redis Sentinel locks all client connections until the primary reboots.",
                    isCorrect: false,
                    explanation: "Sentinel promotes the replica to become the new primary immediately, without waiting for the crashed node to reboot.",
                  },
                ]}
              />
            </section>

            {/* ── 05 — Trade-offs, Runbook & Traps Hub ──────── */}
            <section id="tradeoffs-hub" className="scroll-mt-16">
              <SectionHeader
                number="05"
                title="Trade-offs, Incident Runbook & Production Traps"
                id="tradeoffs-hub"
                annotation="Decision Matrix"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                Compare concurrency primitives, study the top failure modes under load, and review the anti-patterns that take down high-volume events:
              </p>

              <ScrollReveal>
                <TradeoffDiagnosticsHub
                  approachesTitle="1. Inventory Concurrency Approches"
                  approachesHeaders={["Approach", "Advantage", "Trade-off / Risk"]}
                  approachesRows={inventoryApproaches}
                  keyTradeoffsTitle="2. Key Architectural Trade-offs"
                  keyTradeoffsHeaders={["Decision", "Benefit", "Cost / Risk"]}
                  keyTradeoffsRows={keyTradeoffs}
                  failureModesTitle="Flash Sale Failure Modes & Operational Responses"
                  failureModesHeaders={["Failure Mode", "Detection Signal", "Mitigation & Response"]}
                  failureModesRows={failureModes}
                  trapsTitle="The 3 Classic Flash Sale Traps"
                  traps={FLASH_SALE_TRAPS}
                  tenXTitle="What Happens at 10× Scale (100M Users / 100K Units)?"
                  tenXProblems={tenXProblems}
                  avoidTitle="⚠️ Anti-patterns that guarantee production outages:"
                  avoidList={avoidList}
                />
              </ScrollReveal>
            </section>

            {/* ── 06 — Staff+ Interview & Career Rubric ─────── */}
            <section id="career-rubric" className="scroll-mt-16">
              <SectionHeader
                number="06"
                title="Engineering Level Rubric & Interview Synthesis"
                id="career-rubric"
                annotation="L4 to Staff Evaluation"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                How interviewers evaluate high-traffic system design across engineering levels, complete with verbal synthesis and follow-up probing questions:
              </p>

              <ScrollReveal>
                <CareerRubricHub
                  interviewAnswer={interviewAnswer}
                  levelExpectations={levelExpectations}
                  followUpQuestions={followUpQuestions}
                  whiteboardChain={FLASH_SALE_WHITEBOARD}
                />
              </ScrollReveal>
            </section>

            {/* ── 07 — Judgment Quiz ───────────────────────── */}
            {article.judgmentQuiz && (
              <section id="judgment-quiz" className="scroll-mt-16">
                <SectionHeader
                  number="07"
                  title="Test Your Judgment: The 10M-User Flash Sale"
                  id="judgment-quiz"
                />
                <ScrollReveal>
                  <JudgmentQuiz
                    title="Flash Sale Concurrency Judgment Test"
                    questions={article.judgmentQuiz}
                  />
                </ScrollReveal>
              </section>
            )}

            {/* ── 08 — Related Architectures ───────────────── */}
            <section id="related" className="scroll-mt-16 pt-4">
              <SectionHeader
                number="08"
                title="Related System Architecture Deep Dives"
                id="related"
              />
              <RelatedTopics topics={relatedTopics} />
              <div className="mt-8">
                <ArticleNav currentId="flash-sale" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
