import type { TopicId } from "./catalog";

export type ArticlePresentation = {
  number: string;
  shortTitle: string;
  overview: string;
  scenario: readonly { label: string; value: string }[];
  journey: readonly [string, string, string, string];
  startId: string;
  deck?: string;
};

// Required for every published topic. Layout and styling live in BlueprintArticleFrame.
export const articlePresentations = {
  "database-migration": {
    number: "001", shortTitle: "Database migration", startId: "problem",
    deck: "Keep the system available while you synchronize, validate, and transfer ownership of production writes.",
    overview: "A snapshot copies the database at one moment. Production writes continue afterward, so the target immediately falls behind. The migration has two jobs: keep the databases synchronized, then transfer traffic while preserving a way back.",
    scenario: [{ label: "Daily reads", value: "100 million" }, { label: "Daily writes", value: "10 million" }, { label: "Downtime budget", value: "Zero" }, { label: "Approach", value: "Snapshot + CDC" }],
    journey: ["Seed the target", "Stream the changes", "Validate the data", "Transfer ownership"],
  },
  "flash-sale": {
    number: "002", shortTitle: "Flash sale", startId: "problem",
    overview: "A traffic spike should not become a database spike. Admit a bounded stream, reserve inventory atomically, and settle orders asynchronously while protecting the stock invariant.",
    scenario: [{ label: "Event", value: "10M users" }, { label: "Inventory", value: "10,000 units" }, { label: "Invariant", value: "No overselling" }, { label: "Approach", value: "Queue + Redis Lua" }],
    journey: ["Bound admission", "Reserve stock", "Settle orders", "Reconcile results"],
  },
  "hot-partition": {
    number: "003", shortTitle: "Hot partitions", startId: "problem",
    overview: "A single hot key can overwhelm one partition while the rest sit idle. Separate repeated reads from independent writes, then choose caching or write sharding for the actual bottleneck.",
    scenario: [{ label: "Total traffic", value: "100,000 req/s" }, { label: "Hot key traffic", value: "70,000 req/s" }, { label: "Partitions", value: "16" }, { label: "Approach", value: "Cache + salted keys" }],
    journey: ["Find the skew", "Separate workloads", "Spread the pressure", "Validate the change"],
  },
  "transactional-outbox": {
    number: "004", shortTitle: "Transactional outbox", startId: "problem",
    overview: "A database commit and a broker publish are separate failure boundaries. Persist the event with the business write, relay it asynchronously, and make repeated delivery safe for consumers.",
    scenario: [{ label: "Service", value: "Order processing" }, { label: "Peak writes", value: "5,000 orders/s" }, { label: "Delivery", value: "At least once" }, { label: "Approach", value: "Atomic outbox + relay" }],
    journey: ["Write atomically", "Commit the intent", "Relay the event", "Deduplicate delivery"],
  },
  "idempotent-api": {
    number: "005", shortTitle: "Idempotent payments", startId: "problem",
    overview: "A timeout leaves the payment outcome unknown. Persist the business intent before calling the provider, preserve its identity across retries, and reconcile ambiguous results within the provider’s contract.",
    scenario: [{ label: "Operation", value: "Payment intent" }, { label: "Failure", value: "Response lost" }, { label: "Invariant", value: "One charge per intent" }, { label: "Recovery", value: "Stable key + lookup" }],
    journey: ["Name the intent", "Claim the key", "Resolve the outcome", "Replay the result"],
  },
  "poison-messages": {
    number: "006", shortTitle: "Poison messages", startId: "problem",
    overview: "Retrying a permanently invalid event cannot repair it. Bound the attempts, preserve a durable failure record, and make repair and replay an owned operation without silently breaking business ordering.",
    scenario: [{ label: "Failure", value: "Invalid event 41" }, { label: "Following event", value: "Ship order / 42" }, { label: "Constraint", value: "Per-order transitions" }, { label: "Recovery", value: "Quarantine + replay" }],
    journey: ["Classify the failure", "Bound retries", "Quarantine durably", "Repair and replay"],
  },
  "retry-storm": {
    number: "007", shortTitle: "Retry storms", startId: "problem",
    overview: "Retries spend the same capacity as useful work. Give one layer ownership of retries, bound concurrency and deadlines, and stop additional attempts when they would prevent the dependency from recovering.",
    scenario: [{ label: "Healthy dependency", value: "50 ms" }, { label: "Slow dependency", value: "2 seconds" }, { label: "Failure", value: "Nested retries" }, { label: "Approach", value: "Deadline + budget" }],
    journey: ["Trace amplification", "Choose one owner", "Bound the work", "Protect recovery"],
  },
  "connection-pool": {
    number: "008", shortTitle: "Connection pools", startId: "problem",
    overview: "Each replica has a local pool, but the database has a shared connection budget. Separate acquisition wait from query time, account for hold duration, and scale within the total budget.",
    scenario: [{ label: "Initial replicas", value: "8" }, { label: "Pool per replica", value: "20 connections" }, { label: "Application budget", value: "160 connections" }, { label: "Workload", value: "400 checkouts/s" }],
    journey: ["Measure the wait", "Account for sessions", "Reduce hold time", "Bound admission"],
  },
  "schema-evolution": {
    number: "009", shortTitle: "Schema evolution", startId: "problem",
    overview: "A rolling deployment runs old and new code together. Expand compatibility before moving data, validate every migration phase, and remove the old representation only after its readers and rollback window are gone.",
    scenario: [{ label: "Change", value: "Move a column" }, { label: "Deployment", value: "Mixed versions" }, { label: "Constraint", value: "Reader compatibility" }, { label: "Approach", value: "Expand → contract" }],
    journey: ["Expand the schema", "Bridge and backfill", "Validate readers", "Contract safely"],
  },
} satisfies Record<TopicId, ArticlePresentation>;
