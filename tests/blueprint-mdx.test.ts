import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { blueprints } from "#site/content";
import { mdxBlueprintData } from "@/components/articles/BlueprintMdx";
import { topicCatalog } from "@/data/topics/catalog";

// MDX blueprints: content/blueprints/*.mdx holds sections 01–05, and
// mdxBlueprintData holds the typed data for sections 06–12.
describe("MDX blueprints", () => {
  const topics = blueprints.map(doc => doc.topic);

  it("each MDX file names a published topic, once", () => {
    for (const topic of topics) expect(topicCatalog.map(entry => entry.id)).toContain(topic);
    expect(new Set(topics).size).toBe(topics.length);
  });

  it("every MDX file has typed section data, and every data entry has an MDX file", () => {
    expect([...topics].sort()).toEqual(Object.keys(mdxBlueprintData).sort());
  });

  for (const file of readdirSync("content/blueprints").filter(name => name.endsWith(".mdx"))) {
    it(`${file} writes sections 01–05 with <Section> and leaves 06–12 to data`, () => {
      const source = readFileSync(`content/blueprints/${file}`, "utf8");
      const ids = [...source.matchAll(/<Section id="([^"]+)">/g)].map(match => match[1]);
      expect(ids).toEqual(["problem", "naive", "mental-model", "architecture", "worked-example"]);
    });
  }
});
