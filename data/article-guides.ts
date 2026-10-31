import type { TopicId } from "./topics/catalog";

/*
 * "Recognize it" and "remember it" for every article. Signals help a reader spot the pattern in a new
 * situation or interview prompt; the quick reference is the one-screen summary worth revisiting.
 * Every statement must already be made in the article itself; change both together.
 */
export type ArticleGuide = {
  signals: string[];
  quick: { invariant: string; decision: string; remember: string[]; failure: string };
};

export const articleGuides: Record<TopicId, ArticleGuide> = {
  "idempotent-api": {
    signals: [
      "A call that moves money or creates something can time out after the other side has already acted.",
      "Clients, proxies, or workers retry automatically.",
      "Two replicas can receive the same request at the same moment.",
    ],
    quick: {
      invariant: "One business effect per payment intent, however many times the request arrives.",
      decision: "Claim a durable intent under a unique key before calling the provider, and reuse the same provider key during recovery.",
      remember: ["A timeout is unknown, never failed.", "Same key with different parameters is a conflict, not a replay.", "Stripe may prune keys after 24 hours; retry windows must end first."],
      failure: "Recovery with a fresh key creates a second charge.",
    },
  },
  "transactional-outbox": {
    signals: [
      "A database write must trigger an event that other services act on.",
      "The broker can be unavailable while the database is up.",
      "Downstream services charge, reserve, or ship on events, so a lost or ghost event costs money.",
    ],
    quick: {
      invariant: "An event exists if and only if its business change committed.",
      decision: "Insert the event into an outbox table in the same transaction; a relay publishes it and consumers deduplicate.",
      remember: ["Delivery is at least once; consumers deduplicate by event ID.", "IDs follow insert order, not commit order.", "Key messages by aggregate ID to keep one order's events in order."],
      failure: "The relay crashes after publishing but before marking the row, so the event is delivered twice.",
    },
  },
  "poison-messages": {
    signals: [
      "One message fails every time while the backlog grows behind it.",
      "Adding consumers raises the error rate but not throughput.",
      "Some failures are transient (timeouts) and some permanent (an invalid payload).",
    ],
    quick: {
      invariant: "Acknowledge a message only when its work is durable or its evidence is safely quarantined.",
      decision: "Classify the failure: bounded delayed retry for transient errors, durable quarantine for permanent ones, controlled replay after repair.",
      remember: ["Quarantine first, acknowledge second.", "Replay with the original event ID.", "Watch the oldest message's age, not just queue depth."],
      failure: "A catch-all handler acknowledges every error, so the queue looks healthy while orders stop advancing.",
    },
  },
  "retry-storm": {
    signals: [
      "A dependency slows down and unrelated endpoints start failing.",
      "Retries are configured in more than one layer: client, API, SDK, or proxy.",
      "CPU looks fine, but threads or connections are exhausted.",
    ],
    quick: {
      invariant: "Retries must never consume the capacity the dependency needs to recover.",
      decision: "Give one layer ownership of retries, and add an absolute deadline, a retry budget, and bounded concurrency with fast rejection.",
      remember: ["3 layers × 3 attempts = 27 calls per request.", "Google SRE: retry only while retries stay under 10% of requests.", "Little's Law: 200 req/s × 2 s ≈ 400 calls in flight."],
      failure: "Breakers reopen together and release every waiting request in one surge.",
    },
  },
  "connection-pool": {
    signals: [
      "Requests wait on pool acquisition while application CPU is low.",
      "Autoscaling adds replicas and the database starts refusing sessions.",
      "Sessions sit idle in transaction.",
    ],
    quick: {
      invariant: "Sessions across every replica, worker, and deploy surge stay within the database budget.",
      decision: "Divide a measured session budget by the maximum replica count, and shorten hold time before adding connections.",
      remember: ["Possible sessions = replicas × pool size.", "In use ≈ checkouts per second × hold time.", "HikariCP starting point: (cores × 2) + disks."],
      failure: "A rolling deploy briefly runs old and new pools together and exhausts the database.",
    },
  },
  "schema-evolution": {
    signals: [
      "A column rename or type change while replicas deploy gradually.",
      "Jobs, consumers, or a rollback image still read the old shape.",
      "A large backfill has to run beside live traffic.",
    ],
    quick: {
      invariant: "Every running version, including the rollback image, reads and writes correctly in every phase.",
      decision: "Expand, bridge with dual writes, backfill in resumable chunks, switch reads, and contract only after the rollback window closes.",
      remember: ["Parallel Change: expand, migrate, contract.", "Set lock_timeout before every DDL statement.", "Add constraints NOT VALID, then VALIDATE CONSTRAINT."],
      failure: "Contracting before old jobs drain turns a hidden reader into a production error.",
    },
  },
  "hot-partition": {
    signals: [
      "Cluster averages look healthy while one partition is saturated.",
      "Traffic concentrates on one key, such as a celebrity post or a viral product.",
      "Adding partitions does not reduce the hottest one.",
    ],
    quick: {
      invariant: "No single key may need more than one partition can serve.",
      decision: "Cache and coalesce identical reads; spread independent writes across stable hashed buckets; aggregate counts asynchronously.",
      remember: ["70,000 writes ÷ 8 buckets = 8,750 per bucket.", "DynamoDB: 3,000 reads and 1,000 writes per second per partition.", "Route by a stable hash of the user ID, never at random."],
      failure: "Changing the bucket count without a routing version sends users to keys that hold none of their data.",
    },
  },
  "flash-sale": {
    signals: [
      "Demand exceeds supply by orders of magnitude at one moment.",
      "Every request targets the same inventory record.",
      "Overselling or charging a buyer twice is unacceptable.",
    ],
    quick: {
      invariant: "Never sell more units than exist, and never charge a buyer twice.",
      decision: "Admit a bounded stream through a waiting room, reserve atomically in Redis, and settle asynchronously behind a conditional database decrement.",
      remember: ["10,000 admitted requests per second reserve 10,000 units in about a second.", "Expired holds return through a sorted-set sweeper, not keyspace events.", "A Redis failover can resurrect sold units, so keep a buffer."],
      failure: "Row locks serialize every buyer on one row and exhaust the connection pool.",
    },
  },
  "database-migration": {
    signals: [
      "Production data must move to a new database with no planned downtime.",
      "Writes keep arriving while you copy.",
      "You need a way back after switching.",
    ],
    quick: {
      invariant: "No acknowledged write is lost, and rollback stays possible until the old database is retired.",
      decision: "Create the replication position, snapshot from it, stream changes, validate, move reads, then move writes behind a short fence with reverse replication.",
      remember: ["Copied ≠ caught up ≠ safe to switch.", "10M writes per day ≈ 116 per second, 348 at a 3× peak.", "Reads can ramp by percentage; writes move once."],
      failure: "Snapshotting first and starting capture later silently loses every write in between.",
    },
  },
  "cache-stampede": {
    signals: [
      "Database load spikes right after a TTL boundary, a deploy, or a cache restart, then settles.",
      "Cache hit ratio looks excellent on average while p99 latency jumps once a minute.",
      "One expensive value is read thousands of times per second.",
    ],
    quick: {
      invariant: "Rebuilds depend on the number of keys, never on the number of readers.",
      decision: "Store a soft expiry inside the value; past it, serve the stale value while one caller holding a short SET NX PX lock refreshes in the background. Jitter TTLs.",
      remember: ["Stampede size = request rate × rebuild time: 12,000/s × 300 ms ≈ 3,600 queries.", "Single-flight coalesces per instance, so it grows with the fleet.", "A longer TTL makes stampedes rarer, not smaller."],
      failure: "The extra queries slow the rebuild, which lengthens the window and lets in more misses.",
    },
  },
  "rate-limiting": {
    signals: [
      "One client's traffic slows the API for everyone else.",
      "Several gateway instances must agree on one client's usage.",
      "Clients need bursts for page loads but should not sustain them.",
    ],
    quick: {
      invariant: "Over any interval t, a client gets at most burst + rate × t.",
      decision: "A token bucket per API key, refilled and spent atomically in one Redis script; cheap 429s with Retry-After; a bounded local fallback when Redis is unavailable.",
      remember: ["A fixed window lets up to 2× the limit through around each reset.", "Local counters multiply the limit by the number of gateways.", "Rate limiting is fairness; load shedding is overload protection."],
      failure: "Failing closed turns a limiter outage into a full API outage.",
    },
  },
};
