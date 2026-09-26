import type { TocItem, RelatedTopicData, TimelinePhaseData, LevelData, ExpandableQA } from "@/data/types";
import { getTopicById } from "@/data/topics/catalog";

export const meta = getTopicById("flash-sale").meta;

export const tocItems: TocItem[] = [
  { id: "the-problem",       label: "The Problem" },
  { id: "the-mistake",       label: "The First Mistake" },
  { id: "why-hard",          label: "Why It's Hard" },
  { id: "mental-model",      label: "Mental Model" },
  { id: "sale-shape",        label: "Architecture Shape" },
  { id: "phases",            label: "Flash Sale Phases" },
  { id: "inventory-lock",    label: "Inventory Consistency" },
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
  { label: "Concurrent users at launch", value: "~10M active on page" },
  { label: "Available inventory",        value: "10,000 units" },
  { label: "Peak request rate (0–5s)",   value: "~2M RPS" },
  { label: "Allowed overselling",        value: "0 units (strict invariant)" },
  { label: "Allowed double-charging",    value: "0 users" },
  { label: "Availability target",        value: "Core purchase path 100% up" },
  { label: "Payment timeout window",     value: "10 minutes" },
];

export const difficultyFactors = [
  ["Synchronized spike",      "All traffic arrives in the exact same second — zero organic ramp-up time."],
  ["Hot key concentration",  "10 million concurrent requests target the exact same product inventory record."],
  ["Extreme read:write ratio", "10,000,000 requests compete for only 10,000 writes (0.1% success rate)."],
  ["Race conditions",         "Unsynchronized reads and decrements guarantee overselling and negative stock."],
  ["Payment uncertainty",     "Users reserve inventory but drop off or fail payment, stranding stock."],
  ["Bot automation",          "Automated scripts hit APIs at tens of thousands of requests per second."],
  ["Retry amplification",     "Failed requests cause impatient humans and scripts to hammer reload."],
  ["Perceived fairness",      "Users demand FIFO ordering; bot sweeps cause severe brand and PR damage."],
];

export const flashSalePhases: TimelinePhaseData[] = [
  {
    number: "1",
    title: "Pre-warm & Isolation",
    description: "Prepare infrastructure 30 minutes before sale. Pre-scale application pods, pre-warm CDN edge caches, deploy WAF bot rules, and verify database connection pools.",
    details: [
      "Scale read replicas and cache clusters ahead of spike",
      "Deploy token gate and waiting room scripts at CDN edge",
      "Prime Redis with partitioned inventory keys",
      "Activate circuit breakers and disable non-essential services",
    ],
  },
  {
    number: "2",
    title: "Gate Open & Admission Control",
    description: "At 12:00:00 PM, the virtual waiting room absorbs the thundering herd. Users are queued at edge PoPs and admitted into the checkout funnel in metered waves.",
    details: [
      "Edge queue holds 10M connections without hitting origin",
      "Admit users in controlled tranches (e.g. 10,000/sec)",
      "Assign cryptographically signed admission tokens with 30s TTL",
    ],
  },
  {
    number: "3",
    title: "Inventory Gating (Redis + Lua)",
    description: "The API Gateway validates admission tokens and forwards purchase requests to Redis. A single-threaded Lua script atomically verifies and decrements stock in under 1 millisecond.",
    details: [
      "Single-threaded execution guarantees no race conditions",
      "Rejects 99.9% of requests with immediate 'Sold Out' status",
      "Eliminates database query load entirely during peak spike",
    ],
  },
  {
    number: "4",
    title: "Temporary Reservation",
    description: "Successful decrements generate a temporary reservation with an explicit Time-To-Live (TTL). Inventory is marked 'held' rather than finalized.",
    details: [
      "Reservation record stored in Redis with 10-minute expiry",
      "Order intent emitted to Kafka order queue with reservation ID",
      "User client transitions to payment gateway with reserved lock",
    ],
  },
  {
    number: "5",
    title: "Payment Processing",
    description: "User submits payment through an asynchronous payment gateway integration. Webhooks and polling handlers track payment state changes.",
  },
  {
    number: "6",
    title: "Order Confirmation",
    description: "Upon verified payment webhook receipt, Kafka consumers update the database order to 'CONFIRMED' and permanently commit inventory deduction.",
    details: [
      "Idempotent consumer prevents double fulfillment",
      "User receives push confirmation and invoice",
    ],
  },
  {
    number: "7",
    title: "Automatic TTL Release",
    description: "If a user closes their browser or payment fails/expires, the reservation TTL elapses. A cleanup worker increments stock back into Redis and releases the unit to the queue.",
  },
  {
    number: "8",
    title: "Wind Down & Reconciliation",
    description: "Once 10,000 confirmed orders settle, the gate locks permanently. Offline reconciliation verifies Redis decrements match database order records exactly.",
  },
];

