import { getTopicById } from "@/data/topics/catalog";
import type { TocItem, TimelinePhaseData, ExpandableQA, LevelData } from "@/data/types";

export const meta = getTopicById("transactional-outbox").meta;
export const tocItems: TocItem[] = [
  { id: "the-problem", label: "The Problem" },
  { id: "the-mistake", label: "The First Mistake" },
  { id: "diagnosis", label: "Find the Coupling" },
  { id: "mental-model", label: "Mental Model" },
  { id: "architecture", label: "Outbox Architecture" },
  { id: "relay", label: "The Relay Worker" },
  { id: "guarantees", label: "Ordering, Delivery & Dedup" },
  { id: "trade-offs", label: "Key Trade-offs" },
  { id: "failure-modes", label: "What Can Go Wrong" },
  { id: "ten-x", label: "What Breaks Next" },
  { id: "avoid", label: "What to Avoid" },
  { id: "interview", label: "Interview Answer" },
  { id: "expectations", label: "Level Expectations" },
  { id: "follow-ups", label: "Follow-up Questions" },
  { id: "related", label: "Related Problems" },
];
export const scenarioMetrics = [
  { label: "Service", value: "Order service processing purchases" },
  { label: "Database", value: "PostgreSQL with ACID transactions" },
  { label: "Message broker", value: "Kafka (or any durable message bus)" },
  { label: "Write rate (illustrative)", value: "5,000 orders/second during peak" },
  { label: "Downstream consumers", value: "Payment, inventory, notification, analytics" },
  { label: "Correctness requirement", value: "Every committed order produces exactly one event; no ghost events" },
  { label: "Availability requirement", value: "Broker downtime must not block order placement" },
];
export const diagnosis = [
  ["Is the event published inside the transaction?", "If yes, a broker timeout can hold the DB transaction open, causing connection pool exhaustion and cascading failures."],
  ["Is the event published after the commit?", "If yes, a crash between commit and publish silently drops the event. Downstream never learns about the order."],
  ["Do consumers see duplicates?", "At-least-once delivery means relays and consumers must handle re-delivery. Idempotency keys are required."],
  ["Is ordering required across entities?", "Per-entity ordering is achievable with partition keys. Cross-entity global ordering is a much stronger — and costlier — guarantee."],
  ["Are ghost events possible?", "Publishing before commit can announce an order that the database subsequently rolls back. Consumers act on data that does not exist."],
];
export const phases: TimelinePhaseData[] = [
  { number: "01", title: "Identify dual-write boundaries", description: "Audit every code path that writes to the database and then publishes an event. List which ones can silently lose events or produce ghosts.", details: ["Check error handling: does a failed publish roll back the DB write?", "Measure how often publish latency exceeds your transaction timeout."] },
  { number: "02", title: "Add the outbox table", description: "Create an outbox table in the same database. Write business data and the outbox row in a single transaction.", details: ["Schema: id, aggregate_type, aggregate_id, event_type, payload, created_at, published_at.", "The row is committed atomically with the business write — no partial state."] },
  { number: "03", title: "Deploy the relay worker", description: "A separate process polls or tails the outbox table, publishes events to the broker, and marks rows as delivered.", details: ["Use a CDC connector or a polling query with ORDER BY id and a high-water mark.", "Track the last published ID durably — not in memory."] },
  { number: "04", title: "Verify and clean up", description: "Confirm every committed row reaches the broker. Add monitoring, then retire the old dual-write paths.", details: ["Compare outbox row counts against broker offsets periodically.", "Archive or delete published rows to keep the table small."] },
];
export const tradeoffs = [
  ["Outbox + polling relay", "Simple, no extra infrastructure", "Polling latency, relay must track position durably, table grows without cleanup"],
  ["Outbox + CDC (e.g. Debezium)", "Near-real-time, no polling overhead", "Operational complexity of CDC connector, WAL retention, schema coupling"],
  ["Listen/Notify + relay", "Low-latency push notification to relay", "Database-specific, notification can be lost under load, still needs a fallback poll"],
  ["Saga / choreography", "Services react to events independently", "Harder to reason about, requires compensation for partial failures"],
  ["Synchronous dual write", "Simplest code path", "Inconsistent on any failure; the approach this design replaces"],
];
export const failureModes = [
  ["Relay crashes after publish, before marking row", "Event is re-published on restart", "Consumers must be idempotent; use the outbox row ID as a deduplication key"],
  ["Broker is down", "Relay retries; outbox table grows", "Monitor table size and oldest unpublished row age; alert before disk pressure"],
  ["Relay falls behind", "Event latency increases for all consumers", "Horizontal relay partitioning by aggregate_id; monitor lag"],
  ["Outbox table bloats", "Database performance degrades", "Scheduled cleanup of published rows; partitioned table by created_at"],
  ["Transaction contention on outbox inserts", "Business write latency increases", "Append-only design, no updates during the write path; partition the table"],
  ["CDC connector loses its WAL position", "Re-reads old events or skips new ones", "Durable offset storage, snapshot recovery procedure, reconciliation checks"],
];
export const expectations: LevelData[] = [
  { title: "MID", description: "Recognize the dual-write problem and explain why it causes inconsistency.", items: ["Describe what happens when a crash occurs between DB commit and event publish", "Explain why publishing inside the transaction couples availability to the broker", "Know that the outbox pattern solves this by making the event part of the transaction"] },
  { title: "SENIOR", description: "Design a working outbox with relay, ordering, and failure handling.", items: ["Choose between polling and CDC for the relay and justify the trade-off", "Handle at-least-once delivery with idempotency keys on the consumer side", "Plan outbox table cleanup and monitor relay lag and table growth"] },
  { title: "STAFF", description: "Own the event contract as a system-wide reliability primitive.", items: ["Define event schemas and versioning as a cross-team contract", "Design for multi-region relay with ordering and consistency guarantees", "Account for outbox as infrastructure: operability, cost, and team ownership"] },
];
export const followUps: ExpandableQA[] = [
  { question: "Why not publish the event inside the database transaction?", answer: "The transaction stays open while waiting for the broker to acknowledge. If the broker is slow or down, the transaction blocks, holding database locks and connections. Under load, this exhausts the connection pool and stops all writes — not just event publishing. The outbox avoids this by writing only to the local database, which is fast and reliable." },
  { question: "What if we need strict global ordering across all events?", answer: "Per-aggregate ordering is straightforward: partition outbox reads and broker topics by aggregate ID. Global ordering across aggregates requires a single serial relay or a coordination layer, which limits throughput to one event at a time. Most systems do not need this; define the ordering scope before building it." },
  { question: "How do consumers handle duplicate events?", answer: "The relay delivers at-least-once. Consumers must be idempotent: use the outbox event ID as a deduplication key, check whether the operation was already applied, or design the operation to be naturally idempotent (e.g., SET status = 'paid' rather than INCREMENT balance). A consumer that cannot tolerate duplicates without an idempotency check will produce incorrect results." },
  { question: "Can we use the outbox pattern with a NoSQL database?", answer: "Yes, if the database supports atomic writes to multiple items in the same transaction — for example, DynamoDB transactions or MongoDB multi-document transactions. If it does not, you need a single-document design where the event is embedded in the same document as the business data, or an alternative consistency mechanism." },
  { question: "How does this relate to Change Data Capture (CDC)?", answer: "CDC tails the database transaction log to detect committed changes, including outbox inserts. It replaces polling with a real-time stream. The outbox table still exists — CDC is a relay strategy, not a replacement for the atomicity guarantee. CDC adds operational complexity: WAL retention, connector failures, and schema evolution must all be managed." },
];

