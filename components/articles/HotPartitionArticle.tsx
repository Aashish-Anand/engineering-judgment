import { BlueprintArticleFrame, BlueprintPanel } from "./BlueprintArticleFrame";
import neo from "@/components/Neo.module.css";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SectionHeader } from "@/components/SectionHeader";
import { MetricTable } from "@/components/MetricTable";
import { InsightCard } from "@/components/InsightCard";
import { ProblemStatement } from "@/components/ProblemStatement";
import { HotPartitionLab } from "@/components/HotPartitionLab";
import { HotPartitionDiagram } from "@/components/diagrams/HotPartitionDiagram";
import { HotPartitionFlow } from "@/components/diagrams/HotPartitionFlow";
import { CodeBlock } from "@/components/CodeBlock";
import { InPractice } from "@/components/InPractice";
import { ExecutiveBlueprint } from "@/components/ExecutiveBlueprint";
import { InlineCheck } from "@/components/InlineCheck";
import {
  DatabaseRequestGate,
  ReactionKeyExample,
  ReactionRetryExample,
  ReactionMigrationExample,
  CommentReadExample,
} from "@/components/diagrams/HotPartitionWorkedExamples";
import {
  scenarioMetrics,
  tradeoffs,
  failureModes,
  expectations,
  followUps,
  judgmentQuiz,
} from "@/data/topics/fix-hot-partition";
import { articleToc } from "@/data/topics/article-format";
import { FailuresSection, FollowUpsSection, InterviewSection, RunbookSection, ScaleSection, SourcesSection, TradeoffsSection } from "./BlueprintSections";

const HOT_PARTITION_WRONG_ANSWERS = [
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
];

