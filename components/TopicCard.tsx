import Link from "next/link";
import { CategoryBadge } from "./CategoryBadge";

type TopicCardProps = {
  category: string;
  question: string;
  href?: string;
  available?: boolean;
};

export function TopicCard({ category, question, href, available = false }: TopicCardProps) {
  const content = (
    <div
      className={`group h-full flex flex-col justify-between p-5 bg-white border border-slate-200 rounded-xl shadow-xs transition-all duration-150 ${
        available
          ? "hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
          : "opacity-60 bg-slate-50"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <CategoryBadge category={category} size="sm" />
          {available && (
            <span className="font-mono font-bold text-[10px] tracking-wide uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              Available
            </span>
          )}
        </div>

        <p className="font-sans font-semibold text-sm sm:text-base text-slate-900 leading-snug mb-3">
          {question}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        {available ? (
          <span className="font-sans font-semibold text-xs text-blue-600 group-hover:underline flex items-center gap-1">
            Read decision →
          </span>
        ) : (
          <span className="font-sans font-medium text-xs text-slate-600">
            Coming soon...
          </span>
        )}
      </div>
    </div>
  );

  if (href && available) {
    return (
      <Link href={href} className="no-underline block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
