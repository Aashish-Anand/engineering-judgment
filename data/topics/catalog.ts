import type { TopicMeta } from "@/data/types";

export type TopicId = "database-migration" | "flash-sale" | "hot-partition";

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
      title: "How to Safely Migrate a 100M-Read / 10M-Write-per-Day Production Database",
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
