import type { ReactNode } from "react";

type HandwrittenHeadingProps = {
  number?: string | number;
  title: string;
  id?: string;
  annotation?: string;
  children?: ReactNode;
  className?: string;
};

export function HandwrittenHeading({
  number,
  title,
  id,
  annotation,
  children,
  className = "",
}: HandwrittenHeadingProps) {
  return (
    <div id={id} className={`scroll-mt-16 pt-8 mb-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {number && (
            <span className="circle-num">
              {number}
            </span>
          )}
          <h2 className="font-sans text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
        </div>

        {annotation && (
          <span className="font-sans font-medium text-xs sm:text-sm text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
            {annotation}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}
