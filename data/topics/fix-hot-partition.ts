import type { BlueprintTail } from "@/components/articles/BlueprintSections";
import { getTopicById } from "@/data/topics/catalog";
import type { TimelinePhaseData, ExpandableQA, LevelData } from "@/data/types";

export const meta = getTopicById("hot-partition").meta;
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

/** Plain-language "what happens" for each failure mode, keyed by its title. */
export const failureExplanations: Record<string, string> = {
  "Cache stampede": "The cached copy of the hot post expires, and thousands of readers miss the cache in the same instant. They all go to the database together, which is exactly the load the cache was there to stop.",
  "Redis becomes the new hot shard": "Moving the hot post into Redis moves the hotspot with it. One key lives on one Redis node, so that node's CPU or network fills up while the rest of the cluster sits idle.",
  "Duplicate or reordered actions": "Retries and spread-out buckets mean the same like can arrive twice, or an unlike can land before the like it cancels. The count slowly drifts away from what users actually did.",
  "Salted keys hit the same physical shard": "You split one key into eight buckets, but the database may still place several of them on the same machine. On paper the load is spread out; in practice one node still takes most of it.",
  "Unbounded event backlog": "Writes go into a queue faster than workers can drain it. Nothing fails right away, but the queue keeps growing and the displayed counts fall further behind every minute.",
  "Migration splits ownership": "While a key moves to a new layout, old and new code paths can both accept writes for it. Each side thinks it owns the data, and their updates overwrite each other.",
};
export const expectations: LevelData[] = [
  { title: "Mid-level", description: "Recognize skew and separate read load from write load.", items: ["Use per-partition metrics rather than averages", "Explain caching and why more servers do not split one key", "Identify freshness and correctness requirements"] },
  { title: "Senior", description: "Design a working relief path with explicit consistency boundaries.", items: ["Choose stable shard keys and idempotent mutations", "Address stampedes, read fanout, and ordering", "Plan canary migration and bounded queues"] },
  { title: "Staff", description: "Own celebrity traffic as a recurring system behavior.", items: ["Model fanout and downstream index bottlenecks", "Set per-key budgets, isolation, and operational ownership", "Account for resharding, regional behavior, and long-term cost"] },
];
export const followUps: ExpandableQA[] = [
  { question: "Why not just add more partitions?", answer: "That helps if several independent busy keys can be moved apart. One popular post key still routes to one partition unless its layout or access pattern changes. First avoid repeated reads; then split independent reaction records, checking that the buckets have enough physical capacity." },
  { question: "How do you preserve post-like and unlike ordering?", answer: "Always locate the same user's reaction consistently. Give accepted changes a reliable sequence or use conditional updates against the stored version, so an old action cannot overwrite newer intent. The service must define ordering across devices. Stable bucket routing alone does not guarantee it." },
  { question: "What if we need an exact post-like count?", answer: "We need a consistent view of all reactions at one point in time. Reading bucket totals one after another while users are changing reactions does not automatically provide that. Use suitable snapshot reads or coordination, and account for the cost. Keep this requirement distinct from a fast public display that may lag." },
  { question: "What changes if it is a Kafka partition?", answer: "Find which event key is producing the busiest partition and measure how far consumers are falling behind. Spread independent users across event keys only if their required ordering allows it. In an ordinary consumer group, adding consumers does not let several consumers independently own the same partition. Database caching does not fix this event-processing bottleneck." },
  { question: "Does a timestamp bucket solve a sudden spike?", answer: "Not by itself: every new comment can land in the same current time bucket. A stable hash within each time window can spread writes, but reading the comments then needs a plan to fetch and merge those buckets." },
];

