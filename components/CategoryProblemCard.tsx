import Link from "next/link";
import type { ExploreCategory } from "@/data/homepage";

export function CategoryProblemCard({ category, icon, problems }: ExploreCategory) {
  return (
    <div
      className="h-full flex flex-col justify-between p-5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-blue-200 hover:shadow-sm transition-all duration-150"
    >
      <div>
        {/* Header: Icon + Category Title */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <span className="text-xl select-none" aria-hidden="true">
            {icon}
          </span>
          <h3 className="font-sans text-base sm:text-lg font-bold tracking-tight text-slate-900">
            {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}
          </h3>
        </div>

        {/* Problems list */}
        <ul className="space-y-1.5 text-xs sm:text-sm font-sans">
          {problems.map((prob, idx) => (
            <li key={prob.name} className="flex items-start gap-1.5">
              <span className="text-slate-600 shrink-0 select-none text-xs mt-0.5">
                {idx === 0 ? "•" : "↳"}
              </span>
              {prob.available && prob.href ? (
                <Link
                  href={prob.href}
                  className="font-semibold text-slate-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{prob.name}</span>
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded">
                    Read
                  </span>
                </Link>
              ) : (
                <span className="text-slate-600 font-medium">
                  {prob.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer / Clean Arrow */}
      <div className="mt-4 pt-2 flex items-center justify-end text-slate-600 hover:text-slate-600 text-sm font-sans">
        <span>Explore →</span>
      </div>
    </div>
  );
}
