import { describe, expect, it } from "vitest";
import { featuredIds, getLibraryResults, libraryCategories, libraryHref, matchesTopic } from "@/data/library";
import { getTopicById, topicCatalog } from "@/data/topics/catalog";

describe("library discovery", () => {
  it("finds symptoms, tags and words regardless of case or punctuation", () => {
    expect(getLibraryResults("poison").topics.map(t=>t.id)).toContain("poison-messages");
    expect(getLibraryResults("CHARGED twice").topics.map(t=>t.id)).toContain("idempotent-api");
    expect(getLibraryResults("database connections exhausted").topics.map(t=>t.id)).toContain("connection-pool");
    expect(matchesTopic(getTopicById("schema-evolution"), "expand-contract")).toBe(true);
    expect(matchesTopic(getTopicById("database-migration"), "CDC")).toBe(true);
  });
  it("intersects search with categories and handles empty matches", () => {
    expect(getLibraryResults("charged twice", "messaging").total).toBe(0);
    expect(getLibraryResults("", "correctness").topics.every(t=>t.meta.categorySlug === "correctness")).toBe(true);
    expect(getLibraryResults("zzzz-no-match").totalPages).toBe(1);
  });
  it("bounds pagination without losing articles across a large collection", () => {
    const collection = Array.from({length:101}, (_,i)=>({...topicCatalog[i%topicCatalog.length], href:`/topics/test/article-${i}` as const}));
    const all = Array.from({length:9},(_,i)=>getLibraryResults("","","recommended",i+1,collection).topics).flat();
    expect(new Set(all.map(t=>t.href)).size).toBe(101);
    expect(getLibraryResults("","","recommended",999,collection).currentPage).toBe(9);
    expect(getLibraryResults("","","recommended",NaN,collection).currentPage).toBe(1);
    expect(getLibraryResults("","","recommended",-4,collection).topics).toHaveLength(12);
  });
  it("sorts deterministically without mutating the catalog", () => {
    const ids=topicCatalog.map(t=>t.id);
    expect(getLibraryResults("","","newest").topics[0].id).toBe("rate-limiting");
    getLibraryResults("","","title");
    expect(topicCatalog.map(t=>t.id)).toEqual(ids);
  });
  it("encodes shareable filter state and keeps homepage curation bounded", () => {
    const url = new URL(libraryHref("locks & retries", "database", "title", 2), "https://example.com");
    expect(url.searchParams.get("q")).toBe("locks & retries");
    expect(url.searchParams.get("page")).toBe("2");
    expect(featuredIds).toHaveLength(6);
    expect(new Set(featuredIds).size).toBe(6);
    expect(libraryCategories.reduce((n,c)=>n+c.count,0)).toBe(topicCatalog.length);
  });
});
