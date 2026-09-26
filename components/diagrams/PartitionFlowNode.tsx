import type { ReactNode } from "react";

export function PartitionFlowNode({ title, children, tone = "blue" }: {
  title: string;
  children: ReactNode;
  tone?: "blue" | "green" | "yellow";
}) {
  const colors = { blue: "bg-pastel-blue", green: "bg-pastel-green", yellow: "bg-pastel-yellow" };
  return <div className={`border border-ink rounded-xl p-4 ${colors[tone]}`}>
    <div className="font-hand text-lg font-bold mb-1">{title}</div>
    <div className="text-sm leading-relaxed">{children}</div>
  </div>;
}

export function PartitionFlowArrow({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-center gap-2 py-3 text-sm text-ink-secondary"><span aria-hidden="true" className="text-xl">↓</span>{children}</div>;
}
