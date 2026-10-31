import { topicCatalog, type TopicCatalogEntry, type TopicId } from "./topics/catalog";

export const libraryDetails: Record<TopicId, { title: string; aliases: string[]; addedOrder: number }> = {
  "database-migration": { title: "Migrate without losing writes", aliases: ["move database", "replication", "cutover"], addedOrder: 1 },
  "flash-sale": { title: "Ten million buyers. Ten thousand items.", aliases: ["overselling", "inventory", "traffic spike"], addedOrder: 2 },
  "hot-partition": { title: "When one partition takes the heat", aliases: ["hot key", "uneven traffic", "sharding"], addedOrder: 3 },
  "transactional-outbox": { title: "Commit the write. Deliver the event.", aliases: ["lost event", "dual write", "atomic publish"], addedOrder: 4 },
  "idempotent-api": { title: "Retry a payment without charging twice", aliases: ["charged twice", "double charge", "duplicate payment", "payment timeout"], addedOrder: 5 },
  "poison-messages": { title: "One bad message. A growing backlog.", aliases: ["consumer crashes", "bad message", "dead letter queue", "dlq"], addedOrder: 6 },
  "retry-storm": { title: "When retries become the outage", aliases: ["retry storm", "slow dependency", "cascading failure"], addedOrder: 7 },
  "connection-pool": { title: "More servers. The same connection budget.", aliases: ["database connections exhausted", "too many connections", "pool timeout"], addedOrder: 8 },
  "schema-evolution": { title: "New schema. Old code. Safe deployment.", aliases: ["rename column", "schema migration", "expand contract", "backfill"], addedOrder: 9 },
  "cache-stampede": { title: "One key expires. The database falls over.", aliases: ["thundering herd", "dog pile", "cache miss storm", "ttl expiry", "cache warming"], addedOrder: 10 },
  "rate-limiting": { title: "One client, everyone's capacity", aliases: ["rate limiter", "throttling", "429", "token bucket", "api quota", "noisy neighbor"], addedOrder: 11 },
};
export const featuredIds: TopicId[] = ["database-migration", "idempotent-api", "hot-partition", "poison-messages", "retry-storm", "schema-evolution"];
export const libraryCategories = Array.from(new Set(topicCatalog.map(t => t.meta.category))).map(label => ({
  label, slug: topicCatalog.find(t => t.meta.category === label)!.meta.categorySlug,
  count: topicCatalog.filter(t => t.meta.category === label).length,
}));
const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
export function matchesTopic(topic: TopicCatalogEntry, query: string) {
  const detail = libraryDetails[topic.id];
  const text = normalize([topic.id, topic.prompt, topic.meta.slug, topic.meta.title, topic.meta.subtitle, topic.meta.category, ...topic.meta.tags, detail.title, ...detail.aliases].join(" "));
  return normalize(query).split(/\s+/).every(word => text.includes(word));
}
export function getLibraryResults(query = "", category = "", sort = "recommended", page = 1, topics: readonly TopicCatalogEntry[] = topicCatalog) {
  const filtered = topics.filter(t => (!category || t.meta.categorySlug === category) && matchesTopic(t, query));
  if (sort === "title") filtered.sort((a, b) => libraryDetails[a.id].title.localeCompare(libraryDetails[b.id].title));
  if (sort === "newest") filtered.sort((a, b) => libraryDetails[b.id].addedOrder - libraryDetails[a.id].addedOrder);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 12));
  const currentPage = Math.min(totalPages, Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1));
  return { topics: filtered.slice((currentPage - 1) * 12, currentPage * 12), total: filtered.length, totalPages, currentPage };
}
export function libraryHref(query = "", category = "", sort = "recommended", page = 1) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  if (sort !== "recommended") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  return `/library${params.size ? `?${params}` : ""}`;
}