export const inventoryApproaches = [
  [
    "Redis Lua Atomic Gate",
    "Sub-millisecond execution; single-threaded atomicity eliminates overselling entirely",
    "Redis is volatile in-memory state; requires Redis Sentinel/Cluster HA and post-sale DB sync",
  ],
  [
    "DB Row-Level Locking (SELECT FOR UPDATE)",
    "ACID durability directly in primary database; guarantees absolute data integrity",
    "Immediate lock contention collapse; connection pool exhaustion crashes the DB at >500 RPS",
  ],
  [
    "Distributed Lock (Redlock / ZooKeeper)",
    "Explicit mutual exclusion across distributed application instances",
    "Massive latency overhead per lock acquisition; network partitions cause deadlocks or false timeouts",
  ],
  [
    "In-Memory Local Instance Counters",
    "Zero network hops; microsecond response time directly inside application memory",
    "Impossible to coordinate remaining stock across 100+ application pods; severe inventory drift",
  ],
];

export const keyTradeoffs = [
  ["Virtual Waiting Room",  "Absorbs thundering herd at edge",            "Adds perceived wait time for users"],
  ["Redis Inventory Gate",  "Sub-ms rejection; protects database",        "Redis cluster becomes critical single point of failure"],
  ["Async Order Pipeline",  "Decouples checkout from slow DB writes",     "User sees 'Processing' instead of instant receipt"],
  ["Reservation TTL",       "Prevents stock lockup from abandoned carts", "Slow/distracted users lose reservations mid-checkout"],
  ["Inventory Sharding",    "Distributes hot key across multiple nodes",  "Added complexity aggregating global stock counters"],
  ["Aggressive Bot WAF",    "Protects real human buyers from scrapers",   "Risk of false-positive blocks on mobile cellular IPs"],
  ["Graceful Degradation",  "Saves 60%+ CPU by disabling non-essentials", "Users cannot see reviews, recommendations, or rewards"],
  ["Pre-warming Infra",     "Zero latency shock at 12:00:00 PM launch",    "Expensive idle capacity provisioned before event"],
];

export const failureModes = [
  [
    "Redis cluster outage",
    "Cluster health check timeouts and connection drops",
    "Trip circuit breaker immediately; reject all checkout attempts with 503; prevent unmetered DB fallback",
  ],
  [
    "Overselling from logic bug",
    "Reconciliation alert: sum(orders) > 10,000",
    "Emergency killswitch halts sale; trigger auto-refund pipeline with apology voucher for excess buyers",
  ],
  [
    "Hot key node saturation",
    "Redis node CPU hits 100% on inventory key",
    "Split inventory key into N shards across nodes or short-circuit locally once stock hits zero",
  ],
  [
    "Payment gateway timeout",
    "Payment webhook latency spikes > 30s",
    "Extend reservation TTL temporarily; do not cancel reservations without querying gateway status API",
  ],
  [
    "Bot army bypasses rate limit",
    "Abnormal order completion times (< 200ms)",
    "Enforce proof-of-work challenge or device fingerprinting token required by Redis Lua script",
  ],
  [
    "Kafka consumer lag spike",
    "Consumer lag metric spikes on orders topic",
    "Scale worker pods horizontally; scale Kafka partitions; throttle waiting room admission rate",
  ],
  [
    "Inventory leak (abandoned holds)",
    "Stock = 0 in Redis, but confirmed orders < 10,000",
    "Scheduled sweeper scans expired reservations; increments Redis stock and notifies waiting room",
  ],
  [
    "Edge cache miss spike",
    "Origin server CPU jumps at 11:59:59 AM",
    "Pre-warm static product assets across all global edge PoPs using synthetic requests",
  ],
  [
    "User double-clicks purchase",
    "Rapid duplicate requests with same session ID",
    "Idempotency-Key header enforced at API Gateway; reject second request while first is inflight",
  ],
  [
    "Database connection starvation",
    "Connection pool active count hits maximum",
    "Enforce worker write rate limiting; order workers must never exceed 50% of DB max connections",
  ],
];

