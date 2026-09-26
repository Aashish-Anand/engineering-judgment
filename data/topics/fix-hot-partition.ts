import { getTopicById } from "@/data/topics/catalog";
import type { TocItem, TimelinePhaseData, ExpandableQA, LevelData } from "@/data/types";

export const meta = getTopicById("hot-partition").meta;
export const tocItems: TocItem[] = [
  { id: "the-problem", label: "The Problem" },
  { id: "the-mistake", label: "The First Mistake" },
  { id: "diagnosis", label: "Find the Hot Key" },
  { id: "mental-model", label: "Mental Model" },
  { id: "architecture", label: "Read & Write Architecture" },
  { id: "incident", label: "Incident Response" },
  { id: "sharding", label: "Keys, Retries & Migration" },
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
  { label: "Workload (illustrative)", value: "100,000 requests/second across 16 partitions" },
  { label: "Hot partition", value: "70,000 requests/second: 70% of traffic" },
  { label: "Other partitions", value: "30,000 / 15 = 2,000 requests/second each on average" },
  { label: "Safe capacity (assumed benchmark)", value: "10,000 requests/second per partition for this workload" },
  { label: "Read path", value: "Post body and displayed engagement counts" },
  { label: "Write path", value: "Likes, comments, and asynchronous feed delivery" },
  { label: "Correctness", value: "Durable user actions; approximate public counts may lag" },
];
export const diagnosis = [
  ["Which resource is hot?", "Compare per-partition request rate, bytes, p99 latency, throttling, CPU/IO, and queue age. Cluster averages hide skew."],
  ["One key or many?", "Use sampled top-key traces. A single post_id cannot be fixed by redistributing unrelated keys; a poorly balanced key range sometimes can."],
  ["Reads or writes?", "Split post-body GETs, counter reads, like mutations, comments, and fanout jobs. Each needs a different remedy."],
  ["Database or event stream?", "Database shards constrain storage work. Kafka partitions constrain ordered event processing. A hot downstream index can remain after both are fixed."],
  ["Original load or amplification?", "Measure cache misses, retries, duplicate work, and celebrity follower fanout. One publication may cause millions of downstream operations."],
];
export const phases: TimelinePhaseData[] = [
  { number: "01", title: "Contain the overload", description: "Activate tested request limits, cap retries, and reserve resources for ordinary posts.", details: ["Keep waiting queues bounded; reject work that cannot be safely accepted.", "Use older public copies only where freshness and access rules permit."] },
  { number: "02", title: "Remove repeated reads", description: "Prepare cached public copies. Let one request refresh a missing copy instead of thousands.", details: ["Separate public content from viewer-specific data.", "Measure requests reaching the DB and cache response time, not only hit rate."] },
  { number: "03", title: "Prepare the write redesign", description: "Test stable reaction buckets, retry handling, and background count updates away from incident traffic.", details: ["Confirm that bucket keys can use additional physical capacity.", "Define how users see pending actions and delayed public counts."] },
  { number: "04", title: "Roll out and verify", description: "Move a small set of posts using versioned routing before expanding the rollout.", details: ["Copy existing reactions, catch up new changes, and compare results.", "Stop old writers at handoff; test rollback without losing newer writes."] },
];
export const tradeoffs = [
  ["Edge + local read cache", "Cuts repeated origin work", "Staleness, memory duplication, and invalidation obligations"],
  ["Stable write buckets", "Parallel independent mutations", "Read fanout, aggregation, and routing migration complexity"],
  ["Asynchronous counters", "Avoids a synchronous shared-row update", "Displayed counts lag; authoritative membership must remain correct"],
  ["Reserved celebrity-post resources", "Protects ordinary users", "Extra operational capacity; the hot key still needs a scalable design"],
  ["Hybrid feed delivery", "Avoids immediate fanout to every celebrity follower", "More work on feed reads and merge complexity"],
  ["Strict total order per post", "Simple global sequence semantics", "A serial bottleneck remains; parallel buckets cannot preserve it for free"],
];
export const failureModes = [
  ["Cache stampede", "Misses and origin RPS spike together", "Single-flight refresh, jitter, bounded stale serving, origin admission control"],
  ["Redis becomes the new hot shard", "One key dominates bytes or operations", "Process-local caching and replicated read copies where staleness is allowed"],
  ["Duplicate or reordered actions", "Count drift or like/unlike reversals", "Stable operation IDs, idempotent state updates, per-user versions, reconciliation"],
  ["Salted keys hit the same physical shard", "Logical buckets multiply but node skew remains", "Inspect actual placement and benchmark; bucket count is not a capacity guarantee"],
  ["Unbounded event backlog", "Oldest-event age rises continuously", "Backpressure and admission limits; add actual drain capacity"],
  ["Migration splits ownership", "Old and new routes accept conflicting writes", "Versioned routing, fenced handoff, checkpoints, and explicit rollback semantics"],
];
export const expectations: LevelData[] = [
  { title: "MID", description: "Recognize skew and separate read load from write load.", items: ["Use per-partition metrics rather than averages", "Explain caching and why more servers do not split one key", "Identify freshness and correctness requirements"] },
  { title: "SENIOR", description: "Design a working relief path with explicit consistency boundaries.", items: ["Choose stable shard keys and idempotent mutations", "Address stampedes, read fanout, and ordering", "Plan canary migration and bounded queues"] },
  { title: "STAFF", description: "Own celebrity traffic as a recurring system behavior.", items: ["Model fanout and downstream index bottlenecks", "Set per-key budgets, isolation, and operational ownership", "Account for resharding, regional behavior, and long-term cost"] },
];
export const followUps: ExpandableQA[] = [
  { question: "Why not just add more partitions?", answer: "That helps if several independent busy keys can be moved apart. One popular post key still routes to one partition unless its layout or access pattern changes. First avoid repeated reads; then split independent reaction records, checking that the buckets have enough physical capacity." },
  { question: "How do you preserve post-like and unlike ordering?", answer: "Always locate the same user's reaction consistently. Give accepted changes a reliable sequence or use conditional updates against the stored version, so an old action cannot overwrite newer intent. The service must define ordering across devices. Stable bucket routing alone does not guarantee it." },
  { question: "What if we need an exact post-like count?", answer: "We need a consistent view of all reactions at one point in time. Reading bucket totals one after another while users are changing reactions does not automatically provide that. Use suitable snapshot reads or coordination, and account for the cost. Keep this requirement distinct from a fast public display that may lag." },
  { question: "What changes if it is a Kafka partition?", answer: "Find which event key is producing the busiest partition and measure how far consumers are falling behind. Spread independent users across event keys only if their required ordering allows it. In an ordinary consumer group, adding consumers does not let several consumers independently own the same partition. Database caching does not fix this event-processing bottleneck." },
  { question: "Does a timestamp bucket solve a sudden spike?", answer: "Not by itself: every new comment can land in the same current time bucket. A stable hash within each time window can spread writes, but reading the comments then needs a plan to fetch and merge those buckets." },
];
