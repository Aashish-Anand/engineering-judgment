"use client";

import Link from "next/link";
import { topicCatalog, type TopicId } from "@/data/topics/catalog";

type ArticleNavProps = {
  currentId: TopicId;
};

/**
 * Prev/Next navigation at the bottom of each article.
 * Uses the catalog order to determine neighbors.
 */
export function ArticleNav({ currentId }: ArticleNavProps) {
  const currentIndex = topicCatalog.findIndex((t) => t.id === currentId);
  if (currentIndex === -1) return null;

  const prev = currentIndex > 0 ? topicCatalog[currentIndex - 1] : null;
  const next = currentIndex < topicCatalog.length - 1 ? topicCatalog[currentIndex + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch gap-3" aria-label="Article navigation">
      {prev ? (
        <Link
          href={prev.href}
          className="flex-1 group p-4 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-blue-200 hover:shadow-sm transition-all duration-150 no-underline"
        >
          <span className="text-xs font-sans font-medium text-slate-400">← Previous Article</span>
          <span className="block font-sans text-sm sm:text-base font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors leading-snug">
            {prev.meta.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={next.href}
          className="flex-1 group p-4 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-blue-200 hover:shadow-sm transition-all duration-150 no-underline text-right"
        >
          <span className="text-xs font-sans font-medium text-slate-400">Next Article →</span>
          <span className="block font-sans text-sm sm:text-base font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors leading-snug">
            {next.meta.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
