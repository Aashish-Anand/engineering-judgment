import { Breadcrumb } from "@/components/Breadcrumb";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ArticleNav } from "@/components/ArticleNav";
import { CodeBlock } from "@/components/CodeBlock";
import { JudgmentQuiz } from "@/components/JudgmentQuiz";
import { CategoryBadge } from "@/components/CategoryBadge";
import { SectionHeader } from "@/components/SectionHeader";
import { MetricTable } from "@/components/MetricTable";
import { DecisionTable } from "@/components/DecisionTable";
import { InsightCard } from "@/components/InsightCard";
import { ProblemStatement } from "@/components/ProblemStatement";
import { Timeline } from "@/components/Timeline";
import { LevelExpectation } from "@/components/LevelExpectation";
import { RelatedTopics } from "@/components/RelatedTopics";
import { TableOfContents } from "@/components/TableOfContents";
import { ExpandableQuestion } from "@/components/ExpandableQuestion";
import { TermTooltip } from "@/components/TermTooltip";
import { DoodleArrow } from "@/components/doodle/DoodleArrow";
import { FailureCallout } from "@/components/doodle/FailureCallout";
import { WhatBreaksNext } from "@/components/doodle/WhatBreaksNext";
import { NaiveFlashSaleDiagram } from "@/components/diagrams/NaiveFlashSaleDiagram";
import { FlashSaleArchitectureDiagram } from "@/components/diagrams/FlashSaleArchitectureDiagram";
import { InventoryRaceDiagram } from "@/components/diagrams/InventoryRaceDiagram";
import { ReservationFlowDiagram } from "@/components/diagrams/ReservationFlowDiagram";

import * as article from "@/data/topics/survive-flash-sale";