export const judgmentQuiz = [
  {
    scenario: "An e-commerce service commits an order to PostgreSQL, but the relay worker process crashes before publishing the event to Kafka. When the relay restarts, what happens?",
    options: [
      {
        text: "The event is lost permanently because the in-memory publisher process terminated.",
        isCorrect: false,
        explanation: "In the outbox pattern, events are durably persisted in the database table, not held in volatile worker memory. Unmarked rows survive any process crash.",
      },
      {
        text: "The outbox row still has published_at = NULL, so the restarted relay reads and publishes it to Kafka.",
        isCorrect: true,
        explanation: "Correct! The database row is the durable source of truth. The relay queries WHERE published_at IS NULL, providing guaranteed at-least-once delivery.",
      },
      {
        text: "PostgreSQL automatically rolls back the committed order when the relay crashes.",
        isCorrect: false,
        explanation: "The database transaction already completed and committed during the HTTP request. It cannot retroactively roll back after commit.",
      },
    ],
  },
  {
    scenario: "The relay worker successfully publishes an OrderCreated event to Kafka, but crashes just before updating published_at = NOW() in PostgreSQL. What must downstream consumers do?",
    options: [
      {
        text: "Rely on Kafka to automatically erase unconfirmed messages from the broker partition.",
        isCorrect: false,
        explanation: "Kafka already accepted and appended the message to the partition log; it has no insight into Postgres' internal row state.",
      },
      {
        text: "Implement idempotent processing using the event ID to detect and discard duplicate deliveries.",
        isCorrect: true,
        explanation: "Correct! Because the unmarked row will be re-published upon relay restart, at-least-once delivery requires consumer-side idempotency keys.",
      },
      {
        text: "Reject all incoming events until the Postgres relay database recovers and completes the timestamp update.",
        isCorrect: false,
        explanation: "Downstream consumers should not couple their availability to the producer's internal database state.",
      },
    ],
  },
  {
    scenario: "Under a 10× traffic spike, your single-threaded polling relay falls behind, creating a 15-minute event lag. How should you scale the relay without corrupting per-order event ordering?",
    options: [
      {
        text: "Run 10 relay threads that all poll ORDER BY id LIMIT 100 concurrently without partitioning.",
        isCorrect: false,
        explanation: "Multiple workers polling the same rows can publish events for the same order out-of-order, violating event causality.",
      },
      {
        text: "Partition relay instances by hash(aggregate_id) so all events for any given order are processed by the same worker.",
        isCorrect: true,
        explanation: "Correct! Per-entity ordering is preserved when all events for the same aggregate_id flow through the same relay instance into the same Kafka partition.",
      },
      {
        text: "Switch to asynchronous dual writes directly from the web application servers.",
        isCorrect: false,
        explanation: "Dual writes reintroduce the exact silent failure and ghost event bugs that the outbox pattern was chosen to eliminate.",
      },
    ],
  },
];
