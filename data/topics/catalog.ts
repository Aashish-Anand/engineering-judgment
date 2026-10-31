import { productionCatalog } from "./production-catalog";
import type { TopicMeta } from "@/data/types";

export type TopicId = "database-migration" | "flash-sale" | "hot-partition" | "transactional-outbox" | "idempotent-api" | "poison-messages" | "retry-storm" | "connection-pool" | "schema-evolution" | "cache-stampede" | "rate-limiting";

export type TopicCatalogEntry = {
  id: TopicId;
  href: `/topics/${string}/${string}`;
  prompt: string;
  meta: TopicMeta;
};

export const topicCatalog: readonly TopicCatalogEntry[] = [
  {
    id: "hot-partition",
    href: "/topics/traffic/fix-hot-partition",
    prompt: "Fix a partition receiving 70% of traffic",
    meta: {
      slug: "fix-hot-partition",
      category: "TRAFFIC",
      categorySlug: "traffic",
      difficulty: "Senior+",
      title: "One partition receives 70% of your traffic. How do you fix a hot partition?",
      subtitle: "Taylor Swift publishes a post. One database partition is overwhelmed while the others have spare capacity. Separate repeated reads from independent writes to fix it.",
      tags: ["Hot Keys", "Caching", "Write Sharding", "Ordering", "Backpressure"],
      readingTime: "12 min read",
    },
  },
  {
    id: "database-migration",
    href: "/topics/database/safely-migrate-production-database",
    prompt: "Safely migrate a production database",
    meta: {
      slug: "safely-migrate-production-database",
      category: "DATA",
      categorySlug: "database",
      difficulty: "Senior+",
      title: "Migrate a production database without losing writes",
      subtitle: "Zero downtime sounds simple. Keeping writes correct during the migration is not.",
      tags: ["Snapshot", "CDC", "Validation", "Cutover", "Rollback"],
      readingTime: "10 min read",
    },
  },
  {
    id: "flash-sale",
    href: "/topics/traffic/survive-flash-sale",
    prompt: "Survive a 10M-user flash sale",
    meta: {
      slug: "survive-flash-sale",
      category: "TRAFFIC",
      categorySlug: "traffic",
      difficulty: "Senior+",
      title: "How to Survive a 10M-User Flash Sale for 10,000 iPhones",
      subtitle:
        "Everyone clicks 'Buy Now' at the same second. Only 10,000 should succeed — and no one should be charged twice.",
      tags: [
        "Rate Limiting",
        "Inventory Gating",
        "Async Orders",
        "Load Shedding",
        "Graceful Degradation",
      ],
      readingTime: "12 min read",
    },
  },
  {
    id: "transactional-outbox",
    href: "/topics/correctness/transactional-outbox",
    prompt: "Publish an event only if the transaction succeeds",
    meta: {
      slug: "transactional-outbox",
      category: "CORRECTNESS",
      categorySlug: "correctness",
      difficulty: "Senior+",
      title: "How Do You Publish an Event Only If the Database Transaction Succeeds?",
      subtitle:
        "Two writes to two systems. One can fail without the other knowing. The transactional outbox turns this into a single atomic operation.",
      tags: ["Outbox", "Dual Writes", "CDC", "Idempotency", "At-Least-Once"],
      readingTime: "12 min read",
    },
  },
  ...productionCatalog,
  {
    id: "cache-stampede",
    href: "/topics/performance/prevent-cache-stampede",
    prompt: "Stop a cache expiry from flooding the database",
    meta: {
      slug: "prevent-cache-stampede",
      category: "PERFORMANCE",
      categorySlug: "performance",
      difficulty: "Senior+",
      title: "A hot cache key expires and the database falls over. How do you prevent a cache stampede?",
      subtitle: "Every request that misses rebuilds the same value. Make it one rebuild per key, and serve the stale value while it runs.",
      tags: ["Caching", "Thundering Herd", "Locks", "Stale-While-Revalidate", "TTL Jitter"],
      readingTime: "11 min read",
    },
  },
  {
    id: "rate-limiting",
    href: "/topics/traffic/rate-limit-api",
    prompt: "Stop one client from using everyone's capacity",
    meta: {
      slug: "rate-limit-api",
      category: "TRAFFIC",
      categorySlug: "traffic",
      difficulty: "Senior+",
      title: "One customer's script is flooding your API. How do you rate limit across a fleet of gateways?",
      subtitle: "A limit has a rate and a burst. Enforce both in one atomic step, and decide what happens when the limiter itself fails.",
      tags: ["Rate Limiting", "Token Bucket", "Redis", "429", "Fairness"],
      readingTime: "12 min read",
    },
  },
];

export function getTopicById(id: TopicId) {
  return topicCatalog.find((topic) => topic.id === id)!;
}

export function getTopicByRoute(category: string, slug: string) {
  return topicCatalog.find(
    (topic) => topic.meta.categorySlug === category && topic.meta.slug === slug,
  );
}

export function getTopicStaticParams() {
  return topicCatalog.map(({ meta }) => ({
    category: meta.categorySlug,
    slug: meta.slug,
  }));
}