export function FlashSaleArticle() {
  const {
    meta,
    tocItems,
    scenarioMetrics,
    difficultyFactors,
    flashSalePhases,
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
    <article className="pt-4 pb-16 px-6">
      <div className="wide-width mx-auto">
        {/* Breadcrumb — minimal vertical footprint */}
        <Breadcrumb
          items={[
            { label: "Problems", href: "/" },
            { label: "Traffic", href: "/#problems" },
            { label: "Flash Sale" },
          ]}
        />

        {/* Article header — 2-column notebook layout */}
        <header className="mb-10 pb-8 border-b-[1.5px] border-[#171717]/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side: Metadata, Title, Subtitle, Tags, Annotation */}
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <CategoryBadge category={meta.category} size="md" />
                <span className="font-hand font-bold text-sm px-2.5 py-0.5 bg-[#FFF0B8] border border-[#171717] rounded shadow-xs">
                  {meta.difficulty}
                </span>
                <span className="text-xs text-[#9CA3AF]">·</span>
                <span className="font-hand font-bold text-sm text-[#4B5563]">
                  ⏱️ {meta.readingTime}
                </span>
              </div>

              <h1 className="font-hand text-2xl sm:text-3xl lg:text-[2.35rem] font-bold text-[#171717] leading-[1.2] tracking-tight mb-3">
                {meta.title}
              </h1>

              <p className="font-sans text-base sm:text-lg text-[#374151] leading-relaxed mb-4">
                &ldquo;{meta.subtitle}&rdquo;
              </p>

              {/* Side / Subtitle Hand-drawn annotation */}
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-[#FFF0B8] border border-[#171717] rounded-lg shadow-xs transform -rotate-1">
                <span className="font-hand font-bold text-sm sm:text-base text-[#171717]">
                  This isn&apos;t an inventory decrement. It&apos;s an admission control &amp; reservation problem.
                </span>
                <DoodleArrow direction="curved-down-right" width={22} height={16} />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-hand text-xs sm:text-sm font-bold px-2 py-0.5 bg-white rounded border border-[#171717] text-[#171717] shadow-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right side: Architecture Context Notebook Card */}
            <div className="lg:col-span-4">
              <div className="bg-white border-[1.5px] border-[#171717] rounded-xl p-5 shadow-[2px_3px_0px_#171717]">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#171717]/20">
                  <span className="font-hand font-bold text-base text-[#171717] uppercase tracking-wider">
                    Architecture Context
                  </span>
                  <span className="font-hand font-bold text-xs px-2 py-0.5 bg-[#FDE8E8] text-[#DC2626] border border-[#DC2626] rounded shadow-2xs">
                    Extreme Traffic
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#6B7280] font-medium">Event Scale</span>
                    <span className="font-bold text-[#171717]">10M Users · 10K iPhones</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#6B7280] font-medium">Peak Throughput</span>
                    <span className="font-semibold text-[#171717]">~2,000,000 RPS (0–5s)</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#6B7280] font-medium">Target SLA</span>
                    <span className="font-semibold text-[#16A34A]">Zero Overselling</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#6B7280] font-medium">Primary Strategy</span>
                    <span className="font-semibold text-[#171717]">Virtual Queue + Redis Lua</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#6B7280] font-medium">Admission Drip</span>
                    <span className="font-semibold text-[#171717]">10,000 users / sec</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-dashed border-[#171717]/20 flex items-center gap-1.5 text-xs font-hand font-bold text-[#4B5563]">
                  <span>✏️ Interactive flash sale walkthrough below</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area with sticky TOC */}
        <div className="flex gap-10">
          {/* Sticky TOC - desktop only */}
          <TableOfContents items={tocItems} />

          {/* Article body */}
          <div className="flex-1 min-w-0 prose-width">
            {/* ── 01 — The Problem ─────────────────────────────── */}
            <SectionHeader
              number="01"
              title="What are we trying to do?"
              id="the-problem"
              annotation="Scale: 10M users / 10K items"
            />
            <ProblemStatement>
              <p>
                An e-commerce retailer is launching a high-profile flash sale: <strong>10,000 discounted iPhone units</strong> made available to a waiting audience of <strong>10 million users</strong> at exactly 12:00:00 PM.
              </p>
              <p>
                The business requirement is non-negotiable: <strong>zero overselling</strong>. Selling 10,001 units creates legal and reputation liabilities. The site must remain responsive — crashing under connection exhaustion is as bad as overselling.
              </p>
              <p className="font-hand text-lg text-[#171717] font-bold">
                &ldquo;When 10 million concurrent buyers hit one row, the database isn&apos;t slow — it&apos;s mathematically serialized.&rdquo;
              </p>
            </ProblemStatement>
            <MetricTable rows={scenarioMetrics} sideNote="10,000 items sold in under 3 seconds. The challenge is 9.99M rejections without taking down the infrastructure." />

            {/* ── 02 — The First Mistake ───────────────────────── */}
            <SectionHeader
              number="02"
              title="What's the obvious approach, and why does it fail?"
              id="the-mistake"
            />
            <p>
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
              <ScrollReveal><NaiveFlashSaleDiagram /></ScrollReveal>
            </div>
            <FailureCallout title="Wait... lock contention and connection pool exhaustion occur in milliseconds!">
              Under 2,000,000 incoming requests per second, every single database connection attempts to acquire an exclusive lock on the exact same row. Database connection pools (typically 50–200 connections) are saturated within 5 milliseconds, causing cascading 504 timeouts across every other service sharing the database.
            </FailureCallout>

            {/* ── 03 — Why it's hard ───────────────────────────── */}
            <SectionHeader
              number="03"
              title="What actually makes a flash sale difficult?"
              id="why-hard"
            />
            <p>
              The technical difficulty of a flash sale is not handling high throughput in general — it is handling <strong>extreme write contention on a single shared counter</strong> while preventing duplicate claims:
            </p>
            <DecisionTable
              headers={["Bottleneck", "Production Consequence"]}
              rows={difficultyFactors}
            />

            {/* ── 04 — Mental Model ────────────────────────────── */}
            <SectionHeader
              number="04"
              title="How should we think about this?"
              id="mental-model"
            />
            <ScrollReveal><InsightCard title="The Mental Model">
              A flash sale is an <strong>admission control problem</strong> followed by a <strong>reservation reconciliation problem</strong>.
            </InsightCard></ScrollReveal>
            <p>
              Do not let 10 million buyers touch your transaction layer. First, shed 99.9% of traffic at the edge and queue layers using cryptographically signed admissions. Second, serialize the final 10,000 item allocations in memory using an atomic Lua script in Redis. Third, confirm orders asynchronously via decoupled queues.
            </p>

            {/* ── 05 — Flash Sale Funnel Architecture ──────────── */}
            <SectionHeader
              number="05"
              title="What does the recommended architecture look like?"
              id="architecture"
              annotation="Traffic Funnel Filter"
            />
            <p>
              The diagram below illustrates the progressive filtering funnel. Each layer sheds an order of magnitude of pressure before requests ever touch relational storage:
            </p>
            <div className="my-6">
              <ScrollReveal><FlashSaleArchitectureDiagram /></ScrollReveal>
            </div>
            <p>
              Traffic is funneled through 5 distinct protection barriers: Edge WAF, Virtual Waiting Room, In-memory Lua stock reservation, Kafka ordering buffer, and batched background Postgres settlement.
            </p>

            <h3 className="font-hand text-2xl font-bold text-[#171717] mt-8 mb-2">
              Key Architectural Strategies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              {saleStrategies.map((s) => (
                <div
                  key={s.name}
                  className="p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_2px_0px_#171717] hover:shadow-[3px_3px_0px_#171717] transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#171717] shrink-0" />
                    <h4 className="font-hand text-xl font-bold text-[#171717]">{s.name}</h4>
                  </div>
                  <p className="text-sm text-[#374151] leading-relaxed mb-0 font-sans">{s.description}</p>
                </div>
              ))}
            </div>

            {/* ── 06 — Phases ──────────────────────────────────── */}
            <SectionHeader number="06" title="What are the flash sale phases?" id="phases" />
            <p>
              A flash sale execution spans multiple hours before and after the 30-second buying window:
            </p>
            <ScrollReveal><Timeline phases={flashSalePhases} /></ScrollReveal>

            <h3 className="font-hand text-2xl font-bold text-[#171717] mt-8 mb-3">
              How does the 10-Minute Reservation Lifecycle work?
            </h3>
            <div className="my-6">
              <ScrollReveal><ReservationFlowDiagram /></ScrollReveal>
            </div>
            <p>
              When a user successfully decrements the Redis counter, their stock is <strong>temporarily reserved with a 10-minute TTL</strong>. If the user completes payment within 10 minutes, the order is permanently confirmed. If the user abandons or payment fails, background reconciliation restores the item to the stock pool.
            </p>

            {/* ── 07 — Inventory Approaches & Race Conditions ───── */}
            <SectionHeader
              number="07"
              title="How do you guarantee zero overselling under concurrency?"
              id="inventory"
              annotation="Atomic Lua Guarantee"
            />
            <p>
              When multiple requests arrive concurrently, thread interleaving in naive implementations creates race conditions that result in negative stock. The comparison below illustrates why atomic Redis Lua script execution is mandatory:
            </p>
            <div className="my-6">
              <ScrollReveal><InventoryRaceDiagram /></ScrollReveal>
            </div>
            <DecisionTable
              headers={["Approach", "Advantage", "Trade-off / Risk"]}
              rows={inventoryApproaches}
            />

            {/* ── 08 — Trade-offs ──────────────────────────────── */}
            <SectionHeader
              number="08"
              title="What are the key trade-offs?"
              id="trade-offs"
            />
            <p>
              Every engineering decision in high-traffic architecture trades one guarantee for another. Understanding what you give up is what defines senior judgment:
            </p>
            <DecisionTable
              headers={["Decision", "Benefit", "Cost / Risk"]}
              rows={keyTradeoffs}
            />

            {/* ── 09 — Failure Modes ───────────────────────────── */}
            <SectionHeader
              number="09"
              title="What can go wrong?"
              id="failure-modes"
              annotation="Production Traps"
            />
            <p>
              Flash sale outages typically arise from unmonitored queues, memory eviction policies, or edge bypasses:
            </p>
            <DecisionTable
              headers={["Failure Mode", "Detection Signal", "Mitigation & Response"]}
              rows={failureModes}
            />

            {/* ── 10 — What happens at 10× & What Breaks Next? ──── */}
            <SectionHeader
              number="10"
              title="What happens if the scale becomes 10× larger (100M users)?"
              id="ten-x"
            />
            <p>
              At 100M users and 100,000 units, even a single Redis cluster primary faces physical network NIC saturation:
            </p>
            <InsightCard title="10× Scale Trap">
              At 100M global users, single-instance in-memory counters saturate their network interfaces (~200K packets/sec). You must shard inventory or partition tokens across edge clusters.
            </InsightCard>
            <ul className="space-y-2 my-4">
              {tenXProblems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-[#374151]">
                  <span className="font-hand text-lg text-[#171717] shrink-0 select-none">▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Signature Recurring What Breaks Next Element */}
            <ScrollReveal><WhatBreaksNext
              solved="Zero overselling achieved via single-cluster Redis Lua & Kafka"
              nextIssue="Multi-Region Split-Brain & Global Inventory Partitioning"
              steps={[
                "100M Global Users Across 3 Continents",
                "Cross-Region WAN Replication Latency (>120ms)",
                "Local Edge Stock Partition Desynchronization",
                "Stranded Unsold Units in Secondary Regions",
              ]}
              explanation="Partitioning 10,000 units across US, EU, and APAC (e.g. 5K/3K/2K) solves the single Redis NIC limit, but causes units to sit unsold in one region while another region sells out in 200ms. Dynamic cross-region stock stealing introduces distributed locking latency."
            /></ScrollReveal>

            {/* ── 11 — What to avoid ───────────────────────────── */}
            <SectionHeader number="11" title="What would I avoid?" id="avoid" />
            <div className="my-4 p-5 bg-[#FDE8E8] border-[1.5px] border-[#DC2626] rounded-xl shadow-[2px_2px_0px_#DC2626]">
              <p className="font-hand font-bold text-xl text-[#DC2626] mb-3 flex items-center gap-2">
                <span>⚠️ Anti-patterns that guarantee production outages:</span>
              </p>
              <ul className="space-y-2">
                {avoidList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#171717]">
                    <span className="text-[#DC2626] font-bold mt-0.5 shrink-0 select-none">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── 12 — Interview Answer ────────────────────────── */}
            <SectionHeader
              number="12"
              title="How would I explain this in an interview?"
              id="interview"
              annotation="Interviewer's Notebook"
            />
            <p>
              A staff-level interview response structures the problem as an admission filter before discussing storage primitives:
            </p>
            <div className="my-4 p-5 sm:p-6 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_3px_0px_#171717]">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#171717]/15">
                <span className="font-hand font-bold text-base text-[#171717]">
                  🎙️ Candidate 30–60 Second Synthesis:
                </span>
              </div>
              <div className="text-[0.92rem] text-[#374151] leading-relaxed whitespace-pre-line font-sans">
                {interviewAnswer}
              </div>
            </div>

            {/* Whiteboard reasoning chain */}
            <div className="p-4 bg-[#FAF9F5] border-[1.5px] border-[#171717] rounded-xl my-4 shadow-xs">
              <span className="font-hand font-bold text-base text-[#171717] block mb-2">
                Whiteboard Reasoning Chain:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "1. Funnel Edge", bg: "bg-[#F9DDE5]" },
                  { label: "2. Queue Token", bg: "bg-[#FFF0B8]" },
                  { label: "3. Redis Lua", bg: "bg-[#DFF3DF]" },
                  { label: "4. Kafka Buffer", bg: "bg-[#E7E1F8]" },
                  { label: "5. DB Settlement", bg: "bg-white" },
                  { label: "6. Reconciliation", bg: "bg-[#DCEBFF]" },
                ].map((step, idx, arr) => (
                  <span key={step.label} className="inline-flex items-center gap-1.5">
                    <span className={`font-hand font-bold text-sm px-2.5 py-0.5 rounded border border-[#171717] shadow-2xs ${step.bg}`}>
                      {step.label}
                    </span>
                    {idx < arr.length - 1 && (
                      <span className="text-[#171717]/50 select-none">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* ── 13 — Level Expectations ──────────────────────── */}
            <SectionHeader
              number="13"
              title="What is the interviewer testing at each level?"
              id="expectations"
            />
            <p>
              Different levels are evaluated on whether they treat this as a caching problem or an organizational traffic defense system:
            </p>
            <LevelExpectation levels={levelExpectations} />

            {/* ── 14 — Interviewer Follow-ups ──────────────────── */}
            <SectionHeader
              number="14"
              title="What follow-up questions should I expect?"
              id="follow-ups"
            />
            <p>
              Interviewers use these follow-ups to test if you understand edge cases like payment webhook delays and Lua script deadlocks:
            </p>
            <div className="my-4 bg-white border-[1.5px] border-[#171717] rounded-xl px-5 shadow-[2px_3px_0px_#171717]">
              {followUpQuestions.map((qa) => (
                <ExpandableQuestion
                  key={qa.question}
                  question={qa.question}
                  answer={qa.answer}
                />
              ))}
            </div>

            {article.judgmentQuiz && (
              <ScrollReveal>
                <JudgmentQuiz
                  title="Test Your Judgment: The 10M-User Flash Sale"
                  questions={article.judgmentQuiz}
                />
              </ScrollReveal>
            )}

            {/* ── 15 — Related Problems ────────────────────────── */}
            <SectionHeader
              number="15"
              title="What should I understand next?"
              id="related"
            />
            <p>
              High-concurrency flash sales connect closely to idempotency, distributed <TermTooltip termKey="rate limiting">rate limiting</TermTooltip>, and backpressure:
            </p>
            <RelatedTopics topics={relatedTopics} />
            <ArticleNav currentId="flash-sale" />
          </div>
        </div>
      </div>
    </article>
  );
}
