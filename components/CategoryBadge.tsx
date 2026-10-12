type CategoryBadgeProps = {
  category: string;
  size?: "sm" | "md";
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  DATA:        { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  CORRECTNESS: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  MESSAGING:   { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  TRAFFIC:     { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  PERFORMANCE: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  RELIABILITY: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  DEPLOYMENT:  { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  COST:        { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
};

export function CategoryBadge({ category, size = "sm" }: CategoryBadgeProps) {
  const colors = categoryColors[category.toUpperCase()] ?? {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  };

  const sizeClasses =
    size === "sm"
      ? "text-[0.675rem] px-2 py-0.5"
      : "text-xs px-2.5 py-0.5";

  return (
    <span
      className={`inline-block font-mono font-semibold tracking-wider uppercase rounded-md border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
    >
      {category}
    </span>
  );
}
