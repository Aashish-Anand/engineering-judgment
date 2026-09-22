import Link from "next/link";
import { CategoryBadge } from "./CategoryBadge";
import { DoodleArrow } from "./doodle/DoodleArrow";

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
    <div className="my-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-hand font-bold text-lg text-[#171717]">
          Keep exploring →
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {topics.map((topic) => {
          const isAvailable = Boolean(topic.href);
          const inner = (
            <div
              className={`flex flex-col justify-between p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[2px_2px_0px_#171717] transition-all duration-150 ${
                isAvailable
                  ? "hover:shadow-[3px_4px_0px_#171717] hover:-translate-y-0.5"
                  : "opacity-60 bg-[#FAF9F5]"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <CategoryBadge category={topic.category} size="sm" />
                {isAvailable && (
                  <span className="font-hand text-xs font-bold text-[#16A34A] bg-[#DFF3DF] border border-[#171717] px-1.5 py-0.2 rounded shadow-2xs">
                    Available
                  </span>
                )}
              </div>

              <span className="font-sans font-semibold text-sm sm:text-base text-[#171717] leading-snug mb-3">
                {topic.title}
              </span>

              <div className="flex items-center justify-end text-xs">
                {isAvailable ? (
                  <DoodleArrow direction="straight-right" width={20} height={12} />
                ) : (
                  <span className="font-hand text-xs text-[#9CA3AF]">Coming soon</span>
                )}
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

          return (
            <div key={topic.title}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
