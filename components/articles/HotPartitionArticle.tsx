import { BlueprintArticleFrame, BlueprintPanel } from "./BlueprintArticleFrame";
import neo from "@/components/Neo.module.css";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ArticleNav } from "@/components/ArticleNav";
import { SectionHeader } from "@/components/SectionHeader";
import { MetricTable } from "@/components/MetricTable";
import { InsightCard } from "@/components/InsightCard";
import { ProblemStatement } from "@/components/ProblemStatement";
import { RelatedTopics } from "@/components/RelatedTopics";
import { HotPartitionLab } from "@/components/HotPartitionLab";
import { HotPartitionDiagram } from "@/components/diagrams/HotPartitionDiagram";
import { HotPartitionFlow } from "@/components/diagrams/HotPartitionFlow";
import { CodeBlock } from "@/components/CodeBlock";
import { ExecutiveBlueprint } from "@/components/ExecutiveBlueprint";
import { InlineCheck } from "@/components/InlineCheck";
import {
  DatabaseRequestGate,
  ReactionKeyExample,
  ReactionRetryExample,
  ReactionMigrationExample,
  CommentReadExample,
} from "@/components/diagrams/HotPartitionWorkedExamples";
import { getTopicById } from "@/data/topics/catalog";
import { ArticleQuizEntry } from "@/components/ArticleQuizEntry";
import { TradeoffDiagnosticsHub } from "@/components/TradeoffDiagnosticsHub";
import { CareerRubricHub } from "@/components/CareerRubricHub";
import {
  tocItems,
  scenarioMetrics,
  tradeoffs,
  failureModes,
  expectations,
  followUps,
  judgmentQuiz,
} from "@/data/topics/fix-hot-partition";

