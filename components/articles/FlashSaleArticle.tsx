import { BlueprintArticleFrame, BlueprintPanel } from "./BlueprintArticleFrame";
import neo from "@/components/Neo.module.css";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CodeBlock } from "@/components/CodeBlock";
import { ExecutiveBlueprint } from "@/components/ExecutiveBlueprint";
import { InlineCheck } from "@/components/InlineCheck";
import { SectionHeader } from "@/components/SectionHeader";
import { MetricTable } from "@/components/MetricTable";
import { InsightCard } from "@/components/InsightCard";
import { ProblemStatement } from "@/components/ProblemStatement";
import { FailureCallout } from "@/components/doodle/FailureCallout";
import { NaiveFlashSaleDiagram } from "@/components/diagrams/NaiveFlashSaleDiagram";
import { FlashSaleArchitectureDiagram } from "@/components/diagrams/FlashSaleArchitectureDiagram";
import { InventoryRaceDiagram } from "@/components/diagrams/InventoryRaceDiagram";
import { ReservationFlowDiagram } from "@/components/diagrams/ReservationFlowDiagram";
import { FlashSaleLab } from "@/components/FlashSaleLab";
import { InPractice } from "@/components/InPractice";
import { FlashSaleFunnelMotion } from "@/components/diagrams/MotionDiagrams";

import * as article from "@/data/topics/survive-flash-sale";
import { articleToc } from "@/data/topics/article-format";
import { FailuresSection, FollowUpsSection, InterviewSection, RunbookSection, ScaleSection, SourcesSection, TradeoffsSection } from "./BlueprintSections";

const FLASH_SALE_WRONG_ANSWERS = [
  {
    question: "Why not rely on Kubernetes Horizontal Pod Autoscaler (HPA)?",
    explanation:
      "Kubernetes HPA takes 45–90 seconds to observe metrics and spin up new pod containers. At 10,000 admitted requests per second, the 10,000 iPhones are reserved in about one second. The spike is completely over before the first new pod reaches ready status.",
  },
  {
    question: "Why not process payments before deducting stock?",
    explanation:
      "External payment gateways (Stripe, Adyen) take 1,500–3,000ms per transaction. Bombarding them with 2,000,000 concurrent API calls triggers rate limits and causes thousands of cards to be billed for items that just sold out.",
  },
  {
    question: "Why not let stock go negative and cancel excess orders?",
    explanation:
      "Selling 10,500 items when you only have 10,000 units requires canceling 500 orders post-sale. This creates credit card chargeback penalties, PR outrage, and legal liabilities. Zero overselling must be an inviolable invariant.",
  },
];

