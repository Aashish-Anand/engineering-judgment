import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { articleComponents } from "@/components/articles/registry";
import { topicCatalog } from "@/data/topics/catalog";
import { articlePresentations } from "@/data/topics/presentation";
import { articleSectionIds, fixedSections } from "@/data/topics/article-format";

// Publication guard: real article markup must keep navigation targets intact.
describe("published blueprint layouts", () => {
  for (const topic of topicCatalog) {
    it(`${topic.id} uses the shared frame and has working chapter/experiment anchors`, () => {
      const html = renderToStaticMarkup(createElement(articleComponents[topic.id]));
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
      const anchors = [...html.matchAll(/\bhref="#([^"]+)"/g)].map(match => match[1]);
      expect(html).toContain('class="blueprint-article page-shell');
      expect(html).toContain('aria-label="Scenario assumptions"');
      expect(html).toContain('aria-label="The blueprint journey"');
      expect(anchors).toContain(articlePresentations[topic.id].startId);
      expect(anchors).toContain("workbench");
      expect(ids).toContain("judgment-quiz");
      for (const anchor of new Set(anchors)) {
        expect(ids.filter(id => id === anchor), `#${anchor} should resolve once`).toHaveLength(1);
      }
    });
  }
});

// Every blueprint follows the same twelve-section format, so readers find the
// runbook, rubric, and sources in the same place in every article.
describe("shared blueprint format", () => {
  for (const topic of topicCatalog) {
    const html = renderToStaticMarkup(createElement(articleComponents[topic.id]));
    const sections = [...html.matchAll(/<section id="([^"]+)"/g)].map(match => match[1]);

    it(`${topic.id} renders the twelve sections in order`, () => {
      expect(sections).toEqual([...articleSectionIds]);
    });

    it(`${topic.id} numbers its sections 1–12 and uses the fixed headings`, () => {
      const numbers = [...html.matchAll(/class="circle-num">(\d+)</g)].map(match => Number(match[1]));
      expect(numbers).toEqual(articleSectionIds.map((_, i) => i + 1));
      for (const { title } of Object.values(fixedSections)) expect(html).toContain(`>${title}</h2>`);
    });

    it(`${topic.id} has a level rubric, a runbook, and sources`, () => {
      expect(html).toContain('aria-label="Engineering level rubric"');
      expect(html.match(/<section id="runbook"[\s\S]*?<\/section>/)?.[0].match(/<li>/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
      expect(html.match(/<section id="sources"[\s\S]*?<ul>([\s\S]*?)<\/ul>/)?.[1].match(/<a href="https:/g)?.length ?? 0).toBeGreaterThanOrEqual(1);
    });
  }
});