const HOT_PARTITION_TRAPS = [
  {
    trapNum: "TRAP 01",
    question: "Why not double database partitions from 16 to 32?",
    explanation:
      "Partition key routing maps the single celebrity post_id to a single node. If 70,000 requests per second target that one key, all 70,000 still land on whatever single node owns that key. Adding partitions divides unrelated keys, not a single hot key.",
  },
  {
    trapNum: "TRAP 02",
    question: "Why not cache writes in a single Redis key before the DB?",
    explanation:
      "Writing all 70,000 likes/sec directly to a single Redis key simply relocates the hot partition from PostgreSQL to Redis. A single Redis key will saturate its single CPU core event loop and its 1Gbps network NIC.",
  },
  {
    trapNum: "TRAP 03",
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

Second, for write contention (likes and reactions), split the single hot counter into N salted buckets (e.g. post_id + salt[0..9]), routing by user_id % N. This converts one serial bottleneck into N independent parallel writes.

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

export function HotPartitionArticle() {
  const relatedTopics = ["database-migration", "flash-sale"].map((id) => {
    const topic = getTopicById(id as "database-migration" | "flash-sale");
    return { title: topic.meta.title, category: topic.meta.category, href: topic.href };
  });

  return (
    <BlueprintArticleFrame topicId="hot-partition" toc={tocItems} brief={
      <ExecutiveBlueprint
          timeToRead="30-Second Architecture Blueprint"
          bottleneck="A viral post concentrates 70,000 requests/sec onto a single database partition key. Doubling partitions does not help because all traffic shares the exact same key."
          solution="Dual-Path Split: Cache 100% of public post body reads at the edge with single-flight mutexes ➔ Salt write keys with user_id % 10 into 10 parallel buckets ➔ Asynchronously aggregate public totals in the background."
          goldenRule="Never try to scale a single hot key by adding database servers; split the key on the write path and cache it on the read path."
          keyMetrics={[
            { label: "Hot Key Traffic", value: "70% of total cluster load" },
            { label: "Salt Spread", value: "10-way parallel buckets" },
            { label: "Read Reduction", value: "99% absorbed at cache layer" },
          ]}
        />
    }>

            {/* ── 01 — Skew & Scale Anatomy + Live Lab ───────── */}
            <section id="the-problem" className="scroll-mt-16">
              <SectionHeader
                number="01"
                title="The Production Constraint: The Celebrity Post Skew"
                id="the-problem"
                annotation="70,000 RPS on 1 Node"
              />
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

              {/* Interactive Partition Skew Simulator */}
              <BlueprintPanel id="workbench"><HotPartitionLab /></BlueprintPanel>
            </section>

            {/* ── 02 — The Obvious Mistake & Gut Check ───────── */}
            <section id="the-mistake" className="scroll-mt-16">
              <SectionHeader
                number="02"
                title="The Obvious Mistake: Scaling Nodes Without Changing Keys"
                id="the-mistake"
              />
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
            </section>

            {/* ── 03 — Core Mental Model ─────────────────────── */}
            <section id="mental-model" className="scroll-mt-16">
              <SectionHeader
                number="03"
                title="The Core Mental Model: Reuse Reads, Distribute Writes"
                id="mental-model"
              />
              <ScrollReveal>
                <InsightCard title="The Architectural Invariant">
                  One popular post creates two completely different kinds of work: <strong>identical public reads</strong> and <strong>independent user writes</strong>. Conflating them is why systems collapse.
                </InsightCard>
              </ScrollReveal>
              <p className="text-slate-700 leading-relaxed">
                Public reads (reading post text) are identical across millions of users: cache them once and coalesce refreshes. User writes (likes, unlikes, comments) are independent: salt the counter key across 10 buckets so each write lands on a different physical partition.
              </p>
            </section>

            {/* ── 04 — Read & Write Sharding Architecture ────── */}
            <section id="architecture" className="scroll-mt-16">
              <SectionHeader
                number="04"
                title="Dual-Path Architecture & Sharding Design"
                id="architecture"
                annotation="Salted Buckets [0..9]"
              />
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
                code={`// Write Path: Salt counter across 10 buckets using user_id
const BUCKET_COUNT = 10;
const bucketIndex = Math.abs(hash(userId)) % BUCKET_COUNT;
const shardKey = \`post:\${postId}:likes:bucket:\${bucketIndex}\`;

await redis.incr(shardKey);

// Approach A (Scatter-Gather): Query all 10 shards in parallel and sum (10x read IOPS)
// Approach B (Async Aggregator - Recommended): A background worker streams CDC deltas
// from the 10 shards and updates a single cached counter in Redis every 500ms.`}
              />

              <InlineCheck
                className={neo.conceptCheck}
                question="Architectural Gut Check: What breaks if we calculate the bucket using random() instead of user_id % 10?"
                options={[
                  {
                    label: "Random salting makes un-liking and idempotency checks impossible without querying all 10 buckets.",
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

            {/* ── 05 — Trade-offs, Runbook & Traps Hub ───────── */}
            <section id="tradeoffs-hub" className="scroll-mt-16">
              <SectionHeader
                number="05"
                title="Trade-offs, Incident Runbook & Production Traps"
                id="tradeoffs-hub"
                annotation="Decision Matrix"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                Compare partition sharding strategies, study failure modes under load, and review the classic traps that cause hot partition outages:
              </p>

              <ScrollReveal>
                <BlueprintPanel kind="detail"><TradeoffDiagnosticsHub
                  approachesTitle="1. Read & Write Partitioning Decisions"
                  approachesHeaders={["Decision", "What Improves", "What We Now Own"]}
                  approachesRows={tradeoffs}
                  keyTradeoffsTitle="2. Key Architectural Invariants"
                  keyTradeoffsHeaders={["Decision", "Benefit", "Cost / Risk"]}
                  keyTradeoffsRows={[
                    ["Edge + Cache Reads", "Cuts 99% repeated origin work", "Staleness, memory, and cache-outage protection"],
                    ["Bucket User Reactions", "Parallel independent writes", "Placement checks, routing versions, and migration"],
                    ["Asynchronous Counters", "Zero synchronous row locks", "Displayed counts lag; exact totals require reconciliation"],
                  ]}
                  failureModesTitle="Hot Partition Failure Modes & Telemetry Runbook"
                  failureModesHeaders={["Failure Mode", "Detection Signal", "Operational Response & Mitigation"]}
                  failureModesRows={failureModes}
                  trapsTitle="The 3 Classic Hot Partition Traps"
                  traps={HOT_PARTITION_TRAPS}
                  tenXTitle="What Happens at 10× Scale (1M RPS / Celebrity Fanout)?"
                  tenXProblems={HOT_PARTITION_TEN_X}
                  avoidTitle="⚠️ Anti-patterns that guarantee partition throttling:"
                  avoidList={HOT_PARTITION_AVOID}
                /></BlueprintPanel>
              </ScrollReveal>
            </section>

            {/* ── 06 — Staff+ Interview & Career Rubric ──────── */}
            <section id="career-rubric" className="scroll-mt-16">
              <SectionHeader
                number="06"
                title="Engineering Level Rubric & Interview Synthesis"
                id="career-rubric"
                annotation="L4 to Staff Evaluation"
              />
              <p className="text-slate-700 leading-relaxed mb-4">
                How interviewers evaluate partition skew design across engineering seniority levels, complete with verbal synthesis and follow-up probing questions:
              </p>

              <ScrollReveal>
                <BlueprintPanel kind="detail"><CareerRubricHub
                  initiallyExpanded={false}
                  interviewAnswer={HOT_PARTITION_INTERVIEW_SYNTHESIS}
                  levelExpectations={expectations}
                  followUpQuestions={followUps}
                  whiteboardChain={HOT_PARTITION_WHITEBOARD}
                /></BlueprintPanel>
              </ScrollReveal>
            </section>

            {/* ── 07 — Judgment Quiz ────────────────────────── */}
            {judgmentQuiz && (
              <section id="judgment-quiz" className="scroll-mt-16">
                <SectionHeader
                  number="07"
                  title="Test Your Judgment: Hot Partition Sharding"
                  id="judgment-quiz"
                />
                <ScrollReveal>
                  <ArticleQuizEntry
                    quizHref="/topics/traffic/fix-hot-partition/quiz"
                    title="Hot Partition Sharding Judgment Test"
                    questions={judgmentQuiz}
                  />
                </ScrollReveal>
              </section>
            )}

            {/* ── 08 — Related Architectures ────────────────── */}
            <section id="related" className="scroll-mt-16 pt-4">
              <SectionHeader
                number="08"
                title="Related System Architecture Deep Dives"
                id="related"
              />
              <RelatedTopics topics={relatedTopics} />
              <div className="mt-8">
                <ArticleNav currentId="hot-partition" />
              </div>
            </section>
    </BlueprintArticleFrame>
  );
}
