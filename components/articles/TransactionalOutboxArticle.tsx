import { Breadcrumb } from "@/components/Breadcrumb";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CategoryBadge } from "@/components/CategoryBadge";
import { TableOfContents } from "@/components/TableOfContents";
import { SectionHeader } from "@/components/SectionHeader";
import { MetricTable } from "@/components/MetricTable";
import { DecisionTable } from "@/components/DecisionTable";
import { InsightCard } from "@/components/InsightCard";
import { Timeline } from "@/components/Timeline";
import { LevelExpectation } from "@/components/LevelExpectation";
import { ExpandableQuestion } from "@/components/ExpandableQuestion";
import { RelatedTopics } from "@/components/RelatedTopics";
import { WhatBreaksNext } from "@/components/doodle/WhatBreaksNext";
import { ArticleNav } from "@/components/ArticleNav";
import { CodeBlock } from "@/components/CodeBlock";
import { JudgmentQuiz } from "@/components/JudgmentQuiz";
import { ExecutiveBlueprint } from "@/components/ExecutiveBlueprint";
import { InlineCheck } from "@/components/InlineCheck";
import { OutboxDiagram, OutboxRelayFlow } from "@/components/diagrams/OutboxDiagram";
import {
  OutboxRowLifecycle,
  DualWriteCrashTimeline,
  IdempotentConsumerExample,
  OutboxSchemaExample,
} from "@/components/diagrams/OutboxWorkedExamples";
import { getTopicById } from "@/data/topics/catalog";
import { meta, tocItems, phases, expectations, followUps, judgmentQuiz } from "@/data/topics/transactional-outbox";

