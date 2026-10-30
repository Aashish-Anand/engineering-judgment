import { BlueprintArticleFrame, BlueprintPanel } from "./BlueprintArticleFrame";
import neo from "@/components/Neo.module.css";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ExecutiveBlueprint } from "@/components/ExecutiveBlueprint";
import { InlineCheck } from "@/components/InlineCheck";
import { SectionHeader } from "@/components/SectionHeader";
import { MetricTable } from "@/components/MetricTable";
import { InsightCard } from "@/components/InsightCard";
import { ProblemStatement } from "@/components/ProblemStatement";
import { OutboxDiagram, OutboxRelayFlow } from "@/components/diagrams/OutboxDiagram";
import {
  OutboxRowLifecycle,
  DualWriteCrashTimeline,
  IdempotentConsumerExample,
  OutboxSchemaExample,
} from "@/components/diagrams/OutboxWorkedExamples";
import { OutboxLab } from "@/components/OutboxLab";
import { InPractice } from "@/components/InPractice";
import {
  scenarioMetrics,
  tradeoffs,
  failureModes,
  failureExplanations,
  expectations,
  followUps,
  judgmentQuiz,
} from "@/data/topics/transactional-outbox";
import { articleToc } from "@/data/topics/article-format";
import { FailuresSection, FollowUpsSection, InterviewSection, RunbookSection, ScaleSection, SourcesSection, TradeoffsSection } from "./BlueprintSections";