const HOT_PARTITION_WHITEBOARD = [
  { label: "1. Detect Skew", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { label: "2. Cache Public Reads", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "3. Salt Write Keys [0..9]", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "4. Per-User Deduplication", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { label: "5. Async Aggregation", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { label: "6. Canary Migration", color: "bg-purple-50 text-purple-700 border-purple-200" },
];

const HOT_PARTITION_INTERVIEW_SYNTHESIS = `When a celebrity post creates an extreme traffic hotspot, recognize immediately that adding database partitions does not help: all traffic targets the same partition key.

First, separate the workload into reads and writes. Public post body reads (~70,000 RPS) must never touch the database—they must be served from an edge/Redis cache with single-flight request coalescing to prevent stampedes.

Second, for write contention (likes and reactions), split the single hot counter into N salted buckets (e.g. post_id + salt[0..7]), routing by user_id % N. This converts one serial bottleneck into N independent parallel writes.

Third, display approximate counts asynchronously: a background worker lazily aggregates the bucket counters into a cached display total, saving 99% of read IOPS while ensuring authoritative user mutations remain durable.`;

const HOT_PARTITION_TEN_X = [
  "Redis cluster single-node NIC saturation (>200K packets/sec); requires client-side local in-memory caches.",
  "Fan-out on celebrity publication causing million-event Kafka consumer lag; requires pull-based hybrid feed models.",
  "Scatter-gather read latency degradation when merging comments across 32 shards; requires denormalized timeline feeds.",
  "Secondary index hotspots where follower activity concentrates on a single downstream index table.",
];

const HOT_PARTITION_AVOID = [
  "Looking only at cluster average CPU or IOPS instead of per-partition percentile skew.",
  "Writing all mutations to a single unsalted Redis key under the illusion that Redis is infinite.",
  "Executing scatter-gather parallel queries across all buckets on user-facing read paths.",
  "Changing key sharding formulas in production without versioned routing and dual-write replay.",
];

const HOT_PARTITION_RUNBOOK = [
  "Confirm the skew per partition: compare request rate, p99 latency, throttling, and queue age for each partition. Cluster averages hide one overloaded node.",
  "Find the key. Sample the top keys; if one post_id dominates, adding partitions will not move its load.",
  "Split the traffic into post-body reads, counter reads, reaction writes, comments, and fanout jobs. Each needs a different remedy.",
  "Relieve reads first: serve the post body from cache with single-flight refresh and bounded stale serving, so cache misses cannot stampede the origin.",
  "Spread writes: route reactions to stable user-hashed buckets, check that the buckets sit on different physical partitions, and move the displayed count to asynchronous aggregation.",
  "Watch for amplification from retries, cache misses, and follower fanout until every partition stays under its benchmarked limit.",
];

const HOT_PARTITION_SOURCES: [label: string, href: string][] = [
  ["AWS: DynamoDB partition key design", "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html"],
  ["AWS: Choosing the number of shards", "https://aws.amazon.com/blogs/database/choosing-the-right-number-of-shards-for-your-large-scale-amazon-dynamodb-table"],
  ["AWS: Contributor Insights for DynamoDB", "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/contributorinsights_HowItWorks.html"],
  ["Redis CLI", "https://redis.io/docs/latest/develop/tools/cli/"],
];

const toc = articleToc({
  problem: "One post receives 70% of the traffic",
  naive: "Why more partitions do not help",
  "mental-model": "Reuse reads, distribute writes",
  architecture: "Cache reads, salt writes",
  "worked-example": "Explore the skew",
  scale: "What breaks at ten times the traffic?",
});

export function HotPartitionArticle() {
  const relatedTopics = ["flash-sale", "database-migration", "retry-storm", "connection-pool"] as const;

  return (
    <BlueprintArticleFrame topicId="hot-partition" toc={toc} brief={
      <ExecutiveBlueprint
          timeToRead="30-Second Architecture Blueprint"
          bottleneck="A viral post concentrates 70,000 requests/sec onto a single database partition key. Doubling partitions does not help because all traffic shares the exact same key."
          solution="Dual-Path Split: Cache 100% of public post body reads at the edge with single-flight mutexes ➔ Salt write keys with user_id % 8 into 10 parallel buckets ➔ Asynchronously aggregate public totals in the background."
          goldenRule="Never try to scale a single hot key by adding database servers; split the key on the write path and cache it on the read path."
          keyMetrics={[
            { label: "Hot Key Traffic", value: "70% of total cluster load" },
            { label: "Salt Spread", value: "8 buckets · 8,750 writes/s each" },
            { label: "Read Reduction", value: "99% absorbed at cache layer" },
          ]}
        />
    }>

            {/* ── 01 — Skew & Scale Anatomy + Live Lab ───────── */}
            <section id="problem" className="scroll-mt-16">
              <SectionHeader number="01" title="One post receives 70% of the traffic" id="problem" />
              <ProblemStatement>
                <p>
                  Taylor Swift posts an announcement. Out of 100,000 total requests arriving each second across your 16-partition cluster, <strong>70,000 target Taylor&apos;s single post</strong>.
                </p>
                <p className="font-sans text-base text-slate-900 font-semibold mb-0">
                  &ldquo;Cluster averages lie. 15 partitions sit idle at 2,000 RPS while partition P7 is crushed under 7× its physical limit.&rdquo;
                </p>
              </ProblemStatement>

              <div className="my-5">
                <MetricTable rows={scenarioMetrics} />
              </div>
            </section>

            {/* ── 02 — The Obvious Mistake & Gut Check ───────── */}
            <section id="naive" className="scroll-mt-16">
              <SectionHeader number="02" title="Why more partitions do not help" id="naive" />
              <p className="text-slate-700 leading-relaxed">
                The immediate instinct during an incident is: <em>&ldquo;Spin up 16 more database partitions!&rdquo;</em> But partition key routing hashes <code>post_id</code>. All 70,000 RPS still map to the exact same partition:
              </p>

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><HotPartitionDiagram /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <InlineCheck
                className={neo.conceptCheck}
                question="Architectural Gut Check: What happens if we write all 70,000 likes directly to Redis under the post_id key without salting?"
                options={[
                  {
                    label: "Redis is in-memory and can easily handle 70,000 writes to a single key.",
                    isCorrect: false,
                    explanation: "Redis is single-threaded per key! 70,000 mutations/sec plus network serialization overhead pegs a single Redis core at 100% CPU and saturates 1Gbps network NICs. The hot partition simply moves from Postgres to Redis.",
                  },
                  {
                    label: "It simply relocates the hot partition to a single Redis shard, causing CPU core saturation.",
                    isCorrect: true,
                    explanation: "Spot on! In-memory data structures are fast, but a single Redis key cannot execute across multiple CPU cores or cluster nodes. You must salt keys to distribute write operations across Redis shards.",
                  },
                  {
                    label: "Redis will automatically shard the counter value across all cluster nodes.",
                    isCorrect: false,
                    explanation: "Redis clusters shard by key hash slot, not by individual counter values.",
                  },
                ]}
              />

              <InPractice
                title="Real systems publish the per-partition ceiling"
                points={[
                  "Amazon DynamoDB documents a maximum of 3,000 read units and 1,000 write units per second for every partition. One hot item cannot exceed that, however much capacity the table has.",
                  "AWS recommends write sharding for hot keys: add a suffix to the partition key so writes spread across partitions, and accept that reads must combine the shards.",
                  "Find the key before changing it. DynamoDB's CloudWatch Contributor Insights lists the most accessed and most throttled keys. For Redis, `redis-cli --hotkeys` samples hot keys, but only when `maxmemory-policy` is an LFU policy.",
                ]}
                sources={HOT_PARTITION_SOURCES}
              />
            </section>

            {/* ── 03 — Core Mental Model ─────────────────────── */}
            <section id="mental-model" className="scroll-mt-16">
              <SectionHeader number="03" title="Reuse reads, distribute writes" id="mental-model" />
              <ScrollReveal>
                <InsightCard title="The Architectural Invariant">
                  One popular post creates two completely different kinds of work: <strong>identical public reads</strong> and <strong>independent user writes</strong>. Conflating them is why systems collapse.
                </InsightCard>
              </ScrollReveal>
              <p className="text-slate-700 leading-relaxed">
                Public reads (reading post text) are identical across millions of users: cache them once and coalesce refreshes. User writes (likes, unlikes, comments) are independent: route each user to one of 8 buckets by a stable hash of their user ID. 70,000 writes per second become 8,750 per bucket, under the assumed 10,000 limit, provided the buckets land on different physical partitions.
              </p>
            </section>

            {/* ── 04 — Read & Write Sharding Architecture ────── */}
            <section id="architecture" className="scroll-mt-16">
              <SectionHeader number="04" title="Cache reads, salt writes" id="architecture" />
              <p className="text-slate-700 leading-relaxed mb-4">
                Follow each kind of work to its separate relief path:
              </p>

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><HotPartitionFlow /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><DatabaseRequestGate /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><HotPartitionFlow writes={true} /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><ReactionKeyExample /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <CodeBlock
                language="typescript"
                filename="reaction-sharder.ts"
                code={`// Write path: one durable reaction per user, routed to one of 8 buckets
const BUCKET_COUNT = 8; // 70,000 writes/s ÷ 8 = 8,750 per bucket (< 10,000 limit)
const bucket = stableHash(userId) % BUCKET_COUNT;
const partitionKey = \`post#\${postId}#b\${bucket}\`;

await db.transaction(async (tx) => {
  // Conditional write: a retried op or a late, older request changes nothing
  const changed = await tx.reactions.setIfNewer(partitionKey, userId, { liked: true, opId, version });
  // Only a real state change emits a count delta, committed with the reaction
  if (changed) await tx.outbox.insert({ postId, bucket, delta: +1, opId });
});

// Display total: a background aggregator applies deltas to a cached counter
// every ~500 ms. Never scatter-gather all 8 buckets on the read path.`}
              />

              <InlineCheck
                className={neo.conceptCheck}
                question="Architectural Gut Check: What breaks if we calculate the bucket using random() instead of user_id % 8?"
                options={[
                  {
                    label: "Random salting makes un-liking and idempotency checks impossible without querying all 8 buckets.",
                    isCorrect: true,
                    explanation: "Spot on! If Alice's like was placed into bucket 4 at random, when she later clicks 'unlike', the system has no idea which bucket holds her vote without querying every bucket. Deterministic hashing by user ID guarantees that Alice's likes and unlikes always route to the exact same bucket.",
                  },
                  {
                    label: "Random salting causes PostgreSQL to abort the transaction snapshot.",
                    isCorrect: false,
                    explanation: "Random salting doesn't cause transaction aborts; it causes state loss and inability to find records.",
                  },
                  {
                    label: "Random distribution violates Redis atomic increment constraints.",
                    isCorrect: false,
                    explanation: "Redis doesn't care about random keys, but your application can never reliably find or undo Alice's reaction.",
                  },
                ]}
              />

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><ReactionRetryExample /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><ReactionMigrationExample /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><CommentReadExample /></BlueprintPanel>
                </ScrollReveal>
              </div>
            </section>

            {/* ── 05 — Experiment ─────────────────────────────── */}
            <section id="worked-example" className="scroll-mt-16">
              <SectionHeader number="05" title="Explore the skew" id="worked-example" />
              <p className="text-slate-700 leading-relaxed">
                Switch between the read and write paths. Raise the share of reads served by cache, then spread post-like writes across more partitions, and watch when the hot partition drops under its limit.
              </p>
              <BlueprintPanel id="workbench"><HotPartitionLab /></BlueprintPanel>
            </section>

            <RunbookSection steps={HOT_PARTITION_RUNBOOK} />
            <TradeoffsSection tables={[{ caption: "Read and write partitioning decisions", headers: ["Decision", "What improves", "What we now own"], rows: tradeoffs }]} />
            <FailuresSection failures={failureModes.map(([title, signal, response]) => ({ title, signal, response }))} />
            <ScaleSection
              title="What breaks at ten times the traffic?"
              paragraphs={["At a million requests per second, or a celebrity with ten times the followers, the relief paths themselves become the next hot spots:"]}
              items={HOT_PARTITION_TEN_X}
            />
            <InterviewSection
              answer={HOT_PARTITION_INTERVIEW_SYNTHESIS}
              levels={expectations}
              wrongAnswers={HOT_PARTITION_WRONG_ANSWERS}
              traps={HOT_PARTITION_AVOID}
              whiteboardChain={HOT_PARTITION_WHITEBOARD}
            />
            <FollowUpsSection items={followUps.map(({ question, answer }) => [question, answer])} />
            <SourcesSection
              topicId="hot-partition"
              sources={HOT_PARTITION_SOURCES}
              quiz={{ title: "Hot partition sharding", questions: judgmentQuiz, href: "/topics/traffic/fix-hot-partition/quiz" }}
              related={relatedTopics}
            />
    </BlueprintArticleFrame>
  );
}
