import Link from "next/link";
import { CategoryBadge } from "./CategoryBadge";

type RelatedTopic = {
  title: string;
  category: string;
  href?: string;
};

type RelatedTopicsProps = {
  topics: RelatedTopic[];
};

export function RelatedTopics({ topics }: RelatedTopicsProps) {
  return (
    <div className="my-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-sans font-bold text-base sm:text-lg text-slate-900">
          Keep exploring real-world failure modes →
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {topics.map((topic) => {
          const isAvailable = Boolean(topic.href);
          const inner = (
            <div
              className={`flex flex-col justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-xs transition-all duration-200 h-full ${
                isAvailable
                  ? "hover:border-blue-300 hover:shadow-sm hover:-translate-y-0.5 group"
                  : "opacity-60 bg-slate-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <CategoryBadge category={topic.category} size="sm" />
                {isAvailable ? (
                  <span className="font-sans text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Read Blueprint
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                    In Production
                  </span>
                )}
              </div>

              <span className="font-sans font-bold text-sm sm:text-base text-slate-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                {topic.title}
              </span>

              <div className="flex items-center justify-end text-xs font-semibold text-blue-600">
                {isAvailable ? "Open Blueprint →" : ""}
              </div>
            </div>
          );

          if (topic.href) {
            return (
              <Link key={topic.title} href={topic.href} className="no-underline block">
                {inner}
              </Link>
            );
          }

          return <div key={topic.title}>{inner}</div>;
        })}
      </div>
    </div>
  );
}