const OUTBOX_WRONG_ANSWERS = [
  {
    question: "Why not wrap broker.publish() inside the SQL transaction?",
    explanation:
      "A slow broker or network round-trip holds the database transaction and locks open, consuming database connections. Under load, connection pool exhaustion takes down the entire application API in milliseconds.",
  },
  {
    question: "Why not poll outbox with SELECT * FROM outbox WHERE published = false?",
    explanation:
      "As the outbox table grows to millions of historical rows, scans without a partial index on unpublished rows kill disk IOPS. Concurrent pollers without a fixed slice of aggregate IDs can also publish events for the same order out of order.",
  },
  {
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

const OUTBOX_RUNBOOK = [
  "Check the age of the oldest unpublished outbox row first. It tells you whether events are late, not just whether the table is large.",
  "If the broker is down, keep accepting writes and let the relay retry with backoff. The outbox holds the backlog; alert on table size and disk before it pressures the database.",
  "If the broker is healthy but the relay is behind, add relay capacity partitioned by aggregate_id so events for one order stay in order.",
  "Before replaying a range after a relay crash, confirm every consumer deduplicates by the outbox event ID. Replays always produce duplicates.",
  "For a CDC relay, check that the connector's stored offset and the replication slot agree. A lost position re-reads old events or skips new ones.",
  "Once the backlog drains, compare outbox row counts with broker offsets, then clean up published rows.",
];

const OUTBOX_SOURCES: [label: string, href: string][] = [
  ["Debezium: Outbox Event Router", "https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html"],
  ["PostgreSQL: SELECT locking clause (SKIP LOCKED)", "https://www.postgresql.org/docs/current/sql-select.html"],
  ["microservices.io: Idempotent Consumer", "https://microservices.io/patterns/communication-style/idempotent-consumer.html"],
  ["Confluent: Schema evolution and compatibility", "https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html"],
];

const toc = articleToc({
  problem: "Every order must also emit an event",
  naive: "Why publishing after or inside the commit fails",
  "mental-model": "Make the event part of the data",
  architecture: "Write the event with the order, relay it later",
  "worked-example": "Explore the relay",
  scale: "What breaks at ten times the events?",
});

export function TransactionalOutboxArticle() {
  const relatedTopics = ["idempotent-api", "poison-messages", "database-migration", "schema-evolution"] as const;

  return (
    <BlueprintArticleFrame topicId="transactional-outbox" toc={toc} brief={
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
    }>

            {/* ── 01 — The Dual-Write Problem & Live Simulator ── */}
            <section id="problem" className="scroll-mt-16">
              <SectionHeader number="01" title="Every order must also emit an event" id="problem" />
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
            </section>

            {/* ── 02 — The Obvious Mistake & Gut Check ───────── */}
            <section id="naive" className="scroll-mt-16">
              <SectionHeader number="02" title="Why publishing after or inside the commit fails" id="naive" />
              <p className="text-slate-700 leading-relaxed">
                The intuitive design writes to the database, then publishes to the message broker. If the process crashes, the network times out, or the broker is unavailable between those two steps, the database commit succeeds but the event is never sent:
              </p>

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><OutboxDiagram /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><DualWriteCrashTimeline /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <InlineCheck
                className={neo.conceptCheck}
                question="Architectural Gut Check: Why can't we just call kafka.publish() inside our DB transaction so that if Kafka fails, the DB rolls back?"
                options={[
                  {
                    label: "It works reliably and is standard production practice.",
                    isCorrect: false,
                    explanation: "Kafka is not an XA resource and does not participate in Postgres transactions. If the broker accepts the message but the DB commit later fails, Kafka cannot 'unsend' the message. Worse, broker latency blocks DB connections.",
                  },
                  {
                    label: "Kafka cannot roll back: the publish can succeed and the commit still fail, and every transaction now waits on the broker.",
                    isCorrect: true,
                    explanation: "Right. The broker does not take part in the database transaction, so a publish followed by a failed commit leaves a ghost event that downstream services act on. As a second cost, each transaction holds its connection and locks while waiting on the broker, which exhausts the pool under load.",
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
              <SectionHeader number="03" title="Make the event part of the data" id="mental-model" />
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
              <SectionHeader number="04" title="Write the event with the order, relay it later" id="architecture" />
              <p className="text-slate-700 leading-relaxed mb-4">
                The resolved architecture decouples the user request from the message broker. The application touches only its local database:
              </p>

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><OutboxDiagram resolved={true} /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><OutboxSchemaExample /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><OutboxRowLifecycle /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><OutboxRelayFlow /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <InlineCheck
                className={neo.conceptCheck}
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

              <InPractice
                title="The standard CDC relay: Debezium's Outbox Event Router"
                points={[
                  "Debezium reads the outbox table through change data capture and expects insert-only rows. It filters out DELETE operations, so a cleanup job does not emit events.",
                  "Its default columns are `id` (the event ID, sent as a message header), `aggregatetype`, `aggregateid`, `type`, and `payload`.",
                  "`aggregatetype` chooses the topic (by default `outbox.event.<aggregatetype>`), and `aggregateid` becomes the Kafka message key, so every event for one order lands in the same partition, in order.",
                  "Delivery is still at least once. Consumers deduplicate by the event ID, exactly as with a polling relay.",
                ]}
                sources={OUTBOX_SOURCES.slice(0, 1)}
              />

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><IdempotentConsumerExample /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <h3 className="font-sans font-bold text-lg text-slate-900 mt-8 mb-2">The inbox: the outbox&rsquo;s counterpart</h3>
              <p className="text-slate-700 leading-relaxed">
                The outbox makes publishing reliable; it cannot stop a redelivery. The consumer-side answer is an inbox table, which microservices.io calls the Idempotent Consumer pattern. The consumer inserts each event ID into the inbox in the same local transaction as its business update, with a unique constraint on the ID. A redelivered event fails that insert and is skipped, so at-least-once delivery still produces one effect. Prune inbox rows only after the longest redelivery or replay window has passed.
              </p>

              <h3 className="font-sans font-bold text-lg text-slate-900 mt-8 mb-2">Version the event, not just the table</h3>
              <p className="text-slate-700 leading-relaxed">
                An outbox payload is a public contract. Consumers you do not control may read it days later, and a replay reads it again much later still. Put a schema version in every event and make compatible changes only: add optional fields, and never rename or retype one in place. A schema registry such as Confluent&rsquo;s can reject an incompatible schema before it ships. For a breaking change, publish a new event type or version alongside the old one until every consumer has moved.
              </p>
            </section>

            {/* ── 05 — Experiment ─────────────────────────────── */}
            <section id="worked-example" className="scroll-mt-16">
              <SectionHeader number="05" title="Explore the relay" id="worked-example" />
              <p className="text-slate-700 leading-relaxed">
                Raise the write rate, then tune the polling interval, worker count, and batch size until the relay keeps up. Add consumer re-deliveries to see why every consumer must be idempotent.
              </p>
              <BlueprintPanel id="workbench"><OutboxLab /></BlueprintPanel>
            </section>

            <RunbookSection steps={OUTBOX_RUNBOOK} />
            <TradeoffsSection tables={[
              { caption: "Outbox relay options", headers: ["Relay approach", "Advantage", "Operational risk"], rows: tradeoffs },
              { caption: "Correctness and ordering decisions", headers: ["Decision", "Benefit", "Cost"], rows: [
                ["Per-aggregate ordering", "Simple partitioning by aggregate_id", "No global cross-aggregate ordering"],
                ["At-least-once relay", "No lost events", "Downstream must implement idempotency keys"],
                ["Synchronous dual write", "No extra tables or workers", "Inconsistent on any process or network failure"],
              ] },
            ]} />
            <FailuresSection failures={failureModes.map(([title, signal, response]) => ({ title, signal, response, explanation: failureExplanations[title] }))} />
            <ScaleSection
              title="What breaks at ten times the events?"
              paragraphs={["At 50,000 events per second, the outbox table and its relay become a system you operate in their own right:"]}
              items={OUTBOX_TEN_X}
            />
            <InterviewSection
              answer={OUTBOX_INTERVIEW_SYNTHESIS}
              levels={expectations}
              wrongAnswers={OUTBOX_WRONG_ANSWERS}
              traps={OUTBOX_AVOID}
              whiteboardChain={OUTBOX_WHITEBOARD}
            />
            <FollowUpsSection items={followUps.map(({ question, answer }) => [question, answer])} />
            <SourcesSection
              topicId="transactional-outbox"
              sources={OUTBOX_SOURCES}
              quiz={{ title: "Transactional outbox", questions: judgmentQuiz, href: "/topics/correctness/transactional-outbox/quiz" }}
              related={relatedTopics}
            />
    </BlueprintArticleFrame>
  );
}
