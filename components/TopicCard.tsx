import Link from "next/link";
import { CategoryBadge } from "./CategoryBadge";
import { DoodleArrow } from "./doodle/DoodleArrow";

type TopicCardProps = {
  category: string;
  question: string;
  href?: string;
  available?: boolean;
};

export function TopicCard({ category, question, href, available = false }: TopicCardProps) {
  const content = (
    <div
      className={`group h-full flex flex-col justify-between p-5 bg-white border-[1.5px] border-[#171717] rounded-[14px_16px_13px_15px/15px_13px_16px_14px] shadow-[2px_3px_0px_#171717] transition-all duration-150 ${
        available
          ? "hover:-translate-y-1 hover:shadow-[3px_5px_0px_#171717]"
          : "opacity-70 bg-[#FAF9F5]"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <CategoryBadge category={category} size="sm" />
          {available && (
            <span className="font-sans font-bold text-[0.68rem] tracking-wide uppercase px-2 py-0.5 bg-[#DFF3DF] text-[#16A34A] border border-[#171717] rounded-full shadow-xs">
              Available
            </span>
          )}
        </div>

        <p className="font-sans font-semibold text-[0.95rem] text-[#171717] leading-snug mb-3">
          {question}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#171717]/20 text-xs">
        {available ? (
          <>
            <span className="font-hand font-bold text-base text-[#171717] group-hover:underline">
              Read the decision
            </span>
            <DoodleArrow direction="straight-right" width={22} height={14} />
          </>
        ) : (
          <span className="font-hand font-medium text-sm text-[#4B5563]">
            Coming soon to notebook...
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
