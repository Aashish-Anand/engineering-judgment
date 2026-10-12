import type { ReactNode } from "react";

type ProblemStatementProps = {
  children: ReactNode;
};

export function ProblemStatement({ children }: ProblemStatementProps) {
  return (
    <div className="my-6 p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
      <div className="font-sans text-sm sm:text-base text-slate-700 leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}
