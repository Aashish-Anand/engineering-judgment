import { blueprints } from "#site/content";
import type { BlueprintTail } from "@/components/articles/BlueprintSections";
import type { SearchArticle, SearchSection, SearchTerm } from "@/data/search";
import { articleSectionIds, fixedSections, type ArticleSectionId, type TopicSectionId } from "@/data/topics/article-format";
import { topicCatalog, type TopicId } from "@/data/topics/catalog";
import { productionBlueprints } from "@/data/topics/production-blueprints";
import * as hotPartition from "@/data/topics/fix-hot-partition";
import * as outbox from "@/data/topics/transactional-outbox";
import * as flashSale from "@/data/topics/survive-flash-sale";
import * as migration from "@/data/topics/safely-migrate-production-database";

/*
 * Builds the ⌘K search index from the same sources the articles render from:
 * section headings, MDX subheadings, failure-mode names, wrong-answer and
 * follow-up questions. Only titles and questions go in, never body text, so
 * the index stays small. Served by app/search-index.json/route.ts.
 */

/** Sections 06–12 of the MDX blueprints; the same data components/articles/BlueprintMdx.tsx renders. */
const mdxTails: Partial<Record<TopicId, BlueprintTail>> = {
  "hot-partition": hotPartition.blueprint,
  "transactional-outbox": outbox.blueprint,
  "flash-sale": flashSale.blueprint,
  "database-migration": migration.blueprint,
};

/** The heading InterviewSection renders above the wrong answers. */
const WRONG_ANSWERS_HEADING = "Common wrong answers";

const plain = (markdown: string) => markdown.replace(/[*_`]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim();

/** `##`–`####` headings in an MDX body, each with the `<Section id>` it sits in. */
export function mdxHeadings(raw: string): SearchTerm[] {
  let section: ArticleSectionId | undefined;
  const terms: SearchTerm[] = [];
  for (const line of raw.split("\n")) {
    const opened = line.match(/<Section id="([^"]+)">/)?.[1];
    if (opened) section = opened as ArticleSectionId;
    const heading = line.match(/^#{2,4}\s+(.+)$/)?.[1];
    if (heading && section) terms.push({ text: plain(heading), section, kind: "heading" });
  }
  return terms;
}

function sectionsFrom(titles: Record<TopicSectionId, string>): SearchSection[] {
  return articleSectionIds.map(id => ({ id, title: id in fixedSections ? fixedSections[id as keyof typeof fixedSections].title : titles[id as TopicSectionId] }));
}

function tailTerms({ failures, wrongAnswers, followUps }: { failures: string[]; wrongAnswers: string[]; followUps: string[] }): SearchTerm[] {
  return [
    ...failures.map(text => ({ text, section: "failures" as const, kind: "failure" as const })),
    ...(wrongAnswers.length > 0 ? [{ text: WRONG_ANSWERS_HEADING, section: "interview" as const, kind: "heading" as const }] : []),
    ...wrongAnswers.map(text => ({ text, section: "interview" as const, kind: "wrong-answer" as const })),
    ...followUps.map(text => ({ text, section: "follow-ups" as const, kind: "follow-up" as const })),
  ];
}

function articleContent(id: TopicId): Pick<SearchArticle, "sections" | "terms"> {
  const doc = blueprints.find(entry => entry.topic === id);
  const tail = mdxTails[id];
  if (doc && tail) return {
    sections: sectionsFrom(doc.sections),
    terms: [...mdxHeadings(doc.raw), ...tailTerms({
      failures: tail.failures.map(failure => failure.title),
      wrongAnswers: tail.interview.wrongAnswers.map(wrong => wrong.question),
      followUps: tail.followUps.map(([question]) => question),
    })],
  };
  const topic = productionBlueprints.find(entry => entry.id === id);
  if (!topic) throw new Error(`No article content for topic: ${id}`);
  const title = (sectionId: TopicSectionId) => topic.sections.find(section => section.id === sectionId)!.title;
  return {
    sections: sectionsFrom({ problem: title("problem"), naive: title("naive"), "mental-model": title("mental-model"), architecture: title("architecture"), "worked-example": title("worked-example"), scale: title("scale") }),
    terms: tailTerms({
      failures: topic.failures.map(([name]) => name),
      wrongAnswers: topic.wrongAnswers.map(wrong => wrong.question),
      followUps: topic.followups.map(([question]) => question),
    }),
  };
}

/** One entry per published article, in catalog order. */
export function buildSearchIndex(): SearchArticle[] {
  return topicCatalog.map(topic => ({ id: topic.id, href: topic.href, title: topic.prompt, ...articleContent(topic.id) }));
}
