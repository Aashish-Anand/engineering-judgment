import type { ReactNode } from "react";

export function PartitionFlowNode({
  title,
  children,
  tone = "blue",
}: {
  title: string;
  children: ReactNode;
  tone?: "blue" | "green" | "yellow" | "purple" | "white";
}) {
  const colors = {
    blue: "bg-[#DCEBFF]",
    green: "bg-[#DFF3DF]",
    yellow: "bg-[#FFF0B8]",
    purple: "bg-[#E7E1F8]",
    white: "bg-white",
  };

  return (
    <div
      className={`border-[1.5px] border-[#171717] rounded-xl p-4 shadow-[2px_2.5px_0px_#171717] hover:-translate-y-0.5 hover:shadow-[3px_4px_0px_#171717] transition-all duration-150 ${colors[tone]}`}
    >
      <div className="font-hand text-lg font-bold text-[#171717] mb-1">
        {title}
      </div>
      <div className="text-sm leading-relaxed text-[#171717]/90">{children}</div>
    </div>
  );
}

export function PartitionFlowArrow({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center my-2 select-none" aria-hidden="true">
      {/* Top connector line */}
      <div className="w-[1.5px] h-2.5 bg-[#171717]" />

      {/* Label pill if children present */}
      {children && (
        <div className="my-0.5 px-2.5 py-0.5 bg-[#FAF9F5] border border-[#171717] rounded-full text-xs font-hand font-bold text-[#171717] shadow-[1px_1px_0px_#171717] text-center max-w-[90%]">
          {children}
        </div>
      )}

      {/* Bottom connector line and arrowhead */}
      <div className="w-[1.5px] h-2.5 bg-[#171717]" />
      <svg
        width="10"
        height="6"
        viewBox="0 0 10 6"
        className="-mt-0.5 fill-[#171717]"
      >
        <path d="M0 0 L5 6 L10 0 Z" />
      </svg>
    </div>
  );
}
