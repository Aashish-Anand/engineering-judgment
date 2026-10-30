import Link from "next/link";
import { CategoryBadge } from "./CategoryBadge";
import { getTopicById, type TopicId } from "@/data/topics/catalog";
import { libraryDetails } from "@/data/library";

type RelatedTopicsProps = {
  ids: readonly TopicId[];
};

/** Links only to published topics; titles come from the library so cards match the homepage and library. */
export function RelatedTopics({ ids }: RelatedTopicsProps) {
  return (
    <div className="my-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-sans font-bold text-base sm:text-lg text-slate-900">
          Keep exploring real-world failure modes →
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ids.map((id) => {
          const topic = getTopicById(id);
          return (
            <Link key={id} href={topic.href} className="no-underline block">
              <div className="flex flex-col justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-xs transition-all duration-200 h-full hover:border-blue-300 hover:shadow-sm hover:-translate-y-0.5 group">
                <div className="mb-2">
                  <CategoryBadge category={topic.meta.category} size="sm" />
                </div>
                <span className="font-sans font-bold text-sm sm:text-base text-slate-900 leading-snug mb-1 group-hover:text-blue-600 transition-colors">
                  {libraryDetails[id].title}
                </span>
                <span className="font-sans text-sm text-slate-600 leading-relaxed mb-3">{topic.meta.subtitle}</span>
                <div className="flex items-center justify-end text-xs font-semibold text-blue-600">Open blueprint →</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
