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
      className={`my-5 p-4 sm:p-5 bg-[#F9DDE5] border-[1.5px] border-[#DC2626] rounded-[14px_16px_13px_15px/15px_13px_16px_14px] shadow-[2px_3px_0px_#DC2626] ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {icon === "cross" ? (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#DC2626] text-white font-bold text-xs shadow-sm">
              ✕
            </span>
          ) : (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#DC2626] text-white font-bold text-xs shadow-sm">
              ⚠
            </span>
          )}
        </div>

        <div className="flex-1">
          {title && (
            <h4 className="font-hand font-bold text-lg text-[#DC2626] mb-1">
              {title}
            </h4>
          )}
          <div className="text-sm sm:text-[0.92rem] text-[#171717] font-medium leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