export const tenXProblems = [
  "Waiting room must maintain 100M concurrent WebSocket or SSE connections across distributed edge PoPs.",
  "Single-key Redis throughput (~100K ops/sec) is saturated 100× over — inventory sharding across 50+ Redis nodes becomes mandatory.",
  "Upstream payment gateway APIs enforce hard TPS limits that cannot process 100K payments concurrently without dedicated private pipes.",
  "Bot traffic scales to 80%+ of total requests; rule-based WAFs fail, requiring ML-driven behavioral fingerprinting.",
  "Worker Kafka clusters require dozens of partitioned topics to prevent consumer group rebalance storms.",
  "Global network routing congestion on cellular carriers requires multi-CDN multi-region edge ingress.",
  "Cross-datacenter replication lag complicates global stock synchronization.",
  "Reconciliation jobs require distributed MapReduce/Spark pipelines rather than SQL batch scripts.",
];

export const avoidList = [
  "Allowing 10M requests to hit database tables with `SELECT ... FOR UPDATE`",
  "Updating stock in SQL with naive `UPDATE products SET stock = stock - 1` without atomic zero-checks",
  "Processing payment synchronously in the HTTP checkout request thread",
  "Relying on cloud auto-scaling to react in real-time to a 12:00:00 PM spike (spin-up takes 3–7 minutes)",
  "Setting identical cache TTLs on product data across edge layers (causes massive cache stampedes)",
  "Failing to implement a reservation TTL, permanently locking inventory when users abandon cart",
  "Falling back to database queries when Redis fails under high load (guarantees total system collapse)",
  "Allowing unauthenticated requests to reach the inventory decrement gate",
  "Displaying real-time exact inventory numbers to users (creates massive unnecessary read contention)",
  "Skipping automated reconciliation between Redis cache decrements and committed database orders",
];

export const interviewAnswer = `I would start by framing the fundamental reality: a flash sale is a funnel problem, not a scaling problem. We have 10 million users competing for 10,000 iPhones at the exact same second. Attempting to scale the database to absorb 2 million requests per second will cause connection pool exhaustion and lock contention. Instead, our job is to shed 99.9% of traffic as early as possible and process only the remaining 0.1% with strict consistency.

My architecture uses a four-tier funnel:
First, at the edge, a virtual waiting room absorbs the thundering herd, holding users in a queue and admitting them in controlled waves — say 10,000 users per second — using cryptographically signed admission tokens.

Second, the API Gateway validates tokens and passes purchase requests to an in-memory Redis cluster. The core inventory gate is an atomic Lua script that checks remaining stock and decrements it in a single operation. Because Redis is single-threaded, this eliminates race conditions and overselling with sub-millisecond execution. If stock is zero, the user is rejected immediately without touching downstream systems.

Third, for the 10,000 successful decrements, we create a temporary reservation with a 10-minute TTL and publish an 'order_created' event to Kafka, returning a 202 Accepted response. Background worker pools consume from Kafka and write to the database at a controlled, safe throughput.

Fourth, the user completes payment within the 10-minute TTL. If payment succeeds, workers mark the order confirmed. If the TTL expires or payment fails, an expiry worker increments Redis stock back to the pool for the next buyer.

The primary trade-offs are operational complexity and user experience: the waiting room introduces artificial queuing, and async checkout means users see a 'processing' screen rather than instant confirmation. But in exchange, the core purchase path remains 100% available, zero overselling occurs, and the primary database never experiences lock collapse.`;