export const judgmentQuiz = [
  {
    "scenario": "A celebrity posts an announcement. Partition P7 hits 99% CPU while all other partitions sit idle at 5%. An engineer suggests doubling database partitions from 16 to 32. What will happen?",
    "options": [
      {
        "text": "The celebrity post's partition remains 99% pegged because the entire workload shares the exact same post_id key.",
        "isCorrect": true,
        "explanation": "Correct! Partition key routing maps the single post_id to a single node. You cannot divide a single hot key simply by adding nodes without write-sharding or read caching."
      },
      {
        "text": "P7's load will immediately drop by 50% across the new partition boundaries.",
        "isCorrect": false,
        "explanation": "Adding partitions only helps when multiple distinct hot keys share a partition. If a single key (e.g. post-42) receives all traffic, it still routes to exactly one partition unless the key or access pattern itself is sharded."
      },
      {
        "text": "Database auto-rebalancing will automatically split the single post record into multiple physical fragments.",
        "isCorrect": false,
        "explanation": "Standard distributed databases partition at the record or partition-key level; they do not transparently split a single record without schema-level write sharding."
      }
    ]
  },
  {
    "scenario": "To distribute reaction writes, you shard the post counter into 16 random buckets. When showing the post's total like count to a user, how do you read the count?",
    "options": [
      {
        "text": "Read a single random bucket and multiply by 16.",
        "isCorrect": false,
        "explanation": "Random multiplication creates massive jitter and inaccurate counts for user displays."
      },
      {
        "text": "Read all 16 buckets asynchronously or use a background aggregator that periodically combines them into a cached total.",
        "isCorrect": true,
        "explanation": "Correct! Sharding writes trades cheap writes for scatter-gather reads. Combining them asynchronously into a cache avoids running 16 DB queries on every public read."
      },
      {
        "text": "Require an ACID distributed transaction across all 16 partitions for every page view.",
        "isCorrect": false,
        "explanation": "Running a distributed transaction across 16 partitions for public reads recreates an even worse system-wide bottleneck."
      }
    ]
  },
  {
    "scenario": "Most traffic to the hot post consists of identical public reads. What should you try before redesigning the write key?",
    "options": [
      {
        "text": "Salt every read key and query every shard for each request.",
        "isCorrect": false,
        "explanation": "Scatter-gather makes repeated reads more expensive. First exploit the fact that they reuse the same data."
      },
      {
        "text": "Increase the database connection pool so all readers can reach the hot partition.",
        "isCorrect": false,
        "explanation": "A larger pool sends more concurrent work to an already saturated resource."
      },
      {
        "text": "Cache the shared read result and coalesce concurrent cache misses.",
        "isCorrect": true,
        "explanation": "Cache reuse removes repeated work. Request coalescing prevents a burst of misses from overwhelming the database when a popular entry expires."
      }
    ]
  },
  {
    "scenario": "You plan to salt writes for a single account whose operations require strict per-account ordering. What must the design preserve?",
    "options": [
      {
        "text": "Operations for that account still need one ordered ownership path; independent counter sharding is not automatically suitable.",
        "isCorrect": true,
        "explanation": "Independent counters can often be merged, but ordered state transitions require an explicit ordering or coordination mechanism. Decide which invariants must survive before splitting the key."
      },
      {
        "text": "Randomly distributing each operation guarantees the same ordering at every shard.",
        "isCorrect": false,
        "explanation": "Independent queues or shards can observe and apply operations in different orders."
      },
      {
        "text": "Reading the shards more often repairs any ordering violations.",
        "isCorrect": false,
        "explanation": "Faster reads cannot undo an invalid state transition caused by out-of-order writes."
      }
    ]
  },
  {
    "scenario": "After sharding reaction writes, database load improves but the public count lags by a few seconds. Which trade-off should you explain?",
    "options": [
      {
        "text": "The shards provide a globally consistent count without any read coordination.",
        "isCorrect": false,
        "explanation": "An exact snapshot across independent shards needs additional coordination; it is not supplied by sharding alone."
      },
      {
        "text": "The design improves write distribution at the cost of aggregation work and bounded staleness in the displayed total.",
        "isCorrect": true,
        "explanation": "Background aggregation reduces scatter-gather on each read, but freshness depends on the aggregation cadence. State the acceptable staleness and monitor lag."
      },
      {
        "text": "Caching has removed the need to handle duplicate reactions.",
        "isCorrect": false,
        "explanation": "Duplicate handling is a correctness concern independent of how the count is cached."
      }
    ]
  }
];

