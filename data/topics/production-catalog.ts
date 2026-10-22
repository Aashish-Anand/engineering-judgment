import type { TopicCatalogEntry } from "./catalog";

export const productionCatalog: TopicCatalogEntry[] = [
  {
    "id": "idempotent-api",
    "href": "/topics/correctness/retry-payments-safely",
    "prompt": "Retry a payment without charging twice",
    "meta": {
      "slug": "retry-payments-safely",
      "category": "CORRECTNESS",
      "categorySlug": "correctness",
      "difficulty": "Senior+",
      "title": "The payment succeeded, but the request timed out. How do you retry without charging twice?",
      "subtitle": "A missing response leaves the outcome unknown. Give each payment intent a durable identity before you send it again.",
      "tags": [
        "Idempotency",
        "Payments",
        "Concurrency",
        "Reconciliation"
      ],
      "readingTime": "10 min read"
    }
  },
  {
    "id": "poison-messages",
    "href": "/topics/messaging/handle-poison-messages",
    "prompt": "Keep a poison message from blocking the queue",
    "meta": {
      "slug": "handle-poison-messages",
      "category": "MESSAGING",
      "categorySlug": "messaging",
      "difficulty": "Senior+",
      "title": "One bad message keeps crashing your consumer. How do you keep processing without losing data?",
      "subtitle": "Quarantine the failure, preserve its evidence, and make replay a controlled operation rather than another outage.",
      "tags": [
        "Dead-letter queues",
        "Retries",
        "Ordering",
        "Replay"
      ],
      "readingTime": "10 min read"
    }
  },
  {
    "id": "retry-storm",
    "href": "/topics/reliability/stop-retry-storms",
    "prompt": "Stop retries from turning a slowdown into an outage",
    "meta": {
      "slug": "stop-retry-storms",
      "category": "RELIABILITY",
      "categorySlug": "reliability",
      "difficulty": "Senior+",
      "title": "Your dependency slows down, retries multiply, and your API collapses. How do you stop the cascade?",
      "subtitle": "Retries consume the same scarce capacity as useful work. Put them inside a deadline and an explicit load budget.",
      "tags": [
        "Deadlines",
        "Retry budgets",
        "Jitter",
        "Circuit breakers",
        "Bulkheads"
      ],
      "readingTime": "10 min read"
    }
  },
  {
    "id": "connection-pool",
    "href": "/topics/performance/database-connection-pool-exhaustion",
    "prompt": "Find the real cause of connection pool exhaustion",
    "meta": {
      "slug": "database-connection-pool-exhaustion",
      "category": "PERFORMANCE",
      "categorySlug": "performance",
      "difficulty": "Senior+",
      "title": "Your database connection pool is exhausted. Why does adding application servers make things worse?",
      "subtitle": "Trace the time each connection stays occupied before raising a limit or scaling the application.",
      "tags": [
        "Connection budgets",
        "Little’s Law",
        "Transactions",
        "Admission control"
      ],
      "readingTime": "10 min read"
    }
  },
  {
    "id": "schema-evolution",
    "href": "/topics/deployment/change-schema-without-downtime",
    "prompt": "Change a schema without breaking mixed versions",
    "meta": {
      "slug": "change-schema-without-downtime",
      "category": "DEPLOYMENT",
      "categorySlug": "deployment",
      "difficulty": "Senior+",
      "title": "How do you change a schema while old and new application versions are both running?",
      "subtitle": "Expand compatibility first. Backfill deliberately. Remove the old representation only after every reader and writer has moved.",
      "tags": [
        "Expand and contract",
        "Backfills",
        "Compatibility",
        "Rollback"
      ],
      "readingTime": "10 min read"
    }
  }
];
