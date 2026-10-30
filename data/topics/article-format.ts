import type { TocItem } from "@/data/types";

/**
 * Every blueprint follows the same twelve sections in this order. The first
 * five and the scale section carry topic-specific titles; the rest are fixed,
 * so readers always find the runbook, rubric, and sources in the same place.
 * tests/article-layout.test.ts enforces the order for every published article.
 */
export const articleSectionIds = [
  "problem", "naive", "mental-model", "architecture", "worked-example",
  "runbook", "tradeoffs", "failures", "scale", "interview", "follow-ups", "sources",
] as const;

export type ArticleSectionId = (typeof articleSectionIds)[number];
export type TopicSectionId = "problem" | "naive" | "mental-model" | "architecture" | "worked-example" | "scale";

/** Headings for the fixed sections, and their shorter chapter-navigation labels. */
export const fixedSections = {
  runbook: { title: "Respond in production", label: "Respond in production" },
  tradeoffs: { title: "Every safeguard has a cost", label: "Trade-offs" },
  failures: { title: "Failure modes to rehearse", label: "Failure modes" },
  interview: { title: "Interview corner", label: "Interview corner" },
  "follow-ups": { title: "What breaks next?", label: "What breaks next?" },
  sources: { title: "Sources and practice", label: "Sources and practice" },
} as const satisfies Record<Exclude<ArticleSectionId, TopicSectionId>, { title: string; label: string }>;

export const sectionNumber = (id: ArticleSectionId) => String(articleSectionIds.indexOf(id) + 1).padStart(2, "0");

/** Builds the chapter navigation from the six topic-specific titles. */
export function articleToc(titles: Record<TopicSectionId, string>): TocItem[] {
  return articleSectionIds.map(id => ({ id, label: id in fixedSections ? fixedSections[id as keyof typeof fixedSections].label : titles[id as TopicSectionId] }));
}