export function TransactionalOutboxArticle() {
  return (
    <article className="pt-4 pb-16 px-6">
      <div className="wide-width mx-auto">
        <Breadcrumb items={[{ label: "Problems", href: "/" }, { label: "Correctness", href: "/#problems" }, { label: "Transactional Outbox" }]} />
        {/* Article header — 2-column clean layout */}
        <header className="mb-10 pb-8 border-b border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side: Metadata, Title, Subtitle, Tags, Annotation */}
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <CategoryBadge category={meta.category} size="md" />
                <span className="font-sans font-semibold text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full">
                  {meta.difficulty}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="font-sans font-medium text-xs text-slate-500">
                  ⏱️ {meta.readingTime}
                </span>
              </div>

              <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight mb-3">
                {meta.title}
              </h1>

              <p className="font-sans text-base sm:text-lg text-slate-600 leading-relaxed mb-4">
                &ldquo;{meta.subtitle}&rdquo;
              </p>

              {/* Side / Subtitle Architectural takeaway banner */}
              <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50/80 border border-blue-200/80 rounded-lg text-xs sm:text-sm text-blue-950 font-medium">
                <span>
                  Never publish to your broker inside a DB transaction. Write to an Outbox table instead.
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-sans text-xs font-semibold px-2.5 py-1 bg-white rounded border border-slate-200 text-slate-600 shadow-2xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right side: Architecture Context Card */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                  <span className="font-sans font-bold text-xs text-slate-500 uppercase tracking-wider">
                    Architecture Context
                  </span>
                  <span className="font-sans font-bold text-xs px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">
                    Dual-Write Trap
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500 font-medium">Target Throughput</span>
                    <span className="font-bold text-slate-900">5,000 WPS Peak</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500 font-medium">Primary Failure</span>
                    <span className="font-semibold text-red-600">Lost &amp; Ghost Events</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500 font-medium">Atomic Mechanism</span>
                    <span className="font-semibold text-slate-900">Single ACID Transaction</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500 font-medium">Relay Pattern</span>
                    <span className="font-semibold text-slate-900">SKIP LOCKED / CDC WAL</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500 font-medium">Delivery Guarantee</span>
                    <span className="font-semibold text-emerald-600">At-Least-Once + Idempotent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <ExecutiveBlueprint
          timeToRead="30-Second Architecture Blueprint"
          bottleneck="DB write and Kafka publish are 2 uncoordinated network hops. A crash between them creates either lost events or ghost events."
          solution="Transactional Outbox: Commit the event row into the local database in the same ACID transaction. An async relay worker streams committed events to Kafka."
          goldenRule="Never call your broker inside a DB transaction, and always require consumer-side idempotency keys."
          keyMetrics={[
            { label: "Throughput < 1,500 WPS", value: "Polling Relay (SKIP LOCKED)" },
            { label: "Throughput > 5,000 WPS", value: "CDC Stream (Debezium WAL)" },
            { label: "Delivery Guarantee", value: "At-Least-Once + Consumer Dedup" },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-10">
          <TableOfContents items={tocItems} />
          <div className="flex-1 min-w-0 prose-width">
            <SectionHeader number="01" id="the-problem" title="The problem: the database knows, but nobody else does" />
            <p>An e-commerce service processes orders. When a customer clicks &ldquo;Buy Now,&rdquo; the service writes the order to a PostgreSQL database and publishes an <code>OrderCreated</code> event to Kafka. Downstream services — payment, inventory, notifications — depend on that event to do their work.</p>
            <p>These are two independent network operations: a database write and a broker publish. The application treats them as one logical unit, but they are not. They can fail independently, and they do.</p>
            <MetricTable rows={[
              { label: "Database write", value: "Local, ACID, sub-millisecond commit" },
              { label: "Broker publish", value: "Remote network call, 5–50 ms typical" },
              { label: "Failure window", value: "The gap between DB commit and broker ACK" },
              { label: "Impact of a lost event", value: "Payment never charged, inventory never reserved" },
              { label: "Impact of a ghost event", value: "Downstream acts on an order the DB rolled back" },
            ]} sideNote="The dual-write problem exists in any system that needs to update two independent stores atomically. The order service is one concrete example." />
            <ScrollReveal><OutboxDiagram /></ScrollReveal>
            <p>The question is not whether this gap exists. It does. The question is how often a failure lands in that gap — and what the consequences are when it does. For a service processing 5,000 orders per second, even a one-in-a-million failure rate means five lost events per hour during sustained peak.</p>

            <SectionHeader number="02" id="the-mistake" title="The first mistake: assume the publish will succeed" />
            <p>The simplest code writes the order and then publishes the event. It looks correct. The database commit succeeds. The publish call succeeds. It works — until a process crash, a deployment, or a broker timeout lands between them.</p>
            <ScrollReveal><DualWriteCrashTimeline /></ScrollReveal>
            <p>The reverse order — publish first, then commit — creates the opposite problem. Downstream services receive an event for an order that was never saved. A payment service charges the customer for a non-existent order. This is a <strong>ghost event</strong>.</p>
            <ScrollReveal><InsightCard title="Neither ordering is safe">Publish-then-commit creates ghost events. Commit-then-publish creates lost events. The fundamental issue is that two independent systems cannot be updated atomically without a coordination mechanism. &ldquo;It usually works&rdquo; is not a correctness argument.</InsightCard></ScrollReveal>
            <p>Some teams try to fix this by wrapping the publish call inside the database transaction. This avoids lost events if the publish fails (the transaction rolls back), but it couples database availability to broker availability. A slow broker holds the transaction open, consuming a database connection until the timeout. Under load, this exhausts the connection pool and blocks all database work — not just event publishing.</p>

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

            <SectionHeader number="03" id="diagnosis" title="Find every place your system does a dual write" />
            <p>Before designing a solution, map every code path that writes to the database and communicates with an external system in the same operation. The order service is one example. Others include:</p>
            <DecisionTable headers={["Code pattern", "What can go wrong", "Severity"]} rows={[
              ["DB commit → HTTP call to payment API", "Payment never initiated for committed order", "Revenue loss"],
              ["DB commit → cache invalidation", "Cache serves stale data indefinitely", "Correctness bug, user-visible"],
              ["DB commit → search index update", "Search returns results that do not match the database", "Stale search, user confusion"],
              ["DB commit → notification push", "Customer never receives confirmation", "User experience degradation"],
              ["DB commit → analytics event", "Business metrics undercount real activity", "Silent reporting drift"],
            ]} />
            <p>Each of these is a dual write. Some are tolerable — a delayed analytics event may not matter. A lost payment initiation is a revenue bug. Prioritize by consequence, not by frequency.</p>

            <SectionHeader number="04" id="mental-model" title="The mental model: make the event part of the data" />
            <p>If the event must exist whenever the business data exists, they must be written together. Not &ldquo;close together&rdquo; or &ldquo;right after&rdquo; — in the same atomic transaction. The database already provides this guarantee for its own rows. Use it.</p>
            <ScrollReveal><InsightCard title="Write the event to the database, not to the broker">Save the order and an event record in the same transaction. A separate process reads committed event records and publishes them to the broker. The application never calls the broker directly during a user request.</InsightCard></ScrollReveal>
            <p>This introduces a new table — the <strong>outbox</strong> — that holds event records until they are safely published. The word &ldquo;outbox&rdquo; comes from postal mail: a tray where outgoing letters wait until the mail carrier picks them up. The letter (event) exists the moment you put it in the tray (commit). Delivery happens separately.</p>
            <p>The critical shift: the application&apos;s responsibility ends at writing the outbox row. A separate <strong>relay</strong> process handles delivery. If the broker is down, orders still succeed. Events queue in the outbox table and drain when the broker recovers.</p>

            <SectionHeader number="05" id="architecture" title="The architecture: one transaction, one table, one relay" />
            <ScrollReveal><OutboxDiagram resolved /></ScrollReveal>
            <h3 className="font-hand text-xl sm:text-2xl font-bold text-[#171717] mt-8 mb-3">The outbox table</h3>
            <p>The outbox table lives in the same database as the business data. Each row represents one event that must be published. The table is append-only on the write path: the application only INSERTs, never UPDATEs, during a business transaction.</p>
            <OutboxSchemaExample />
            <p>The <code>aggregate_id</code> column serves two purposes: it becomes the Kafka partition key (ensuring per-entity ordering), and it helps the relay parallelize work across independent entities without breaking ordering guarantees.</p>
            <h3 className="font-hand text-xl sm:text-2xl font-bold text-[#171717] mt-8 mb-3">The write path: no broker, no coupling</h3>
            <p>When a customer places an order, the application opens a single database transaction, inserts the order row and the outbox row, and commits. The entire write path is a local database operation. The broker is not involved.</p>
            <p>If the transaction commits, both the order and the event record exist. If it rolls back, neither exists. There is no gap, no crash window, and no ghost event. This is the atomicity guarantee that the dual-write approach lacks.</p>
            <h3 className="font-hand text-xl sm:text-2xl font-bold text-[#171717] mt-8 mb-3">What the application code looks like</h3>
            <p>The change is small but structurally important. Instead of <code>save(order); publish(event);</code> the code becomes <code>save(order); saveOutboxRow(event); commit();</code> — all within the same transaction. The publish call disappears from the request path entirely.</p>
            <CodeBlock
              language="sql"
              filename="atomic-order-creation.sql"
              code={`-- Single atomic transaction: write business data AND outbox event
BEGIN;

INSERT INTO orders (id, user_id, amount, status)
VALUES ('order-7842', 'user-19', 42.50, 'PENDING');

INSERT INTO outbox (aggregate_type, aggregate_id, event_type, payload)
VALUES (
  'Order',
  'order-7842',
  'OrderCreated',
  '{"order_id": "order-7842", "amount": 42.50, "user_id": "user-19"}'::jsonb
);

COMMIT;`}
            />
            <h3 className="font-hand text-xl sm:text-2xl font-bold text-[#171717] mt-8 mb-3">Adopting the outbox: a phased rollout</h3>
            <p>Do not rewrite every producer at once. Audit the dual-write boundaries, add the outbox to one service, verify event delivery, and expand.</p>
            <ScrollReveal><Timeline phases={phases} /></ScrollReveal>

            <SectionHeader number="06" id="relay" title="The relay: get the event from the table to the broker" />
            <p>The relay is a separate process — a background worker or a CDC connector — that reads unpublished outbox rows and publishes them to the broker. It runs independently of the application. Two common strategies:</p>
            <ScrollReveal><OutboxRelayFlow /></ScrollReveal>
            <ScrollReveal delay={100}><OutboxRelayFlow cdc /></ScrollReveal>
            <h3 className="font-hand text-xl sm:text-2xl font-bold text-[#171717] mt-8 mb-3">Polling is simpler, CDC is faster</h3>
            <p>A polling relay queries <code>WHERE published_at IS NULL ORDER BY id</code> on a timer. It is simple to build, easy to reason about, and needs no additional infrastructure. The trade-off is latency: events wait up to the polling interval. For most applications, a 1-second poll is fast enough.</p>
            <CodeBlock
              language="sql"
              filename="polling-relay-worker.sql"
              code={`-- 1. Mandatory Partial Index: Only indexes unpublished rows (keeps index tiny & hot in RAM)
CREATE INDEX idx_outbox_unprocessed 
ON outbox (id ASC) 
WHERE published_at IS NULL;

-- 2. Concurrency-safe batch poll: SKIP LOCKED allows multiple workers to scale horizontally
SELECT id, aggregate_type, aggregate_id, event_type, payload
FROM outbox
WHERE published_at IS NULL
ORDER BY id ASC
LIMIT 100
FOR UPDATE SKIP LOCKED;

-- 3. Mark processed after broker ACK:
UPDATE outbox
SET published_at = NOW()
WHERE id = ANY($1::bigint[]);`}
            />
            <p>A CDC relay (e.g., Debezium tailing the PostgreSQL WAL) detects new outbox rows in near-real-time. It avoids polling overhead and delivers events with sub-second latency. The trade-off is operational complexity: WAL retention, connector failures, schema evolution, and monitoring.</p>
            <DecisionTable headers={["Relay strategy", "Delivery latency", "Operational cost"]} rows={[
              ["Polling (1s interval)", "Up to 1 second", "Low — a SQL query on a timer"],
              ["Polling (100ms interval)", "Up to 100 milliseconds", "Moderate — higher DB load"],
              ["CDC (Debezium/WAL)", "Sub-second, near-real-time", "High — connector, WAL retention, monitoring"],
              ["LISTEN/NOTIFY + poll fallback", "Low when healthy, poll interval on failure", "Moderate — database-specific, needs fallback"],
            ]} />
            <p>Choose based on your latency requirement and operational maturity. Start with polling; move to CDC if sub-second delivery becomes a product requirement.</p>

            <InlineCheck
              question="Scaling the Relay: You scale from 1 relay worker to 5 workers querying the outbox table. Without 'SKIP LOCKED', what happens?"
              options={[
                {
                  label: "The database automatically distributes rows round-robin across worker connections.",
                  isCorrect: false,
                  explanation: "Relational databases do not round-robin rows across parallel SELECT queries. All 5 workers execute the exact same query, fetching the exact same top 100 rows and locking each other out.",
                },
                {
                  label: "Workers collide on the exact same rows, causing severe lock serialization, deadlocks, and duplicate publishes.",
                  isCorrect: true,
                  explanation: "Spot on! Without SKIP LOCKED, workers either wait on each other's row locks or read the same unpublished rows simultaneously before status updates occur. SKIP LOCKED instructs Postgres to skip currently locked rows and grab the next available batch without waiting.",
                },
                {
                  label: "PostgreSQL automatically converts the table into a distributed Kafka topic.",
                  isCorrect: false,
                  explanation: "Postgres provides ACID storage and row locking, but messaging distribution must be explicitly managed by application workers or Debezium CDC.",
                },
              ]}
            />

            <SectionHeader number="07" id="guarantees" title="Ordering, delivery guarantees, and deduplication" />
            <h3 className="font-hand text-xl sm:text-2xl font-bold text-[#171717] mt-8 mb-3">1. At-least-once delivery, not exactly-once</h3>
            <p>The relay publishes events and then marks the outbox row. If it crashes after publishing but before marking, the row remains unmarked. On restart, the relay re-publishes it. This is <strong>at-least-once delivery</strong>: every event reaches the broker at least once, but some may arrive more than once.</p>
            <ScrollReveal><OutboxRowLifecycle /></ScrollReveal>
            <p>Exactly-once delivery between two independent systems (database and broker) requires distributed transactions (2PC) or a single system that owns both storage and messaging. The outbox pattern deliberately avoids this complexity by pushing deduplication to the consumer.</p>
            <h3 className="font-hand text-xl sm:text-2xl font-bold text-[#171717] mt-8 mb-3">2. Consumers must be idempotent</h3>
            <p>Since the relay delivers at-least-once, every consumer must handle receiving the same event twice. Use the outbox row <code>id</code> as a deduplication key. Before processing, check whether that ID has already been handled.</p>
            <ScrollReveal><IdempotentConsumerExample /></ScrollReveal>
            <p>The deduplication check and the business operation should happen in the same transaction on the consumer side. Otherwise, a crash between processing and recording creates the same gap we are trying to solve — just on the consumer instead of the producer.</p>
            <h3 className="font-hand text-xl sm:text-2xl font-bold text-[#171717] mt-8 mb-3">3. Per-entity ordering is achievable</h3>
            <p>Use <code>aggregate_id</code> (e.g., <code>order-7842</code>) as the Kafka partition key. All events for the same order land in the same partition, preserving their committed order. Different orders can be processed in parallel across partitions.</p>
            <p>Cross-entity ordering — &ldquo;all events from all orders in global commit order&rdquo; — requires a single relay thread publishing to a single partition. This limits throughput to one event at a time. Most systems do not need it. Define the ordering scope before building it.</p>

            <SectionHeader number="08" id="trade-offs" title="The trade-offs: what the outbox costs" />
            <DecisionTable headers={["Decision", "What improves", "What we now own"]} rows={[
              ["Outbox table in the same DB", "Atomic event creation with business data", "Table growth, cleanup jobs, index maintenance"],
              ["Polling relay", "Simple, no extra infrastructure", "Polling latency, relay position tracking, DB load from queries"],
              ["CDC relay", "Near-real-time, no polling overhead", "WAL retention, connector ops, schema coupling"],
              ["At-least-once delivery", "No lost events under any failure", "Consumer-side deduplication, idempotency keys"],
              ["Separate relay process", "Broker downtime does not block writes", "Relay monitoring, lag alerting, failover"],
            ]} />
            <p>The outbox adds latency between the business write and event delivery. For a polling relay, this is the polling interval. For CDC, it is sub-second but not zero. If downstream services need synchronous confirmation within the same HTTP request, the outbox does not provide it — and that requirement should be questioned.</p>

            <SectionHeader number="09" id="failure-modes" title="What can still go wrong?" />
            <DecisionTable headers={["Failure", "What you see", "How to contain it"]} rows={[
              ["Relay crashes after publish, before mark", "Duplicate event delivered", "Consumer idempotency with outbox event ID as dedup key"],
              ["Broker is unreachable", "Outbox table grows; events queue", "Monitor table size and oldest unpublished row age; alert before disk pressure"],
              ["Relay falls behind peak write rate", "Event delivery latency increases", "Partition relay work by aggregate_id; scale relay workers horizontally"],
              ["Outbox table bloats", "DB query performance degrades", "Partition table by created_at; scheduled cleanup of published rows"],
              ["CDC connector loses WAL position", "Events re-delivered or skipped", "Durable offset storage; snapshot recovery; reconciliation between outbox and broker"],
              ["Outbox INSERT adds latency to the business write", "P99 write latency increases", "Append-only inserts are fast; monitor and keep outbox index lean"],
            ]} />
            <p>The most common operational issue is outbox table growth. Without cleanup, the table accumulates every event the system has ever produced. Partition the table by <code>created_at</code> and drop old partitions. A weekly partition with a 30-day retention is a reasonable starting point.</p>
            <CodeBlock
              language="sql"
              filename="outbox-hygiene-patterns.sql"
              code={`-- Strategy A: Immediate row deletion in the same relay transaction (table stays under 1,000 rows)
DELETE FROM outbox 
WHERE id = ANY($1::bigint[]);

-- Strategy B: Range Partitioning by date (prevents PostgreSQL table & index bloat)
CREATE TABLE outbox (
  id BIGSERIAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Drop 30-day old partition instantly with zero transaction locking:
DROP TABLE outbox_y2026_m09_w03;`}
            />

            <SectionHeader number="10" id="ten-x" title="What breaks next — and can you predict it?" />
            <ScrollReveal><WhatBreaksNext solved="Lost and ghost events from dual writes" nextIssue="Relay throughput, consumer idempotency at scale, schema evolution" steps={["Write outbox row", "Relay publishes", "Consumer deduplicates"]} explanation="The outbox solves producer-side atomicity. It moves the complexity to the relay (throughput, ordering) and the consumer (deduplication, idempotency). Follow the work downstream." /></ScrollReveal>
            <p>At 10× write volume, the relay becomes a throughput bottleneck if it runs as a single thread. Partition outbox reads by <code>aggregate_id</code> ranges and run multiple relay instances — each owning a subset. Ensure that events for the same aggregate always go through the same relay instance to preserve ordering.</p>
            <p>Event schema evolution is the next challenge. When the outbox payload format changes, in-flight events in the old format may already be queued. Consumers must handle multiple schema versions, or the relay must translate. Define an event versioning strategy before you need it.</p>

            <SectionHeader number="11" id="avoid" title="What to avoid: the 3 classic architectural traps" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="p-4 bg-white border-[1.5px] border-[#DC2626] rounded-xl shadow-[2px_2px_0px_#DC2626]">
                <span className="font-mono text-xs font-bold text-[#DC2626] block mb-1">TRAP 01</span>
                <h4 className="font-hand text-lg font-bold text-[#171717] mb-1.5">&ldquo;Why not 2-Phase Commit (2PC)?&rdquo;</h4>
                <p className="font-sans text-xs text-[#374151] leading-relaxed mb-0">
                  2PC requires an XA transaction manager. Kafka does not support XA. Furthermore, 2PC blocks on the slowest participant — if one node delays, all locks stay held. In distributed clouds, 2PC kills availability.
                </p>
              </div>

              <div className="p-4 bg-white border-[1.5px] border-[#DC2626] rounded-xl shadow-[2px_2px_0px_#DC2626]">
                <span className="font-mono text-xs font-bold text-[#DC2626] block mb-1">TRAP 02</span>
                <h4 className="font-hand text-lg font-bold text-[#171717] mb-1.5">&ldquo;Why not publish to Kafka first?&rdquo;</h4>
                <p className="font-sans text-xs text-[#374151] leading-relaxed mb-0">
                  If the Kafka publish succeeds but the database write fails (constraint check, deadlock, power failure), downstream consumers process an event for an entity that does not exist. Ghost orders cause real financial loss.
                </p>
              </div>

              <div className="p-4 bg-white border-[1.5px] border-[#DC2626] rounded-xl shadow-[2px_2px_0px_#DC2626]">
                <span className="font-mono text-xs font-bold text-[#DC2626] block mb-1">TRAP 03</span>
                <h4 className="font-hand text-lg font-bold text-[#171717] mb-1.5">&ldquo;Doesn&apos;t Kafka EOS solve this?&rdquo;</h4>
                <p className="font-sans text-xs text-[#374151] leading-relaxed mb-0">
                  Kafka Exactly-Once Semantics (EOS) only applies to Kafka-to-Kafka streaming topologies (read-process-write within Kafka). It does not extend transaction boundaries to external PostgreSQL databases.
                </p>
              </div>
            </div>

            <ul className="list-disc pl-6 space-y-3 my-4">
              <li><strong>Do not call the broker inside the database transaction.</strong> A slow broker holds the transaction open. Under load, this exhausts the connection pool and blocks all writes.</li>
              <li><strong>Do not rely on &ldquo;it usually works.&rdquo;</strong> Dual writes fail during deployments, network partitions, and broker maintenance — exactly when your system is under stress.</li>
              <li><strong>Do not skip consumer-side deduplication.</strong> At-least-once delivery means duplicates will arrive. A consumer without an idempotency check will double-charge customers or double-reserve inventory.</li>
              <li><strong>Do not let the outbox table grow unbounded.</strong> Without cleanup, it becomes the largest table in your database. Monitor its size and oldest unpublished row age.</li>
              <li><strong>Do not assume CDC is simpler than polling.</strong> CDC delivers lower latency but adds WAL retention, connector monitoring, and schema coupling. Start with polling unless you need sub-second delivery.</li>
            </ul>

            <SectionHeader number="12" id="interview" title="A clear interview answer" />
            <InsightCard title="Explain the problem, the mechanism, and the guarantees">
              <p>I would start by identifying the dual-write problem: writing to a database and publishing to a broker are two independent operations that can fail independently. A crash between them either loses the event or creates a ghost event.</p>
              <p>I would solve this with the transactional outbox pattern: write the business data and an event row into the same database transaction. A separate relay process reads committed outbox rows and publishes them to the broker. The application never calls the broker directly.</p>
              <p>The relay delivers at-least-once. Consumers use the outbox event ID for deduplication. I would use <code>aggregate_id</code> as the Kafka partition key for per-entity ordering. I would plan outbox table cleanup, monitor relay lag, and choose between polling and CDC based on latency requirements and operational maturity.</p>
            </InsightCard>

            <SectionHeader number="13" id="expectations" title="How the answer grows with experience" />
            <p>Start with the dual-write problem and why neither publish ordering is safe. A stronger answer adds the relay design, consumer idempotency, and operational concerns like table cleanup and relay scaling.</p>
            <LevelExpectation levels={expectations} />

            <SectionHeader number="14" id="follow-ups" title="Follow-up questions" />
            {followUps.map((item) => <ExpandableQuestion key={item.question} question={item.question} answer={item.answer} />)}

            <ScrollReveal>
              <JudgmentQuiz
                title="Test Your Judgment: The Transactional Outbox"
                questions={judgmentQuiz}
              />
            </ScrollReveal>

            <SectionHeader number="15" id="related" title="Related problems" />
            <p>The outbox pattern connects to several other architecture problems: hot partitions need the same &ldquo;write locally, propagate later&rdquo; principle, flash sales need durable reservation events, and database migrations must preserve event consistency during the transition.</p>
            <RelatedTopics topics={["database-migration", "flash-sale", "hot-partition"].map((id) => {
              const topic = getTopicById(id as "database-migration" | "flash-sale" | "hot-partition");
              return { title: topic.meta.title, category: topic.meta.category, href: topic.href };
            })} />
            <details className="my-8 rounded-lg border border-ink/20 p-4">
              <summary className="font-hand text-xl font-bold cursor-pointer">Sources and further reading</summary>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><a className="underline" href="https://microservices.io/patterns/data/transactional-outbox.html">Microservices.io: Transactional Outbox pattern</a></li>
                <li><a className="underline" href="https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html">Debezium: Outbox Event Router</a></li>
                <li><a className="underline" href="https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/">Confluent: Exactly-once semantics in Kafka</a></li>
                <li><a className="underline" href="https://brandur.org/idempotency-keys">Brandur Leach: Implementing Stripe-like idempotency keys</a></li>
              </ul>
            </details>
            <ArticleNav currentId="transactional-outbox" />
          </div>
        </div>
      </div>
    </article>
  );
}
