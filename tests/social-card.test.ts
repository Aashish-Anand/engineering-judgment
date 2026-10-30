import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { categoryAccents } from "@/components/og/SocialCard";
import { topicCatalog } from "@/data/topics/catalog";

describe("social preview cards", () => {
  it("use the dark-mode category accents from category-colors.css", () => {
    const css = readFileSync("app/category-colors.css", "utf8");
    const dark = new Map(
      [...css.matchAll(/html\[data-theme="dark"\] \[data-category(?:="(\w+)")?\] \{ --category-accent:(#[0-9a-f]{6})/g)].map(([, name, color]) => [name ?? "DATA", color]),
    );
    expect(dark.size).toBeGreaterThan(0);
    expect(Object.fromEntries(dark)).toEqual(categoryAccents);
  });

  it("have an accent for every catalog category", () => {
    for (const topic of topicCatalog) expect(categoryAccents, topic.id).toHaveProperty(topic.meta.category);
  });
});
