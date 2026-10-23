import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { articleComponents } from "@/components/articles/registry";
import { topicCatalog } from "@/data/topics/catalog";
import { articlePresentations } from "@/data/topics/presentation";

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