const FLASH_SALE_WHITEBOARD = [
  { label: "1. Funnel Edge", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { label: "2. Queue Token", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { label: "3. Redis Lua", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "4. Kafka Buffer", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "5. DB Settlement", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { label: "6. Reconciliation", color: "bg-purple-50 text-purple-700 border-purple-200" },
];

const FLASH_SALE_RUNBOOK = [
  "Before the start, pre-warm capacity and load-test the whole funnel. Autoscaling cannot react to a spike that is over in seconds.",
  "Open the waiting room before the start and admit buyers at the drip rate the inventory gate was tested for.",
  "Watch the Redis inventory node's CPU, latency, and remaining stock. If the stock key saturates its node, short-circuit requests locally once stock reaches zero.",
  "If Redis fails, trip the circuit breaker and reject checkouts with a clear retry message. Never fall back to the database for reservations.",
  "Watch settlement-queue lag and the reservation sweeper. Expired holds must return to stock within the TTL.",
  "After the sale, reconcile Redis holds, committed orders, and payments, and refund any order beyond the available stock.",
];

const FLASH_SALE_SOURCES: [label: string, href: string][] = [
  ["Redis: Scripting with Lua", "https://redis.io/docs/latest/develop/programmability/eval-intro/"],
  ["Redis: Replication", "https://redis.io/docs/latest/operate/oss_and_stack/management/replication/"],
  ["Redis: WAIT", "https://redis.io/docs/latest/commands/wait/"],
  ["Queue-it: How the virtual waiting room works", "https://queue-it.com/how-does-queue-it-work/"],
  ["AWS Builders' Library: Using load shedding to avoid overload", "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/"],
];

const toc = articleToc({
  problem: "Ten million buyers, ten thousand units",
  naive: "Why row locks collapse under the rush",
  "mental-model": "Admit first, settle later",
  architecture: "Funnel buyers into an atomic reservation",
  "worked-example": "Explore the sale",
  scale: "What breaks at ten times the buyers?",
});

export function FlashSaleArticle() {
  const {
    scenarioMetrics,
    inventoryApproaches,
    keyTradeoffs,
    failureModes,
    failureExplanations,
    tenXProblems,
    avoidList,
    interviewAnswer,
    levelExpectations,
    followUpQuestions,
    relatedTopics,
    saleStrategies,
  } = article;

  return (
    <BlueprintArticleFrame topicId="flash-sale" toc={toc} brief={
      <ExecutiveBlueprint
          timeToRead="30-Second Architecture Blueprint"
          bottleneck="10M concurrent users hit a single inventory counter at 12:00:00 PM (~2M RPS). Relational row locks serialize, starving database connection pools in 5ms."
          solution="Multi-Tier Admission Funnel: Edge Virtual Waiting Room sheds most traffic ➔ In-memory atomic Redis Lua script reserves stock with 10m TTL ➔ Kafka buffers DB settlement."
          goldenRule="Never allow incoming traffic to touch relational storage during the sale; decouple in-memory reservation from asynchronous payment settlement."
          keyMetrics={[
            { label: "Available Stock", value: "Strictly 10,000 units (0 overselling)" },
            { label: "Edge Admission Drip", value: "10,000 req/s to backend" },
            { label: "Reservation TTL", value: "10 minutes auto-restock" },
          ]}
        />
    }>

            {/* ── 01 — Problem & Live Simulator ─────────────── */}
            <section id="problem" className="scroll-mt-16">
              <SectionHeader number="01" title="Ten million buyers, ten thousand units" id="problem" />
              <ProblemStatement>
                <p>
                  An e-commerce retailer is launching a high-profile flash sale: <strong>10,000 discounted iPhone units</strong> made available to a waiting audience of <strong>10 million users</strong> at exactly 12:00:00 PM.
                </p>
                <p className="font-sans text-base text-slate-900 font-semibold mb-0">
                  &ldquo;When 10 million concurrent buyers hit one row, the database isn&apos;t slow — it&apos;s mathematically serialized.&rdquo;
                </p>
              </ProblemStatement>

              <div className="my-5">
                <MetricTable
                  rows={scenarioMetrics}
                  sideNote="All 10,000 units are reserved in about a second of admitted traffic. The challenge is 9.99M rejections without taking down the infrastructure."
                />
              </div>
            </section>

            {/* ── 02 — The Naive Row-Lock Trap ──────────────── */}
            <section id="naive" className="scroll-mt-16">
              <SectionHeader number="02" title="Why row locks collapse under the rush" id="naive" />
              <p className="text-slate-700 leading-relaxed">
                The most intuitive approach is writing directly to the relational database with an ACID transaction and row-level locking:
              </p>
              <CodeBlock
                language="sql"
                filename="naive-transaction.sql"
                code={`BEGIN TRANSACTION;
SELECT stock FROM items WHERE id = ? FOR UPDATE;
-- if stock > 0:
UPDATE items SET stock = stock - 1 WHERE id = ?;
INSERT INTO orders (user_id, item_id) VALUES (?, ?);
COMMIT;`}
              />

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><NaiveFlashSaleDiagram /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <FailureCallout title="Wait... lock contention and connection pool exhaustion occur in milliseconds!">
                The lock does its job: it never oversells. But it lets exactly one transaction touch the row at a time, so every other buyer waits while holding a database connection. With 2,000,000 requests per second arriving and a pool of 50–200 connections, the pool is exhausted almost immediately, and every other service sharing the database starts timing out. The failure is throughput, not correctness.
              </FailureCallout>

              <InlineCheck
                className={neo.conceptCheck}
                question="Architectural Gut Check · The Read Replica Illusion: Why can't we just scale read replicas to absorb the 2,000,000 RPS surge during the flash sale launch?"
                options={[
                  {
                    label: "Read replicas solve it, provided you balance incoming requests with round-robin DNS.",
                    isCorrect: false,
                    explanation: "Purchasing is fundamentally a WRITE operation! Every buy attempt decrements a shared inventory counter. Read replicas cannot process writes; all 2,000,000 RPS funnel straight to the single primary database writer.",
                  },
                  {
                    label: "Replicas only scale reads; purchasing is write contention on a single shared row.",
                    isCorrect: true,
                    explanation: "Spot on! Ten million buyers are competing to update the exact same row. Read replicas do nothing for write locks. The primary database connection pool exhausts in 5 milliseconds, causing cascading 504 gateway timeouts.",
                  },
                  {
                    label: "Read replicas cannot execute ACID transactions in PostgreSQL.",
                    isCorrect: false,
                    explanation: "Replicas can execute read-only transactions, but they are prohibited from executing row updates.",
                  },
                ]}
              />
            </section>

            {/* ── 03 — Core Mental Model ────────────────────── */}
            <section id="mental-model" className="scroll-mt-16">
              <SectionHeader number="03" title="Admit first, settle later" id="mental-model" />
              <ScrollReveal>
                <InsightCard title="The Architectural Invariant">
                  A flash sale is an <strong>admission control problem</strong> followed by a <strong>reservation reconciliation problem</strong>.
                </InsightCard>
              </ScrollReveal>
              <p className="text-slate-700 leading-relaxed">
                Do not let 10 million buyers touch your transaction layer. First, shed most of the traffic at the edge and queue layers using cryptographically signed admission tokens. Second, serialize the final 10,000 item allocations in memory using an atomic Lua script in Redis. Third, confirm orders asynchronously via decoupled Kafka queues.
              </p>
            </section>

            {/* ── 04 — Funnel Pipeline & Lua Gate ───────────── */}
            <section id="architecture" className="scroll-mt-16">
              <SectionHeader number="04" title="Funnel buyers into an atomic reservation" id="architecture" />
              <p className="text-slate-700 leading-relaxed mb-4">
                The diagram below illustrates the progressive filtering funnel. Each layer sheds an order of magnitude of pressure before requests ever touch relational storage:
              </p>

              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><FlashSaleArchitectureDiagram /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <FlashSaleFunnelMotion />

              {/* 4 Clean Strategy Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                {saleStrategies.map((s) => (
                  <div
                    key={s.name}
                    className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <h4 className="font-sans text-sm sm:text-base font-bold text-slate-900 m-0">
                        {s.name}
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-0 font-sans">
                      {s.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* 10-Minute Hold Lifecycle */}
              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><ReservationFlowDiagram /></BlueprintPanel>
                </ScrollReveal>
              </div>

              {/* Concurrency Interleaving & Lua Solution */}
              <div className="my-6">
                <ScrollReveal>
                  <BlueprintPanel kind="diagram"><InventoryRaceDiagram /></BlueprintPanel>
                </ScrollReveal>
              </div>

              <CodeBlock
                language="lua"
                filename="redis-atomic-gate.lua"
                code={`-- KEYS[1]: 'stock:iphone_16'
-- KEYS[2]: 'holds:iphone_16'  (sorted set: user_id -> expiry time)
-- ARGV[1]: user_id
-- ARGV[2]: expires_at_ms (now + 10 minutes, computed by the caller)

-- 1. Idempotency: the same user clicking Buy twice keeps one hold
if redis.call('zscore', KEYS[2], ARGV[1]) then
    return 2 -- Already reserved
end

-- 2. Atomically verify and decrement available stock
local current_stock = tonumber(redis.call('get', KEYS[1]))
if current_stock and current_stock > 0 then
    redis.call('decr', KEYS[1])
    redis.call('zadd', KEYS[2], ARGV[2], ARGV[1])
    return 1 -- Success: 1 unit held until expires_at_ms
else
    return 0 -- Sold out: shed request immediately
end`}
              />

              <p className="reading-copy">Expired holds need a reliable way back into stock. Redis keyspace expiry events are fire-and-forget and can arrive late, so they cannot be the release mechanism. Instead, each hold is a member of a sorted set scored by its expiry time. A sweeper reads members whose score has passed and releases each one with a single <code>ZREM</code>; only if that removal succeeds does it add the unit back with <code>INCR</code>. Payment confirmation removes the same member first. Whichever action removes the hold wins, so a unit can never be both paid for and returned to stock.</p>

              <CodeBlock
                language="lua"
                filename="release-expired-hold.lua"
                code={`-- KEYS[1]: 'stock:iphone_16'   KEYS[2]: 'holds:iphone_16'
-- ARGV[1]: user_id               ARGV[2]: now_ms
local expires = tonumber(redis.call('zscore', KEYS[2], ARGV[1]))
if expires and expires <= tonumber(ARGV[2]) then
    redis.call('zrem', KEYS[2], ARGV[1])
    redis.call('incr', KEYS[1])
    return 1 -- Released: the next buyer can reserve it
end
return 0 -- Already paid, already released, or not yet expired`}
              />

              <p className="reading-copy">Redis is the fast gate, not the source of truth. Settlement workers write each order with a conditional update, <code>UPDATE inventory SET stock = stock - 1 WHERE item_id = ? AND stock &gt; 0</code>, and treat zero affected rows as &ldquo;sold out&rdquo;. That single statement cannot oversell, so it remains the final guard if a Redis failover ever resurrects a sold unit. After the sale, reconcile Redis holds, orders, and payments, and refund any mismatch.</p>

              <p className="reading-copy">Fairness belongs in the waiting room. Commercial waiting rooms such as Queue-it give everyone who arrived before the start time a random place in line, so refreshing early or running bots gives no advantage. Buyers who arrive after the start join the back of the queue in order.</p>

              <InPractice
                title="Real sales shed load before it reaches stock"
                points={[
                  "Queue-it's waiting room can give early arrivals a random place in line, then sends visitors on to the store at a rate the store chooses. The store's servers only see the outflow, never the full rush.",
                  "Amazon's Builders' Library advises rejecting excess requests early and cheaply, so a server spends its capacity finishing the work it accepted instead of starting work that will time out.",
                  "Redis runs a Lua script atomically: no other command runs while it executes, so the stock check and the decrement cannot interleave. Replication is asynchronous, and even `WAIT` does not stop a failover from losing acknowledged writes, which is why the database keeps the final guard.",
                ]}
                sources={FLASH_SALE_SOURCES}
              />

              <InlineCheck
                className={neo.conceptCheck}
                question="Architectural Gut Check · The Redis Failover Trap: Redis handles the 10,000 decrements in memory. If your Redis Primary crashes and Sentinel promotes a replica, what risk emerges?"
                options={[
                  {
                    label: "No risk — Redis replication is synchronous and guarantees zero data loss.",
                    isCorrect: false,
                    explanation: "Standard Redis replication is asynchronous for maximum write speed. If the primary crashes before in-flight replication packets reach the replica, the promoted replica will still show available stock, leading to duplicate allocations and overselling.",
                  },
                  {
                    label: "Asynchronous replication lag between master and replica can resurrect sold stock, causing overselling.",
                    isCorrect: true,
                    explanation: "Spot on! If the primary decrements from 1 to 0 and crashes before replicating to the standby, the replica is promoted with stock = 1. A new buyer claims that unit, resulting in 10,001 sold units. Production systems hold back a safety buffer (for example, allocate 9,800 of 10,000 units) and keep a conditional database update as the final guard. Redis WAIT lowers the risk but does not remove it: Redis failover can still lose acknowledged writes.",
                  },
                  {
                    label: "Redis Sentinel locks all client connections until the primary reboots.",
                    isCorrect: false,
                    explanation: "Sentinel promotes the replica to become the new primary immediately, without waiting for the crashed node to reboot.",
                  },
                ]}
              />
            </section>

            {/* ── 05 — Experiment ─────────────────────────────── */}
            <section id="worked-example" className="scroll-mt-16">
              <SectionHeader number="05" title="Explore the sale" id="worked-example" />
              <p className="text-slate-700 leading-relaxed">
                Raise peak demand and the admission drip, then change the stock, abandonment rate, and reservation TTL. Watch where the funnel sheds load and how many units return to stock.
              </p>
              <BlueprintPanel id="workbench"><FlashSaleLab /></BlueprintPanel>
            </section>

            <RunbookSection steps={FLASH_SALE_RUNBOOK} />
            <TradeoffsSection tables={[
              { caption: "Inventory concurrency approaches", headers: ["Approach", "Advantage", "Risk"], rows: inventoryApproaches },
              { caption: "Funnel decisions", headers: ["Decision", "Benefit", "Cost"], rows: keyTradeoffs },
            ]} />
            <FailuresSection failures={failureModes.map(([title, signal, response]) => ({ title, signal, response, explanation: failureExplanations[title] }))} />
            <ScaleSection
              title="What breaks at ten times the buyers?"
              paragraphs={["With 100 million buyers and 100,000 units, every tier of the funnel meets a new limit:"]}
              items={tenXProblems}
            />
            <InterviewSection
              answer={interviewAnswer}
              levels={levelExpectations}
              wrongAnswers={FLASH_SALE_WRONG_ANSWERS}
              traps={avoidList}
              whiteboardChain={FLASH_SALE_WHITEBOARD}
            />
            <FollowUpsSection items={followUpQuestions.map(({ question, answer }) => [question, answer])} />
            <SourcesSection
              topicId="flash-sale"
              sources={FLASH_SALE_SOURCES}
              quiz={{ title: "The 10M-user flash sale", questions: article.judgmentQuiz, href: "/topics/traffic/survive-flash-sale/quiz" }}
              related={relatedTopics}
            />
    </BlueprintArticleFrame>
  );
}
