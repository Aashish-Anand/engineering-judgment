import { describe, expect, it } from "vitest";
import { buildSearchIndex, mdxHeadings } from "@/data/search-index";
import { searchArticles } from "@/data/search";
import { articleSectionIds } from "@/data/topics/article-format";
import { topicCatalog } from "@/data/topics/catalog";
import { productionBlueprints } from "@/data/topics/production-blueprints";
import { mdxBlueprintData } from "@/components/articles/BlueprintMdx";

// The ⌘K palette's in-article search: data/search-index.ts builds it, data/search.ts queries it.
describe("search index", () => {
  const index = buildSearchIndex();

  it("has every published article, in catalog order, with its twelve sections", () => {
    expect(index.map(article => article.href)).toEqual(topicCatalog.map(topic => topic.href));
    for (const article of index) {
      expect(article.sections.map(section => section.id)).toEqual([...articleSectionIds]);
      for (const section of article.sections) expect(section.title.trim()).not.toBe("");
    }
  });

  it("indexes every failure mode and wrong answer the article renders", () => {
    const rendered = (id: string) => {
      const mdx = mdxBlueprintData[id as keyof typeof mdxBlueprintData];
      if (mdx) return { failures: mdx.tail.failures.map(f => f.title), wrong: mdx.tail.interview.wrongAnswers.map(w => w.question) };
      const topic = productionBlueprints.find(entry => entry.id === id)!;
      return { failures: topic.failures.map(([title]) => title), wrong: topic.wrongAnswers.map(w => w.question) };
    };
    for (const article of index) {
      const { failures, wrong } = rendered(article.id);
      expect(article.terms.filter(term => term.kind === "failure").map(term => term.text)).toEqual(failures);
      expect(article.terms.filter(term => term.kind === "wrong-answer").map(term => term.text)).toEqual(wrong);
      for (const term of article.terms) expect(articleSectionIds).toContain(term.section);
    }
  });

  it("reads MDX subheadings with the section they sit in", () => {
    const raw = `<Section id="problem">\n\nIntro\n\n</Section>\n\n<Section id="architecture">\n\n### 1. Seed the **target**\n\nText\n\n#### Use \`CDC\`\n</Section>`;
    expect(mdxHeadings(raw)).toEqual([
      { text: "1. Seed the target", section: "architecture", kind: "heading" },
      { text: "Use CDC", section: "architecture", kind: "heading" },
    ]);
    const migration = index.find(article => article.id === "database-migration")!;
    expect(migration.terms).toContainEqual({ text: "5. Transfer write ownership, then keep a way back", section: "architecture", kind: "heading" });
  });

  it.each([
    ["stampede", "/topics/traffic/fix-hot-partition#failures", "Cache stampede"],
    ["rollback", "/topics/database/safely-migrate-production-database#failures", "Rollback itself creates divergence"],
    ["wrong answers", "/topics/traffic/fix-hot-partition#interview", "Common wrong answers"],
    ["Failure modes", "/topics/traffic/fix-hot-partition#failures", "Failure modes to rehearse"],
  ])("ranks the right section first for %j", (query, href, text) => {
    const [first] = searchArticles(index, query);
    expect(first.hits[0]).toMatchObject({ href, text });
  });

  it("groups hits by article and names the section", () => {
    const groups = searchArticles(index, "wrong answers");
    expect(groups.length).toBe(index.length);
    expect(groups[0].hits[0].section).toBe("10 · Interview corner");
    expect(searchArticles(index, "   ")).toEqual([]);
  });

  it("stays small enough to fetch on first open", () => {
    expect(JSON.stringify(index).length).toBeLessThan(40_000);
  });
});
