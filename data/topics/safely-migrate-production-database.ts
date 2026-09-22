import type { TopicMeta, TocItem, RelatedTopicData, TimelinePhaseData, LevelData, ExpandableQA } from "@/data/types";

export const meta: TopicMeta = {
  slug: "safely-migrate-production-database",
  category: "DATA",
  categorySlug: "database",
  difficulty: "Senior+",
  title: "How to Safely Migrate a 100M-Read / 10M-Write-per-Day Production Database",
  subtitle: "Zero downtime sounds simple. Keeping writes correct during the migration is not.",
  tags: ["Snapshot", "CDC", "Validation", "Cutover", "Rollback"],
  readingTime: "10 min read",
};

export const tocItems: TocItem[] = [
  { id: "the-problem",       label: "The Problem" },
  { id: "the-mistake",       label: "The First Mistake" },
  { id: "why-hard",          label: "Why It's Hard" },
  { id: "mental-model",      label: "Mental Model" },
  { id: "migration-shape",   label: "Migration Shape" },
  { id: "phases",            label: "Migration Phases" },
  { id: "dual-write",        label: "The Dual Write" },
  { id: "trade-offs",        label: "Key Trade-offs" },
  { id: "failure-modes",     label: "What Can Go Wrong" },
  { id: "ten-x",             label: "What Happens at 10×" },
  { id: "avoid",             label: "What to Avoid" },
  { id: "interview",         label: "Interview Answer" },
  { id: "expectations",      label: "Level Expectations" },
  { id: "follow-ups",        label: "Interviewer Follow-ups" },
  { id: "related",           label: "Related Problems" },
];

export const scenarioMetrics = [
  { label: "Reads",                    value: "100M / day" },
  { label: "Writes",                   value: "10M / day" },
  { label: "Availability requirement", value: "High" },
  { label: "Allowed downtime",         value: "0" },
  { label: "Data loss",                value: "0 acceptable" },
  { label: "Target migration",         value: "New database" },
];

export const difficultyFactors = [
  ["Writes continue",    "Destination becomes stale immediately"],
  ["Large dataset",      "Initial copy takes hours or days"],
  ["CDC lag",            "Recent writes may not yet exist on target"],
  ["Schema differences", "Data transformation may be required"],
  ["Dual systems",       "Bugs can create subtle divergence"],
  ["Cutover",            "A bad switch can cause a production outage"],
  ["Rollback",           "Reversing the migration isn't automatically safe"],
];

export const migrationPhases: TimelinePhaseData[] = [
  {
    number: "1",
    title: "Prepare",
    description: "Provision the target database, validate schema compatibility, create indexes, run capacity tests, configure permissions and monitoring.",
    details: [
      "Schema compatibility between source and target",
      "Index creation on target before data load",
      "Capacity testing under expected write volume",
      "Monitoring and alerting on both databases",
    ],
  },
  {
    number: "2",
    title: "Initial Snapshot",
    description: "Copy existing data from source to target. This is a point-in-time snapshot — writes that arrive after the snapshot begins are not included.",
  },
  {
    number: "3",
    title: "Change Capture",
    description: "Capture new changes from the source database and apply them to the target. This is CDC — Change Data Capture — reading the source's change log and replaying mutations on the target.",
    details: [
      "CDC reads the write-ahead log (WAL) or equivalent",
      "Changes are applied in order to the target",
      "The target converges toward the source over time",
    ],
  },
  {
    number: "4",
    title: "Catch Up",
    description: "Measure replication lag between source and target. A target that has received 'most' data is not necessarily ready for cutover — it must be consistently within an acceptable lag window.",
  },
  {
    number: "5",
    title: "Validate",
    description: "Verify data integrity between source and target before moving any production traffic.",
    details: [
      "Row counts across tables",
      "Checksums where practical",
      "Sampled record comparisons",
      "Business invariants (e.g. account balances, reference integrity)",
      "Missing or duplicate record detection",
    ],
  },
  {
    number: "6",
    title: "Cutover",
    description: "Gradually shift production traffic from the source to the target. The actual strategy depends on whether writes go to one source or multiple destinations.",
  },
  {
    number: "7",
    title: "Observe",
    description: "Monitor the new database under real production load. Watch error rates, latency, replication lag, correctness metrics, database saturation, and business metrics.",
  },
  {
    number: "8",
    title: "Rollback",
    description: "Maintain the ability to reverse the migration throughout the process. Discuss rollback strategy before declaring migration complete — not after something fails.",
  },
];

