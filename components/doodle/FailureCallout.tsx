import type { ReactNode } from "react";

type FailureCalloutProps = {
  title?: string;
  children: ReactNode;
  icon?: "cross" | "warning";
  className?: string;
};

export function FailureCallout({
  title,
  children,
  icon = "cross",
  className = "",
}: FailureCalloutProps) {
  return (
    <div
      className={`my-5 p-4 sm:p-5 bg-red-50/80 border border-red-200 rounded-xl shadow-xs ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {icon === "cross" ? (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-red-600 text-white font-bold text-xs shadow-2xs">
              ✕
            </span>
          ) : (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-600 text-white font-bold text-xs shadow-2xs">
              ⚠
            </span>
          )}
        </div>

        <div className="flex-1">
          {title && (
            <h4 className="font-sans font-bold text-sm sm:text-base text-red-900 mb-1">
              {title}
            </h4>
          )}
          <div className="text-xs sm:text-sm text-red-950 leading-relaxed font-sans">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
