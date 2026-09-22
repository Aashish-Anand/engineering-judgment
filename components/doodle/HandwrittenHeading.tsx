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
          <h2 className="font-hand text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
            {title}
          </h2>
        </div>

        {annotation && (
          <span className="font-hand font-semibold text-sm sm:text-base text-[#4B5563] bg-[#FFF0B8] border border-[#171717] px-2.5 py-0.5 rounded shadow-[1px_1px_0px_#171717] transform -rotate-1">
            {annotation}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}