export const dualWriteApproaches = [
  ["Sequential dual write", "Simple mental model",         "Partial failure — one write succeeds, the other fails"],
  ["Transactional outbox",  "Durable intent",              "More infrastructure (outbox table + processor)"],
  ["CDC from source",       "Single source of truth",      "Replication complexity and lag"],
  ["Async reconciliation",  "Eventually converges",        "Temporary inconsistency window"],
];

export const keyTradeoffs = [
  ["CDC",               "Keeps target current automatically",  "Operational complexity of CDC pipeline"],
  ["Dual write",        "Fast synchronization",                "Partial-write failure risk"],
  ["Dual read",         "Validation before cutover",           "Extra read load on both databases"],
  ["Shadow traffic",    "Real-world validation under load",    "Increased infrastructure cost"],
  ["Gradual cutover",   "Lower blast radius per step",         "More operational complexity"],
  ["Immediate cutover", "Simple — one switch",                 "Higher rollback blast radius"],
];

export const failureModes = [
  ["CDC stops",                           "Replication lag spikes",        "Stop cutover, investigate, restart CDC"],
  ["Missing events",                      "Reconciliation checks",         "Replay from WAL or reconcile"],
  ["Duplicate events",                    "Business key uniqueness",       "Idempotent consumer / upsert logic"],
  ["Target slower than source",           "Target latency increases",      "Throttle migration traffic"],
  ["Target data diverges from source",    "Validation mismatches",         "Investigate before proceeding to cutover"],
  ["Cutover increases error rate",        "Error and latency metrics",     "Rollback to source"],
  ["Rollback itself creates divergence",  "Write ownership monitoring",    "Controlled reverse sync"],
];

export const tenXProblems = [
  "Snapshot duration increases significantly",
  "CDC volume increases — target must handle the write throughput",
  "Migration traffic competes with production traffic for resources",
  "Validation becomes more expensive and slower",
  "Replication lag may increase under higher write volume",
  "Rollback becomes more complicated with more data in flight",
  "Coordination across teams becomes necessary",
];

export const avoidList = [
  "Blindly dumping and restoring a live production database",
  "Switching 100% of traffic immediately without gradual rollout",
  "Relying solely on row counts for validation",
  "Assuming CDC lag is always negligible",
  "Assuming dual writes are automatically safe",
  "Removing the old database immediately after cutover",
  "Designing rollback only after the migration fails",
];

export const interviewAnswer = `I'd start by framing the constraint: we can't take the database offline. That means the migration becomes a synchronization problem followed by a traffic-switching problem.

My approach would be: take a point-in-time snapshot to seed the target database, then set up CDC to capture ongoing writes from the source. Once the target is caught up and replication lag is stable, I'd validate — row counts, checksums, sampled records.

For cutover, I'd shift traffic gradually: start with 1% of reads, watch metrics, then ramp. Writes are trickier — I'd keep the source as the single writer until reads look healthy on the target, then switch writes with a feature flag.

Throughout, I'd keep the rollback path clear. The source database stays intact. CDC direction can be reversed if needed. And I wouldn't decommission the old DB until we've had a stability window under full load.

The main trade-off is between speed of migration and risk. Going faster means accepting more blast radius. Going slower means maintaining two systems for longer, which has its own operational cost.`;

export const levelExpectations: LevelData[] = [
  {
    title: "Mid-level",
    description: "Can explain the problem and the basic solution.",
    items: [
      "Why dump/restore is unsafe for a live system",
      "Snapshot + CDC concept",
      "Basic validation approach",
      "Simple cutover",
      "Basic failure scenarios",
    ],
  },
  {
    title: "Senior",
    description: "Chooses between solutions based on constraints and failure modes.",
    items: [
      "CDC lag and its implications",
      "Dual writes — risks and alternatives",
      "Idempotency in data sync",
      "Reconciliation strategies",
      "Schema compatibility",
      "Gradual cutover with rollback",
      "Observability and capacity constraints",
      "Trade-off articulation",
    ],
  },
  {
    title: "Staff",
    description: "Reasons about organization-wide implications and long-term architecture.",
    items: [
      "Migration ownership across services",
      "Architecture evolution planning",
      "Organizational coordination",
      "Failure domains and blast radius",
      "Multi-region implications",
      "Long migration windows",
      "Cost and operational burden",
      "Rollback at organizational / system level",
    ],
  },
];