/** Sections 06–12 of the blueprint; sections 01–05 are content/blueprints/hot-partition.mdx. */
export const blueprint: BlueprintTail = {
  runbook: {
    steps: [
      "Confirm the skew per partition: compare request rate, p99 latency, throttling, and queue age for each partition. Cluster averages hide one overloaded node.",
      "Find the key. Sample the top keys; if one post_id dominates, adding partitions will not move its load.",
      "Split the traffic into post-body reads, counter reads, reaction writes, comments, and fanout jobs. Each needs a different remedy.",
      "Relieve reads first: serve the post body from cache with single-flight refresh and bounded stale serving, so cache misses cannot stampede the origin.",
      "Spread writes: route reactions to stable user-hashed buckets, check that the buckets sit on different physical partitions, and move the displayed count to asynchronous aggregation.",
      "Watch for amplification from retries, cache misses, and follower fanout until every partition stays under its benchmarked limit.",
    ],
  },
  tradeoffs: [{ caption: "Read and write partitioning decisions", headers: ["Decision", "What improves", "What we now own"], rows: tradeoffs }],
  failures: failureModes.map(([title, signal, response]) => ({ title, signal, response, explanation: failureExplanations[title] })),
  scale: {
    paragraphs: ["At a million requests per second, or a celebrity with ten times the followers, the relief paths themselves become the next hot spots:"],
    items: [
      "Redis cluster single-node NIC saturation (>200K packets/sec); requires client-side local in-memory caches.",
      "Fan-out on celebrity publication causing million-event Kafka consumer lag; requires pull-based hybrid feed models.",
      "Scatter-gather read latency degradation when merging comments across 32 shards; requires denormalized timeline feeds.",
      "Secondary index hotspots where follower activity concentrates on a single downstream index table.",
    ],
  },
  interview: {
    answer: `When a celebrity post creates an extreme traffic hotspot, recognize immediately that adding database partitions does not help: all traffic targets the same partition key.

First, separate the workload into reads and writes. Public post body reads (~70,000 RPS) must never touch the database—they must be served from an edge/Redis cache with single-flight request coalescing to prevent stampedes.

Second, for write contention (likes and reactions), split the single hot counter into N salted buckets (e.g. post_id + salt[0..7]), routing by user_id % N. This converts one serial bottleneck into N independent parallel writes.

Third, display approximate counts asynchronously: a background worker lazily aggregates the bucket counters into a cached display total, saving 99% of read IOPS while ensuring authoritative user mutations remain durable.`,
    levels: expectations,
    wrongAnswers: [
      {
        question: "Why not double database partitions from 16 to 32?",
        explanation:
          "Partition key routing maps the single celebrity post_id to a single node. If 70,000 requests per second target that one key, all 70,000 still land on whatever single node owns that key. Adding partitions divides unrelated keys, not a single hot key.",
      },
      {
        question: "Why not cache writes in a single Redis key before the DB?",
        explanation:
          "Writing all 70,000 likes/sec directly to a single Redis key simply relocates the hot partition from PostgreSQL to Redis. A single Redis key will saturate its single CPU core event loop and its 1Gbps network NIC.",
      },
      {
        question: "Why not query all shards on every read to get real-time totals?",
        explanation:
          "Scatter-gather queries across 10 or 16 shards multiply read IOPS by 10x–16x. Under 70,000 reads/sec, fanout queries saturate database connection pools and network bandwidth immediately. Lazy asynchronous aggregation is mandatory.",
      },
    ],
    traps: [
      "Looking only at cluster average CPU or IOPS instead of per-partition percentile skew.",
      "Writing all mutations to a single unsalted Redis key under the illusion that Redis is infinite.",
      "Executing scatter-gather parallel queries across all buckets on user-facing read paths.",
      "Changing key sharding formulas in production without versioned routing and dual-write replay.",
    ],
    whiteboardChain: [
      { label: "1. Detect Skew", color: "bg-rose-50 text-rose-700 border-rose-200" },
      { label: "2. Cache Public Reads", color: "bg-blue-50 text-blue-700 border-blue-200" },
      { label: "3. Salt Write Keys [0..9]", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      { label: "4. Per-User Deduplication", color: "bg-amber-50 text-amber-800 border-amber-200" },
      { label: "5. Async Aggregation", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      { label: "6. Canary Migration", color: "bg-purple-50 text-purple-700 border-purple-200" },
    ],
  },
  followUps: followUps.map(({ question, answer }) => [question, answer]),
  quiz: { title: "Hot partition sharding", questions: judgmentQuiz, href: "/topics/traffic/fix-hot-partition/quiz" },
  related: ["flash-sale", "database-migration", "retry-storm", "connection-pool"],
};
