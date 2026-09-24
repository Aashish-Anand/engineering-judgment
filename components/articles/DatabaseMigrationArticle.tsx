import { Breadcrumb } from "@/components/Breadcrumb";
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
import { NaiveMigrationDiagram } from "@/components/diagrams/NaiveMigrationDiagram";
import { MigrationArchitectureDiagram } from "@/components/diagrams/MigrationArchitectureDiagram";
import { DualWriteDiagram } from "@/components/diagrams/DualWriteDiagram";
import { CutoverDiagram } from "@/components/diagrams/CutoverDiagram";

import * as article from "@/data/topics/safely-migrate-production-database";

export function DatabaseMigrationArticle() {
  const {
    meta,
    tocItems,
    scenarioMetrics,
    difficultyFactors,
    migrationPhases,
    dualWriteApproaches,
    keyTradeoffs,
    failureModes,
    tenXProblems,
    avoidList,
    interviewAnswer,
    levelExpectations,
    followUpQuestions,
    relatedTopics,
    migrationStrategies,
  } = article;

  return (
    <article className="pt-4 pb-16 px-6">
      <div className="wide-width mx-auto">
        {/* Breadcrumb — minimal vertical footprint */}
        <Breadcrumb
          items={[
            { label: "Problems", href: "/" },
            { label: "Data", href: "/#problems" },
            { label: "Database Migration" },
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
                  This isn&apos;t just a copy. It&apos;s a synchronization problem.
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
                    High Pressure
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#6B7280] font-medium">Daily Scale</span>
                    <span className="font-bold text-[#171717]">100M Reads · 10M Writes</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#6B7280] font-medium">Throughput</span>
                    <span className="font-semibold text-[#171717]">~1,160 RPS / 115 WPS</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#6B7280] font-medium">Target SLA</span>
                    <span className="font-semibold text-[#16A34A]">Zero Downtime</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#6B7280] font-medium">Primary Strategy</span>
                    <span className="font-semibold text-[#171717]">CDC + Shadow Dual-Write</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#6B7280] font-medium">Rollback SLA</span>
                    <span className="font-semibold text-[#171717]">&lt; 30s Reverse Replicate</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-dashed border-[#171717]/20 flex items-center gap-1.5 text-xs font-hand font-bold text-[#4B5563]">
                  <span>✏️ Notebook design walkthrough below</span>
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
              annotation="Scale: 100M reads / 10M writes"
            />
            <ProblemStatement>
              <p>
                We have a production database handling significant traffic. We need to migrate it to a new database — different technology, different infrastructure, or different schema — <strong>without taking the system offline</strong>.
              </p>
              <p className="font-hand text-lg text-[#171717] font-bold">
                &ldquo;This is not a copy problem. It is a live synchronization problem.&rdquo;
              </p>
            </ProblemStatement>
            <MetricTable rows={scenarioMetrics} />

            {/* ── 02 — The First Mistake ───────────────────────── */}
            <SectionHeader
              number="02"
              title="What's the obvious approach, and why does it fail?"
              id="the-mistake"
            />
            <p>
              The first instinct is often: <strong>dump the database and restore it on the target</strong>. It sounds straightforward — export everything, import it on the new system, switch over.
            </p>
            <div className="my-6">
              <NaiveMigrationDiagram />
            </div>
            <FailureCallout title="Wait... production writes are still happening.">
              This fails because production writes continue while the dump is happening. By the time the <TermTooltip termKey="snapshot">snapshot</TermTooltip> finishes, source and destination can diverge. Every write that arrived during the dump is missing from the target.
            </FailureCallout>

            {/* ── 03 — Why it's hard ───────────────────────────── */}
            <SectionHeader
              number="03"
              title="What actually makes migration difficult?"
              id="why-hard"
            />
            <p>
              The migration is not the copy. The difficult part is <strong>maintaining correctness while traffic keeps flowing</strong>. Each of these factors independently increases the risk of a bad migration:
            </p>
            <DecisionTable
              headers={["Problem", "Why it matters"]}
              rows={difficultyFactors}
            />

            {/* ── 04 — Mental Model ────────────────────────────── */}
            <SectionHeader
              number="04"
              title="How should we think about this?"
              id="mental-model"
            />
            <InsightCard title="The Mental Model">
              A production migration is a <strong>synchronization problem</strong> followed by a <strong>traffic-switching problem</strong>.
            </InsightCard>
            <p>
              First, get the target to a state where it has the same data as the source. Then, move traffic to the target without losing writes or serving stale reads. These are <strong>two distinct engineering challenges</strong> — conflating them is where most migration plans go wrong.
            </p>

            {/* ── 05 — Migration Shape ─────────────────────────── */}
            <SectionHeader
              number="05"
              title="What does the recommended architecture look like?"
              id="migration-shape"
              annotation="Keep both in sync!"
            />
            <p>
              The diagram below shows the high-level data flow. The application keeps writing to the source while a parallel pipeline synchronizes the target:
            </p>
            <div className="my-6">
              <MigrationArchitectureDiagram />
            </div>
            <p>
              The application writes to <code>DB A</code> (the primary). A <TermTooltip termKey="snapshot">snapshot</TermTooltip> seeds <code>DB B</code> with existing data. <TermTooltip termKey="CDC">CDC</TermTooltip> captures ongoing changes from <code>DB A</code> and applies them to <code>DB B</code>. Once caught up and validated, traffic gradually shifts to <code>DB B</code>.
            </p>

            <h3 className="font-hand text-2xl font-bold text-[#171717] mt-8 mb-2">
              What&apos;s the difference between these strategies?
            </h3>
            <p className="text-sm text-[#4B5563] mb-4">
              Each strategy addresses a different aspect of the migration. They&apos;re often used in combination — not as alternatives to each other.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {migrationStrategies.map((s) => (
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
            <SectionHeader number="06" title="What are the migration phases?" id="phases" />
            <p>
              A production migration is not a single action — it&apos;s a sequence of phases, each with its own success criteria and failure modes. Skipping a phase (or rushing through validation) is the most common source of production incidents during migrations.
            </p>
            <Timeline phases={migrationPhases} />

            <h3 className="font-hand text-2xl font-bold text-[#171717] mt-8 mb-3">
              How does the cutover work?
            </h3>
            <div className="my-6">
              <CutoverDiagram />
            </div>
            <p>
              Gradual cutover reduces blast radius. At each stage, you can observe metrics and roll back if something is wrong. The actual strategy depends on whether writes are going to one source or multiple destinations.
            </p>

            {/* ── 07 — Dual Write ──────────────────────────────── */}
            <SectionHeader
              number="07"
              title="Why are dual writes attractive — and dangerous?"
              id="dual-write"
              annotation="Distributed Tx Risk"
            />
            <p>
              The idea is simple: write to both databases from the application layer. If both succeed, they stay synchronized. The problem is <strong>when they don&apos;t</strong>.
            </p>
            <div className="my-6">
              <DualWriteDiagram />
            </div>
            <p>
              When one write succeeds and the other fails, the systems diverge. You now have an inconsistency that&apos;s difficult to detect and expensive to repair. This is fundamentally a <strong>distributed transaction problem</strong> — and most applications don&apos;t treat it that way.
            </p>
            <DecisionTable
              headers={["Approach", "Advantage", "Trade-off"]}
              rows={dualWriteApproaches}
            />

            {/* ── 08 — Trade-offs ──────────────────────────────── */}
            <SectionHeader
              number="08"
              title="What are the key trade-offs?"
              id="trade-offs"
            />
            <p>
              Every migration decision involves giving something up. This table is the core of the decision-making process — understanding these trade-offs is what separates a migration plan from a migration disaster.
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
              Migration failures rarely come from the migration itself — they come from <strong>not detecting problems early enough</strong>. Each failure mode below includes how to detect it and how to respond:
            </p>
            <DecisionTable
              headers={["Failure", "Detection", "Response"]}
              rows={failureModes}
            />

            {/* ── 10 — What happens at 10× & What Breaks Next? ──── */}
            <SectionHeader
              number="10"
              title="What happens if the workload becomes 10× larger?"
              id="ten-x"
            />
            <p>
              A migration architecture that works at 10M writes/day may not remain operationally comfortable at 100M writes/day.
            </p>
            <InsightCard title="10× Scale Trap">
              At 10× scale, the architecture is the same — but the operational constraints are tighter, the failure blast radius is larger, and the coordination cost is higher.
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
            <WhatBreaksNext
              solved="DB migration cutover completed with zero downtime"
              nextIssue="CDC Stream Lag & Target IOPS Saturation"
              steps={[
                "WAL Stream Spike",
                "Kafka Connect Buffer Lag",
                "Target IOPS Throttled",
                "Replication Divergence Window",
              ]}
              explanation="At 10× scale (100M writes/day), the CDC consumer cannot ingest bulk writes as quickly as the primary WAL generates them. If write bursts exceed target disk IOPS, replication lag expands from seconds to hours, making rollback hazardous."
            />

            {/* ── 11 — What to avoid ───────────────────────────── */}
            <SectionHeader number="11" title="What would I avoid?" id="avoid" />
            <div className="my-4 p-5 bg-[#FDE8E8] border-[1.5px] border-[#DC2626] rounded-xl shadow-[2px_2px_0px_#DC2626]">
              <p className="font-hand font-bold text-xl text-[#DC2626] mb-3 flex items-center gap-2">
                <span>⚠️ Avoid unless explicitly justified:</span>
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
            <p className="text-sm text-[#6B7280] italic">
              These aren&apos;t rules — they&apos;re patterns that tend to cause problems unless you have a specific reason and a plan for the risks they introduce.
            </p>

            {/* ── 12 — Interview Answer ────────────────────────── */}
            <SectionHeader
              number="12"
              title="How would I explain this in an interview?"
              id="interview"
              annotation="Interviewer's Notebook"
            />
            <p>
              A strong interview answer follows a clear reasoning structure: frame the constraint, propose the approach, explain validations, describe the cutover, and acknowledge the trade-off.
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

            {/* Reasoning chain in pastel pills */}
            <div className="p-4 bg-[#FAF9F5] border-[1.5px] border-[#171717] rounded-xl my-4 shadow-xs">
              <span className="font-hand font-bold text-base text-[#171717] block mb-2">
                Whiteboard Reasoning Chain:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "Problem", bg: "bg-[#F9DDE5]" },
                  { label: "Constraints", bg: "bg-[#FFF0B8]" },
                  { label: "Strategy", bg: "bg-[#DCEBFF]" },
                  { label: "Why", bg: "bg-white" },
                  { label: "Trade-off", bg: "bg-[#E7E1F8]" },
                  { label: "Rollback", bg: "bg-[#DFF3DF]" },
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
              Different engineering levels are expected to demonstrate different depths of understanding. A mid-level engineer should explain the mechanics; a staff engineer should reason about organizational blast radius and operational ownership.
            </p>
            <LevelExpectation levels={levelExpectations} />

            {/* ── 14 — Interviewer Follow-ups ──────────────────── */}
            <SectionHeader
              number="14"
              title="What follow-up questions should I expect?"
              id="follow-ups"
            />
            <p>
              Interviewers use follow-up questions to test depth. Each question below probes a specific edge case or trade-off in the migration design.
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

            {/* ── 15 — Related Problems ────────────────────────── */}
            <SectionHeader
              number="15"
              title="What should I understand next?"
              id="related"
            />
            <p>
              Database migration connects to many adjacent problems. Understanding these will deepen your reasoning about the decisions above.
            </p>
            <RelatedTopics topics={relatedTopics} />
          </div>
        </div>
      </div>
    </article>
  );
}
