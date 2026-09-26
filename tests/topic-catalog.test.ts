import { describe, expect, it } from "vitest";
import {
  getTopicById,
  getTopicByRoute,
  getTopicStaticParams,
  topicCatalog,
} from "@/data/topics/catalog";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("topic catalog", () => {
  it("has a unique id, route, and href for every topic", () => {
    const ids = topicCatalog.map(({ id }) => id);
    const routes = topicCatalog.map(({ meta }) => `${meta.categorySlug}/${meta.slug}`);
    const hrefs = topicCatalog.map(({ href }) => href);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(routes).size).toBe(routes.length);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("resolves every registered route", () => {
    for (const topic of topicCatalog) {
      expect(getTopicById(topic.id)).toBe(topic);
      expect(getTopicByRoute(topic.meta.categorySlug, topic.meta.slug)).toBe(topic);
    }

    expect(getTopicByRoute("missing", "topic")).toBeUndefined();
  });

  it("generates static params for every registered topic", () => {
    expect(getTopicStaticParams()).toEqual(
      topicCatalog.map(({ meta }) => ({
        category: meta.categorySlug,
        slug: meta.slug,
      })),
    );
  });
});

describe("discovery metadata", () => {
  it("includes the homepage and every topic in the sitemap", () => {
    const urls = sitemap().map(({ url }) => url);

    expect(urls).toHaveLength(topicCatalog.length + 1);
    for (const topic of topicCatalog) {
      expect(urls.some((url) => url.endsWith(topic.href))).toBe(true);
    }
  });

  it("allows crawling and advertises the sitemap", () => {
    const metadata = robots();

    expect(metadata.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(metadata.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});
