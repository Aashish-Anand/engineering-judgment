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
    <nav className="mt-12 pt-6 border-t border-dashed border-[#171717]/20 flex flex-col sm:flex-row items-stretch gap-3" aria-label="Article navigation">
      {prev ? (
        <Link
          href={prev.href}
          className="flex-1 group p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_2px_0px_#171717] hover:shadow-[3px_3px_0px_#171717] hover:-translate-y-0.5 transition-all duration-150 no-underline"
        >
          <span className="text-xs font-sans text-[#6B7280]">← Previous</span>
          <span className="block font-hand text-base font-bold text-[#171717] mt-1 group-hover:text-[#DC2626] transition-colors leading-tight">
            {prev.meta.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={next.href}
          className="flex-1 group p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_2px_0px_#171717] hover:shadow-[3px_3px_0px_#171717] hover:-translate-y-0.5 transition-all duration-150 no-underline text-right"
        >
          <span className="text-xs font-sans text-[#6B7280]">Next →</span>
          <span className="block font-hand text-base font-bold text-[#171717] mt-1 group-hover:text-[#DC2626] transition-colors leading-tight">
            {next.meta.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
