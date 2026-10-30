import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { articleComponents } from "@/components/articles/registry";
import { topicCatalog } from "@/data/topics/catalog";
import { articlePresentations } from "@/data/topics/presentation";
import { articleGuides } from "@/data/article-guides";
import { articleSectionIds, fixedSections } from "@/data/topics/article-format";

// Publication guard: real article markup must keep navigation targets intact.
describe("published blueprint layouts", () => {
  for (const topic of topicCatalog) {
    it(`${topic.id} uses the shared frame and has working chapter/experiment anchors`, () => {
      const html = renderToStaticMarkup(createElement(articleComponents[topic.id]));
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
      const anchors = [...html.matchAll(/\bhref="#([^"]+)"/g)].map(match => match[1]);
      expect(html).toContain('class="blueprint-article page-shell');
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

// The opening brief is one tabbed block, so the first section starts high on the page. Every panel
// stays in the HTML (unselected ones hidden) for search, print, and readers without JavaScript.
describe("article brief", () => {
  for (const topic of topicCatalog) {
    it(`${topic.id} opens with a flow diagram and puts the idea, scenario, signals, and quick reference in one tabbed brief`, () => {
      const html = renderToStaticMarkup(createElement(articleComponents[topic.id]));
      const header = html.match(/<header class="blueprint-header">[\s\S]*?<\/header>/)?.[0] ?? "";
      const brief = header.match(/<section [^>]*aria-label="Article brief"[\s\S]*<\/section>/)?.[0] ?? "";
      expect(brief).toContain('role="tablist"');
      // The three-step flow comes first and is never inside a hidden panel.
      const flow = brief.slice(0, brief.indexOf('role="tablist"'));
      for (const node of articlePresentations[topic.id].flow.nodes) expect(flow).toContain(`<span>${node}</span>`);
      const tabs = [...brief.matchAll(/role="tab"[^>]*>([^<]+)</g)].map(match => match[1]);
      expect(tabs.slice(0, 4)).toEqual(["Central idea", "Scenario", "Spot it", "One minute"]);
      const panels = [...brief.matchAll(/<div role="tabpanel"([^>]*)>/g)].map(match => match[1]);
      expect(panels).toHaveLength(tabs.length);
      expect(panels.filter(attrs => !attrs.includes("hidden"))).toHaveLength(1);
      const { signals, quick } = articleGuides[topic.id];
      for (const text of [articlePresentations[topic.id].overview, ...signals, quick.invariant, ...articlePresentations[topic.id].scenario.map(fact => fact.value)]) {
        expect(brief).toContain(renderToStaticMarkup(createElement("p", null, text)).slice(3, -4));
      }
      expect(brief).toContain("data-quick-reference");
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

    it(`${topic.id} has a level rubric, wrong answers, a runbook, and sources`, () => {
      expect(html).toContain('aria-label="Engineering level rubric"');
      expect(html.match(/<h3>Common wrong answers<\/h3>([\s\S]*?)<h3>/)?.[1].match(/<h4>/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
      const failures = html.match(/<section id="failures"[\s\S]*?<\/section>/)?.[0] ?? "";
      const failurePanels = [...failures.matchAll(/role="tabpanel"[\s\S]*?<\/div>/g)].map(match => match[0]);
      expect(failurePanels.length).toBeGreaterThanOrEqual(3);
      for (const panel of failurePanels) expect(panel).toMatch(/What happens<\/p><p>[^<]{40,}<\/p>/);
      expect(html.match(/<section id="runbook"[\s\S]*?<\/section>/)?.[0].match(/<li>/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
      expect(html.match(/<section id="sources"[\s\S]*?<ul>([\s\S]*?)<\/ul>/)?.[1].match(/<a href="https:/g)?.length ?? 0).toBeGreaterThanOrEqual(1);
    });
  }
});