export const levelExpectations: LevelData[] = [
  {
    title: "Mid-level",
    description: "Understands why naive approaches fail and identifies the basic components.",
    items: [
      "Explains why direct database hits cause connection pool exhaustion and lock contention",
      "Identifies Redis as an in-memory gatekeeper for fast stock checks",
      "Understands the role of a message queue (Kafka/RabbitMQ) for asynchronous order handling",
      "Mentions rate limiting and basic CAPTCHA to deflect simple scrapers",
    ],
  },
  {
    title: "Senior",
    description: "Designs an end-to-end resilient funnel with explicit trade-offs and failure modes.",
    items: [
      "Explains atomic inventory decrements using single-threaded Redis Lua scripts",
      "Designs temporary reservation mechanisms with TTLs to prevent inventory leakage",
      "Addresses hot key bottlenecks via key sharding and local memory short-circuiting",
      "Formulates edge admission control (virtual waiting room) to eliminate thundering herds",
      "Architects graceful degradation, circuit breakers, and idempotent payment handling",
      "Clearly articulates trade-offs between user fairness, latency, and system stability",
    ],
  },
  {
    title: "Staff",
    description: "Architects cross-domain system resilience, organizational alignment, and multi-region scale.",
    items: [
      "Coordinates edge WAF, CDN pre-warming, and carrier routing with external network partners",
      "Designs automated real-time reconciliation to detect and remediate drift between cache and DB",
      "Negotiates payment gateway upstream SLAs, dedicated pipe capacity, and timeout semantics",
      "Plans graceful degradation strategies across entire engineering product surfaces (catalog, reviews, search)",
      "Reasons about multi-region data replication, legal compliance, and customer dispute blast radiuses",
      "Evaluates total cost of ownership: pre-warming over-provisioning cost vs outage revenue impact",
    ],
  },
];

