import { fixedSections, sectionNumber, type ArticleSectionId } from "@/data/topics/article-format";
import type { TopicId } from "@/data/topics/catalog";

/*
 * The in-article search behind the ⌘K palette. data/search-index.ts builds the
 * index at build time and app/search-index.json/route.ts serves it as a static
 * file, which the palette fetches the first time it opens. This module holds
 * only the shape and the matching, so it adds little to the client bundle.
 */

/** What a term is, which decides the label shown next to it. */
export type SearchTermKind = "heading" | "failure" | "wrong-answer" | "follow-up";

/** One of the twelve section headings of an article. */
export type SearchSection = { id: ArticleSectionId; title: string };
/** A phrase inside a section: a subheading, failure-mode name, or question. */
export type SearchTerm = { text: string; section: ArticleSectionId; kind: SearchTermKind };

export type SearchArticle = { id: TopicId; href: string; title: string; sections: SearchSection[]; terms: SearchTerm[] };

export type SearchHit = { text: string; href: string; section: string; kind: "section" | SearchTermKind; score: number };
export type SearchGroup = { article: SearchArticle; hits: SearchHit[]; score: number };

/** Section label as the chapter navigation shows it, such as "08 · Failure modes". */
export function sectionLabel(section: SearchSection) {
  const label = section.id in fixedSections ? fixedSections[section.id as keyof typeof fixedSections].label : section.title;
  return `${sectionNumber(section.id)} · ${label}`;
}

const normalize = (text: string) => text.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();

/**
 * 3: the text starts with the query; 2: a word starts with it; 1: every query
 * word appears somewhere; 0: no match.
 */
export function matchScore(text: string, query: string) {
  const haystack = normalize(text);
  const needle = normalize(query);
  if (!needle) return 0;
  if (haystack.startsWith(needle)) return 3;
  if (new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(haystack)) return 2;
  return needle.split(" ").every(word => haystack.includes(word)) ? 1 : 0;
}

/**
 * Sections and terms that match `query`, grouped by article. Groups with the
 * strongest match come first; ties keep catalog order. Each group keeps its
 * best `perArticle` hits, ordered by score and then by position in the article.
 */
export function searchArticles(index: readonly SearchArticle[], query: string, perArticle = 4): SearchGroup[] {
  if (!normalize(query)) return [];
  const groups = index.map(article => {
    const title = new Map(article.sections.map(section => [section.id, sectionLabel(section)]));
    const candidates: SearchHit[] = [
      ...article.sections.map(section => ({ text: section.title, href: `${article.href}#${section.id}`, section: title.get(section.id)!, kind: "section" as const, score: Math.max(matchScore(section.title, query), matchScore(sectionLabel(section), query)) })),
      ...article.terms.map(term => ({ text: term.text, href: `${article.href}#${term.section}`, section: title.get(term.section)!, kind: term.kind, score: matchScore(term.text, query) })),
    ];
    const hits = candidates
      .map((hit, order) => ({ hit, order }))
      .filter(({ hit }) => hit.score > 0)
      .sort((a, b) => b.hit.score - a.hit.score || a.order - b.order)
      .slice(0, perArticle)
      .map(({ hit }) => hit);
    return { article, hits, score: Math.max(0, ...hits.map(hit => hit.score)) };
  });
  return groups.filter(group => group.hits.length > 0).sort((a, b) => b.score - a.score);
}
