# Article review: industry practice and visual teaching

Scope: all nine published blueprints, checked against primary industry sources and the live site (October 2026). Each article has three lists: **Correct** (factual or internal errors), **Add** (practice the industry treats as standard that we omit), **Remove/trim**. Then visuals. Priorities: P1 = wrong or contradictory teaching, P2 = missing standard practice, P3 = polish.

## Status

- **Done:** all P1 corrections (flash sale, outbox, hot partition, migration dual-write framing), plus the duplicated hot-partition trade-off table.
- **Next:** the shared diagram kit for the five data-driven blueprints, then the P2 industry-practice additions.

## Cross-cutting findings

1. **The five data-driven blueprints have no real diagram.** Their "architecture" is a numbered list of boxes, and their labs are sliders that print text. Readers are told about amplification, pool budgets, and crash windows but never see them. This is the largest teaching gap on the site. (P2)
2. **Numbers drift between the brief, prose, diagram, and lab** in the hand-written articles (flash sale has three different admission rates; outbox lab opens in a failing state that contradicts its brief). Every figure should come from one data object per article. (P1)
3. **Duplicate trade-off tables.** Hot partition repeats the same three rows in two tables inside `TradeoffDiagnosticsHub`, as the migration article did before the last fix. (P3)
4. **Named industry references are thin.** Most articles cite one source or none. Readers trust and remember a pattern more when they can see who runs it in production (Stripe, Google SRE, Uber, AWS, Debezium). (P2)
5. **Animations:** only `ScrollReveal` fades exist. A small set of CSS-only motion primitives (a packet travelling along an arrow, a counter filling a bar, a highlighted step advancing) would make the flows readable at a glance. All motion must respect `prefers-reduced-motion`. (P3)

## 001 · Database migration (DATA)

**Correct**
- Dual writes are presented as simply "dangerous". Stripe's well-known *Online migrations at scale* uses a four-phase dual-write pattern (dual write → read from new with comparison → write new only → remove old). The article should present CDC and application dual writes as two legitimate families with different failure modes, and explain when each fits (same app owns all writes vs many writers / cross-database). (P1)