export const followUpQuestions: ExpandableQA[] = [
  {
    question: "Why not just stop writes during the migration?",
    answer: "Because the requirement is zero downtime. Stopping writes means the system is unavailable for write operations — which in a production system handling 10M writes per day, means approximately 115 writes per second are being dropped or queued. For many applications, this is unacceptable even for minutes.",
  },
  {
    question: "Why CDC instead of dual writes?",
    answer: "CDC gives you a single source of truth — the source database's WAL. There's no risk of partial-write failure because you're not writing to two systems in the application layer. The trade-off is operational complexity: you need a CDC pipeline, and there's inherent replication lag.",
  },
  {
    question: "What happens if CDC falls behind?",
    answer: "If the target can't apply changes as fast as the source produces them, replication lag grows. This means the target is increasingly stale. You should monitor lag continuously and halt cutover if lag exceeds your threshold. You may need to throttle source traffic or increase target capacity.",
  },
  {
    question: "How do you verify that DB A and DB B are identical?",
    answer: "You can't prove they're perfectly identical at any instant — writes are still arriving. But you can validate: compare row counts, run checksums on stable data, sample records for comparison, verify business invariants like account balances or reference integrity, and check for missing or duplicate records.",
  },
  {
    question: "What if the schemas are different?",
    answer: "Schema differences require transformation logic in the CDC pipeline or during the snapshot phase. This adds complexity: you need to test the transformation thoroughly, handle edge cases in data types, and ensure that the transformation is reversible if rollback is needed.",
  },
  {
    question: "What happens when DB B accepts the write but DB A fails?",
    answer: "In a dual-write setup, this creates divergence. DB B has a record that DB A doesn't. This is why dual writes are dangerous — you need either a transactional outbox pattern, CDC from a single source, or async reconciliation to handle this. Sequential dual writes are the simplest but most fragile approach.",
  },
  {
    question: "How do you roll back after moving 30% of traffic?",
    answer: "If 30% of reads were on DB B and you switch them back to DB A, there's no data issue — A was the source of truth throughout. If 30% of writes were going to DB B, you need to sync those writes back to DB A before rolling back. This is why it's often safer to keep writes on A until you're ready for a full write cutover.",
  },
  {
    question: "What happens if the new database is slower?",
    answer: "Latency regressions surface during the gradual cutover phase. At 1% traffic, you can observe p50/p95/p99 latency differences. If the target is meaningfully slower, you may need to optimize indexes, tune connection pools, adjust caching, or reconsider the migration target. This is why shadow reads are valuable.",
  },
  {
    question: "Would you use dual reads?",
    answer: "Dual reads are useful for validation: read from both databases and compare results. The trade-off is extra read load on both systems and added latency (if done synchronously). Typically you'd do this as async shadow reads — fire and forget — and log discrepancies rather than failing the request.",
  },
  {
    question: "What changes if the workload becomes 10× larger?",
    answer: "At 1B reads/day and 100M writes/day, the snapshot takes longer, CDC volume is much higher, the target needs significantly more write capacity, migration traffic competes with production traffic for resources, and validation becomes slower and more expensive. The architecture is the same but the operational constraints are tighter.",
  },
];

export const relatedTopics: RelatedTopicData[] = [
  { title: "Surviving a Flash Sale",      category: "TRAFFIC", href: "/topics/traffic/survive-flash-sale" },
  { title: "Idempotent Write APIs",       category: "CORRECTNESS" },
  { title: "Reconciliation Strategies",   category: "DATA" },
  { title: "Backpressure",                category: "MESSAGING" },
  { title: "Poison Messages",             category: "MESSAGING" },
  { title: "Hot Partitions",              category: "DATA" },
  { title: "Graceful Cutover",            category: "DEPLOYMENT" },
  { title: "Schema Evolution",            category: "DEPLOYMENT" },
];

export const migrationStrategies = [
  {
    name: "Snapshot + CDC",
    description: "Take a point-in-time copy of the source, then capture ongoing changes via the database's change log. The target converges toward the source over time. This keeps a single source of truth.",
  },
  {
    name: "Dual Write",
    description: "The application writes to both databases simultaneously. Simple in concept, but dangerous — if one write fails, the systems diverge. Requires idempotency and reconciliation to be safe.",
  },
  {
    name: "Dual Read",
    description: "Read from both databases and compare results. Useful for validation before cutover. Doesn't solve the write problem, but lets you verify the target's data is correct under real traffic.",
  },
  {
    name: "Shadow Traffic",
    description: "Replay production traffic against the target without serving the results. Useful for performance validation and catching regressions. Increases infrastructure cost during migration.",
  },
];