export const followUpQuestions: ExpandableQA[] = [
  {
    question: "Why can't we just scale the database vertically or horizontally?",
    answer: "Vertical scaling fails because 10 million concurrent requests targeting the same product row require exclusive row-level locks during write operations. Lock contention serializes execution, meaning more CPU or RAM does not increase write concurrency for a single row. Horizontal sharding does not help either because all 10 million requests target the exact same product ID (a single shard). The bottleneck is mathematical lock serialization.",
  },
  {
    question: "What happens if the Redis inventory node crashes mid-sale?",
    answer: "A circuit breaker trips immediately to prevent failing over 2M RPS to the database (which would cause instantaneous database collapse). For high availability, Redis Sentinel or Redis Cluster automatically promotes a replica within 1–3 seconds. Once promoted, an emergency reconciliation job verifies the state against database orders. Any inflight reservations whose state is uncertain are reconciled using Kafka event replay.",
  },
  {
    question: "How do you prevent a single hot key from overloading a Redis node?",
    answer: "Even Redis tops out at roughly 80,000–100,000 operations per second on a single thread. To handle 2M RPS, we use two strategies: 1) Inventory sharding — split the 10,000 iPhones into 10 keys (`iphone_stock:1` through `iphone_stock:10`, each with 1,000 units) distributed across different Redis nodes. 2) Local application short-circuiting — once an app instance sees a key hit 0, it caches a 'sold out' flag in local process memory for 5 seconds, never querying Redis again.",
  },
  {
    question: "What if a user reserves an iPhone, gets to the payment page, and closes the browser?",
    answer: "The inventory reservation is held with a strict Time-To-Live (e.g. 10 minutes) in Redis. A background cleanup worker listens to Redis keyspace expiry events or polls a delayed queue for unconfirmed reservations. When the 10-minute timer expires without payment confirmation, the worker atomically increments the Redis inventory counter by 1 and releases the slot to the next user in the waiting room.",
  },
  {
    question: "How does the virtual waiting room actually work under the hood?",
    answer: "The waiting room is hosted at the CDN edge (e.g. Cloudflare Waiting Room or AWS CloudFront + Lambda@Edge). When users click 'Buy Now', the edge checks whether current origin concurrency is below threshold. If saturated, users are placed into an edge-managed queue with an estimated wait time and position. When admitted, the edge assigns a cryptographically signed HMAC token with a short expiration. The API Gateway rejects any request lacking a valid signature.",
  },
  {
    question: "How do you guarantee that a user isn't charged twice if their network drops?",
    answer: "Every purchase request includes a client-generated Idempotency-Key (UUIDv4) passed through all layers: API Gateway -> Redis -> Kafka -> Payment Gateway. The payment service checks whether a transaction with that idempotency key has already been initiated or charged. If the client retries, the gateway returns the existing payment status rather than initiating a new transaction.",
  },
  {
    question: "Why not use Redlock for distributed locking instead of Lua scripts?",
    answer: "Redlock requires multiple network round-trips to acquire consensus locks across N Redis masters. At 2M RPS, lock acquisition latency (5–15ms) creates an intolerable bottleneck. A single Redis Lua script executes entirely within the server's single-threaded event loop in under 0.1ms without network coordination overhead, providing atomicity at orders of magnitude higher throughput.",
  },
  {
    question: "How do you handle bot armies using headless browsers?",
    answer: "Bot prevention requires defense-in-depth: 1) Edge WAF analyzes TLS fingerprints (JA3/JA4), IP reputation, and request velocity. 2) Proof-of-work challenges or invisible CAPTCHAs (Cloudflare Turnstile) presented prior to admission. 3) Business constraints — requiring verified phone numbers (OTP), pre-linked payment methods, and limiting accounts to 1 unit per Aadhaar/PAN or physical shipping address.",
  },
  {
    question: "What is graceful degradation during a flash sale?",
    answer: "Graceful degradation intentionally shuts down non-critical services to preserve CPU, bandwidth, and database connections for the checkout pipeline. During the 15-minute sale window, personalized recommendation engines, product reviews, loyalty point recalculations, and search autocompletion are disabled or served from static caches. The core checkout path gets 100% of system resources.",
  },
  {
    question: "What happens if 100M users show up instead of 10M (10× scale)?",
    answer: "At 100M users, edge PoPs must handle 20M+ concurrent connections, requiring distributed edge queuing across multiple tier-1 CDNs. Redis single-key sharding must expand to 50+ slots. The payment processor becomes the ultimate bottleneck — we must pre-negotiate dedicated private connections and batch payment settlement. Furthermore, ML-based behavioral analysis replaces static WAF rules to detect sophisticated distributed botnets.",
  },
];

export const relatedTopics: RelatedTopicData[] = [
  { title: "Database Migration Without Downtime", category: "DATA", href: "/topics/database/safely-migrate-production-database" },
  { title: "Rate Limiting & Throttling",  category: "TRAFFIC" },
  { title: "Cache Stampede Prevention",   category: "PERFORMANCE" },
  { title: "Hot Partitions",              category: "DATA" },
  { title: "Backpressure",                category: "MESSAGING" },
  { title: "Circuit Breakers",            category: "RELIABILITY" },
  { title: "Idempotent Write APIs",       category: "CORRECTNESS" },
  { title: "Graceful Degradation",        category: "RELIABILITY" },
];

export const saleStrategies = [
  {
    name: "Virtual Waiting Room",
    description: "Buffers millions of concurrent users at the edge before they hit origin infrastructure. Admits users in metered waves using cryptographic admission tokens, transforming a sudden shock spike into a steady, manageable trickle.",
  },
  {
    name: "Redis Atomic Inventory Gate",
    description: "Runs an atomic Lua script in Redis's single-threaded event loop to check and decrement stock in sub-milliseconds. Acts as the gatekeeper that instantly rejects 99.9% of excess traffic without touching the database.",
  },
  {
    name: "Async Order Pipeline",
    description: "Decouples the reservation confirmation from heavy order creation and fulfillment. Emits events to Kafka and responds with HTTP 202 Accepted, allowing workers to write to the primary database at a safe, controlled pace.",
  },
  {
    name: "Graceful Degradation",
    description: "Dynamically disables secondary features (recommendations, reviews, order history search, loyalty points) during the sale window. Conserves 60%+ of compute capacity exclusively for the mission-critical purchase path.",
  },
];
