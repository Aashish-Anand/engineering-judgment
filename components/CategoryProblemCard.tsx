import Link from "next/link";
import type { ExploreCategory } from "@/data/homepage";
import { DoodleArrow } from "./doodle/DoodleArrow";

const pastelBgs = {
  blue: "bg-[#DCEBFF]",
  green: "bg-[#DFF3DF]",
  pink: "bg-[#F9DDE5]",
  yellow: "bg-[#FFF0B8]",
  lavender: "bg-[#E7E1F8]",
};

export function CategoryProblemCard({ category, icon, pastel, problems }: ExploreCategory) {
  const bgClass = pastelBgs[pastel] || "bg-[#FAF9F5]";

  return (
    <div
      className={`h-full flex flex-col justify-between p-5 border-[1.5px] border-[#171717] rounded-[16px_14px_18px_12px/14px_16px_12px_18px] shadow-[2px_3px_0px_#171717] hover:shadow-[3px_5px_0px_#171717] hover:-translate-y-0.5 transition-all duration-150 ${bgClass}`}
    >
      <div>
        {/* Header: Icon + Handwritten Category Title */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#171717]/20">
          <span className="text-xl select-none" aria-hidden="true">
            {icon}
          </span>
          <h3 className="font-hand text-2xl font-bold tracking-tight text-[#171717]">
            {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}
          </h3>
        </div>

        {/* Problems list */}
        <ul className="space-y-1.5 text-xs sm:text-[0.85rem] font-sans">
          {problems.map((prob, idx) => (
            <li key={prob.name} className="flex items-start gap-1.5">
              <span className="font-hand text-sm text-[#171717]/60 shrink-0 select-none">
                {idx === 0 ? "•" : "↳"}
              </span>
              {prob.available && prob.href ? (
                <Link
                  href={prob.href}
                  className="font-bold text-[#171717] underline decoration-[#171717] decoration-1 underline-offset-2 hover:bg-white/80 px-1 py-0.2 rounded transition-colors"
                >
                  {prob.name}
                  <span className="ml-1 text-[0.65rem] font-hand font-bold bg-white border border-[#171717] px-1 rounded-sm shadow-xs">
                    Read
                  </span>
                </Link>
              ) : (
                <span className="text-[#374151] font-medium">
                  {prob.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer / Sketched Arrow */}
      <div className="mt-4 pt-2 flex items-center justify-end">
        <DoodleArrow direction="straight-right" width={24} height={14} />
      </div>
    </div>
  );
}
