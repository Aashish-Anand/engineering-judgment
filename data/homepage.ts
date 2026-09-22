export const heroContent = {
  eyebrow: "Real problems. Better decisions.",
  headline: "Engineering decisions under pressure.",
  subtitle:
    "Real-world bottlenecks, failure modes and architecture trade-offs — explained without the usual system-design fluff.",
  searchPlaceholder: "Safely migrate a production database",
  suggestedQueries: [
    { label: "Database migration", href: "/topics/database/safely-migrate-production-database" },
    { label: "Flash sale", href: "/topics/traffic/survive-flash-sale" },
    { label: "Idempotency" },
    { label: "Backpressure" },
    { label: "Poison messages" },
  ],
  primaryCta: { label: "Explore Topics →", href: "#problems" },
  secondaryCta: {
    label: "Start with a real problem →",
    href: "/topics/database/safely-migrate-production-database",
  },
};

export type ProblemItem = {
  name: string;
  href?: string;
  available?: boolean;
};

export type ExploreCategory = {
  id: string;
  category: string;
  icon: string;
  pastel: "blue" | "green" | "pink" | "yellow" | "lavender";
  problems: ProblemItem[];
};

export const exploreCategories: ExploreCategory[] = [
  {
    id: "data",
    category: "DATA",
    icon: "🗄️",
    pastel: "blue",
    problems: [
      { name: "Database migration", href: "/topics/database/safely-migrate-production-database", available: true },
      { name: "Schema changes" },
      { name: "Replication & CDC" },
      { name: "Connection pools" },
    ],
  },
  {
    id: "correctness",
    category: "CORRECTNESS",
    icon: "🛡️",
    pastel: "green",
    problems: [
      { name: "Idempotency" },
      { name: "Deduplication" },
      { name: "Concurrency" },
      { name: "Ordering" },
    ],
  },
  {
    id: "messaging",
    category: "MESSAGING",
    icon: "✉️",
    pastel: "pink",
    problems: [
      { name: "Poison messages" },
      { name: "Consumer lag" },
      { name: "Retries & DLQ" },
      { name: "Backpressure" },
    ],
  },
  {
    id: "traffic",
    category: "TRAFFIC",
    icon: "⚡",
    pastel: "yellow",
    problems: [
      { name: "Flash sales", href: "/topics/traffic/survive-flash-sale", available: true },
      { name: "Hot keys" },
      { name: "Load shedding" },
      { name: "Graceful degradation" },
    ],
  },
  {
    id: "performance",
    category: "PERFORMANCE",
    icon: "⏱️",
    pastel: "lavender",
    problems: [
      { name: "Caching" },
      { name: "Batching" },
      { name: "Connection pools" },
      { name: "Async processing" },
    ],
  },
  {
    id: "reliability",
    category: "RELIABILITY",
    icon: "🛡️",
    pastel: "blue",
    problems: [
      { name: "Circuit breakers" },
      { name: "Bulkheads" },
      { name: "Failover" },
      { name: "Dependency failures" },
    ],
  },
  {
    id: "deployment",
    category: "DEPLOYMENT",
    icon: "🚀",
    pastel: "pink",
    problems: [
      { name: "Zero-downtime changes" },
      { name: "Canary releases" },
      { name: "Rollback" },
      { name: "Event versioning" },
    ],
  },
  {
    id: "cost",
    category: "COST",
    icon: "💳",
    pastel: "blue",
    problems: [
      { name: "Storage decisions" },
      { name: "Replication cost" },
      { name: "Cache vs DB" },
      { name: "Managed services" },
    ],
  },
];

// Preserved for backwards compatibility
export const problemCards = [
  {
    category: "DATA",
    question: "How do you safely migrate a production database?",
    href: "/topics/database/safely-migrate-production-database",
    available: true,
  },
  {
    category: "CORRECTNESS",
    question: "How do you make a write API idempotent?",
    available: false,
  },
  {
    category: "MESSAGING",
    question: "How do you stop poison messages from retrying forever?",
    available: false,
  },
  {
    category: "TRAFFIC",
    question: "How do you survive a 10M-user flash sale for 10,000 iPhones?",
    href: "/topics/traffic/survive-flash-sale",
    available: true,
  },
  {
    category: "PERFORMANCE",
    question: "What happens when your database connection pool is exhausted?",
    available: false,
  },
  {
    category: "RELIABILITY",
    question: "How do you prevent retries from taking down the dependency you're trying to recover?",
    available: false,
  },
];

export const depthLevels = [
  {
    title: "MID",
    description: "Understand the mechanism and basic trade-offs.",
    items: [
      "Understand what the problem is",
      "Describe the naive solution and why it fails",
      "Articulate the basic synchronization trade-off",
      "Know the standard tools and mechanisms involved",
    ],
  },
  {
    title: "SENIOR",
    description: "Reason about trade-offs, failure modes, and operational behavior under pressure.",
    items: [
      "Compare multiple migration & throughput strategies",
      "Reason through complex failure modes (CDC lag, poison messages)",
      "Design for rollback, data validation, and blast radius reduction",
      "Articulate operational complexity and when each approach fits",
    ],
  },
  {
    title: "STAFF",
    description: "Reason about architecture evolution, operational complexity, ownership, cost and long-term consequences.",
    items: [
      "Cross-service coordination and organizational blast radius",
      "Cost, infrastructure trade-offs, and long-term maintenance debt",
      "Multi-region data consistency & failover ownership",
      "System evolution over multiple 10× scale leaps",
    ],
  },
];

export const featuredTopic = {
  title: "How to safely migrate a 100M-read / 10M-write-per-day production database",
  subtitle: "Zero downtime sounds simple. Keeping writes correct during the migration is not.",
  category: "DATA",
  difficulty: "Senior+",
  readingTime: "10 min read",
  tags: ["Snapshot", "CDC", "Validation", "Cutover", "Rollback"],
  href: "/topics/database/safely-migrate-production-database",
};