**Add**
- A short "how Stripe did it" box naming the four phases and their read-comparison step (they used GitHub's Scientist library for shadow comparison). (P2)
- Named tooling per phase: logical replication / Debezium for CDC, AWS DMS or native tools for snapshot+CDC, `pg_dump --snapshot` with an exported slot snapshot. (P2)
- Rollback decision criteria as a small table: signal, threshold, action. (P3)

**Visuals**
- `MigrationArchitectureDiagram` and `CutoverDiagram` already exist in `components/diagrams/` and are unused. Wire them into section 04 (five phases) after checking they match the new text. (P2)
- Animated LSN timeline: snapshot position, CDC catching up, the fenced cutover pause. (P3)

## 002 · Flash sale (TRAFFIC)

**Correct**
- The "obvious mistake" diagram shows `SELECT … FOR UPDATE` producing `stock = -142 (OVERSOLD!)`. Row locking does **not** oversell; it serializes. Its failure is throughput and pool exhaustion. Overselling comes from read-then-write *without* a lock. Fix the diagram and caption. (P1)
- Inconsistent figures: waiting room releases 50,000 RPS (funnel) vs 10,000 req/s (lab); settlement 500 writes/s (funnel) vs ~13 WPS (lab); sellout "under 3 seconds" vs 1.0 s. (P1)
- "Redis Lua … eliminates overselling entirely" overstates it. Redis replication is asynchronous; even with `WAIT`, acknowledged writes can be lost on failover. The article's own concept check says this, so the trade-off table contradicts it. (P1)
- The TTL release ("worker returns +1 to Redis") is unspecified. Redis keyspace `expired` events are fire-and-forget and may fire late, so they cannot be the release mechanism. Use a sorted set (or DB table) of reservation expiries scanned by a sweeper, with an idempotent release. (P1)
- "DB row locking crashes at >500 RPS" and "Core purchase path 100% up" are unsupported absolutes. (P3)

**Add**
- The conditional decrement `UPDATE … SET stock = stock - 1 WHERE id = ? AND stock > 0` as the simplest correct option and the final guard behind Redis. Mention that some managed databases batch hot-row updates (Alibaba PolarDB "inventory hint"). (P2)
- Fair admission: waiting rooms such as Queue-it randomize everyone who arrived before the start time, so refreshing early or using bots gives no advantage. This is the industry answer to "who gets the 10,000". (P2)
- Reconciliation: after the sale, compare Redis reservations, orders, and payments, and release or refund mismatches. (P2)
- Load testing and pre-warming as a named pre-sale step (game day, synthetic load at 2× forecast). (P3)

**Visuals**
- Animate the funnel: dots entering, being shed at each layer, a counter of reserved units hitting 10,000. (P3)

## 003 · Hot partition (TRAFFIC)

**Correct**
- Bucket count changes between 10 (mental model, code), 4 (routing example), and 8 (resharding). Use one number and introduce resharding as "4 → 8". (P1)
- The code sample uses `redis.incr` on a salted key, but the surrounding prose (correctly) insists that a retried Like must not double-count. Replace with an idempotent reaction write plus asynchronous count aggregation, or label the snippet as the count path only. (P1)

**Add**
- Concrete limits from a real system: DynamoDB documents 3,000 read units and 1,000 write units per second per partition, and recommends write sharding with suffixes for hot keys. A concrete number grounds the "assumed 10,000 req/s" model. (P2)
- Detection tooling: DynamoDB CloudWatch Contributor Insights, `redis-cli --hotkeys`, Kafka per-partition lag. "Find the skew" is step 01 of the journey but has little practical content. (P2)
- Request coalescing ("singleflight") is in the lab label but not explained in prose. (P3)

**Remove/trim**
- The duplicated trade-off table (second table repeats the first). (P3)

## 004 · Transactional outbox (CORRECTNESS)

**Correct**
- The brief says "every committed order produces exactly one event"; the design delivers at least once. Say "at least one event; consumers make the effect happen once". (P1)
- The polling flow says to "advance the high-water mark" by `id`. With `BIGSERIAL`, IDs are assigned at insert, not commit, so a transaction with a smaller ID can commit after a larger one and be skipped. Query `WHERE published_at IS NULL` (as the table design already does) and drop the high-water-mark language, or explain the gap-hold rule. (P1)
- With `SKIP LOCKED` and several workers, events for the same aggregate can be published out of order. State the trade-off: one worker per aggregate partition, or per-aggregate ordering. (P1)
- The consumer example records `processed_events` "in the same transaction" as a payment API call. An external charge cannot join a database transaction; it needs the provider's idempotency key (link to the payment blueprint). (P1)
- The `kafka.publish()`-inside-transaction concept check stresses connection pool pressure. The primary reason is atomicity: publish can succeed and the commit still fail (a ghost event). Lead with that. (P2)
- The lab opens at 2,500 writes/s against 400 writes/s of relay capacity ("backlog growing"), while the brief says 5,000 orders/s peak. Open in a healthy state that matches the brief and let readers break it. (P2)

**Add**
- Debezium's Outbox Event Router as the standard CDC implementation: insert-only outbox table, `aggregatetype` routes to a topic, `aggregateid` becomes the Kafka key (per-aggregate ordering). (P2)
- The inbox pattern (consumer-side dedupe table) named as the counterpart. (P3)
- Event schema versioning and payload contracts. (P3)

## 005 · Idempotent payments (CORRECTNESS)

Strong already, after the last pass.

**Add**
- Concrete provider contract from Stripe's docs: keys up to 255 characters, V4 UUIDs suggested, keys may be pruned after at least 24 hours, reuse with different parameters errors, and concurrent requests with the same key are rejected and retryable. This makes "within the provider's retention window" tangible. (P2)

**Visuals**
- A sequence diagram (client / API / DB / provider / reconciler) with the crash window highlighted, stepping in sync with the existing workbench. (P2)

## 006 · Poison messages (MESSAGING)

**Add**
- Uber's published design: tiered retry topics with growing delays, a final DLQ topic, per-consumer retry/DLQ flows, and DLQ tooling (list, purge, merge back into the first retry topic). Kafka has no built-in DLQ, so this is how most teams build one. (P2)
- Broker specifics as a small table: SQS `maxReceiveCount` and redrive, Kafka Connect `errors.tolerance` with a dead-letter topic, RabbitMQ dead-letter exchanges. (P2)

**Visuals**
- A state diagram: main → retry (delays) → quarantine → repair → replay, with the acknowledgement point marked on each edge. (P2)

## 007 · Retry storms (RELIABILITY)

**Add**
- Google SRE's *Handling Overload* numbers: at most three attempts per request, a per-client retry budget that allows retries only while they are under 10% of requests, and client-side adaptive throttling (keep sending until requests reach K × accepts, K = 2). These are the most widely cited defaults and should anchor "budget time and work separately". (P2)
- AWS SDK "standard" retry mode (token bucket retry quota) as an example of a budget shipped in an SDK, and a warning that SDK retries are on by default. (P3)

**Visuals**
- Animated amplification tree (1 → 3 → 9 → 27) driven by the existing sliders, plus a "with one retry owner" comparison. (P2)

## 008 · Connection pools (PERFORMANCE)

**Add**
- HikariCP's *About Pool Sizing* starting formula, `connections = (core_count × 2) + effective_spindle_count`, presented as the PostgreSQL project's starting point that must be load-tested, not a rule. The article currently says only "no universal rule", which leaves readers without a starting number. (P2)
- PgBouncer pool modes in one table (session vs transaction vs statement) with what breaks in each. (P3)

**Visuals**
- A budget bar: replicas × pool size against the database's connection limit, animating a rolling deploy surge. (P2)

## 009 · Schema evolution (DEPLOYMENT)

**Add**
- Attribute the pattern: *Parallel Change* (expand, migrate, contract), Danilo Sato on martinfowler.com, 2014. (P2)
- `lock_timeout` on every DDL statement (a waiting `ALTER TABLE` blocks every query behind it), and `ADD CONSTRAINT … NOT VALID` + `VALIDATE CONSTRAINT`. The article mentions NOT VALID; it should name `lock_timeout` explicitly. (P2)
- Online schema-change tools for MySQL (gh-ost, pt-online-schema-change) and their Postgres equivalents, one line each. (P3)

**Visuals**
- A swimlane timeline: app versions (old / bridge / new / rollback image) across expand → backfill → switch → contract, showing which column each version reads and writes. (P2)

## Recommended order of work

1. **P1 corrections** in flash sale, outbox, hot partition, and the migration dual-write framing. Small, high-value text and data fixes.
2. **One shared diagram kit** for the five data-driven blueprints (sequence diagram, state diagram, budget bar, amplification tree, swimlane), rendered as server-side SVG with optional CSS motion. Then one diagram per blueprint.
3. **P2 industry-practice additions**, each with a primary source link.
4. Wire the two unused migration diagrams; animate the flash-sale funnel; P3 polish.

## Sources

- Stripe, [Online migrations at scale](https://stripe.com/blog/online-migrations)
- Stripe, [Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- Google SRE book, [Handling Overload](https://sre.google/sre-book/handling-overload/)
- Uber Engineering, [Building reliable reprocessing and dead letter queues with Apache Kafka](https://www.uber.com/US/en/blog/reliable-reprocessing/)
- Debezium, [Outbox Event Router](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html)
- AWS, [DynamoDB partition key design](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html) and [Choosing the right number of shards](https://aws.amazon.com/blogs/database/choosing-the-right-number-of-shards-for-your-large-scale-amazon-dynamodb-table)
- HikariCP wiki, [About Pool Sizing](https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing)
- Danilo Sato, [Parallel Change](https://martinfowler.com/bliki/ParallelChange.html)
- Redis, [Keyspace notifications](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/) and [Replication](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)
- Queue-it, [Scheduled waiting rooms](https://queue-it.com/product/scheduled/)
- Alibaba Cloud, [PolarDB hotspot updates](https://www.alibabacloud.com/help/en/polardb/polardb-for-xscale/update-hot-rows)
