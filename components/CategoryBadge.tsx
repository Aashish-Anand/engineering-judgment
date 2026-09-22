type CategoryBadgeProps = {
  category: string;
  size?: "sm" | "md";
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  DATA:        { bg: "bg-[#DCEBFF]", text: "text-[#171717]", border: "border-[#171717]" },
  CORRECTNESS: { bg: "bg-[#DFF3DF]", text: "text-[#171717]", border: "border-[#171717]" },
  MESSAGING:   { bg: "bg-[#F9DDE5]", text: "text-[#171717]", border: "border-[#171717]" },
  TRAFFIC:     { bg: "bg-[#FFF0B8]", text: "text-[#171717]", border: "border-[#171717]" },
  PERFORMANCE: { bg: "bg-[#E7E1F8]", text: "text-[#171717]", border: "border-[#171717]" },
  RELIABILITY: { bg: "bg-[#DCEBFF]", text: "text-[#171717]", border: "border-[#171717]" },
  DEPLOYMENT:  { bg: "bg-[#F9DDE5]", text: "text-[#171717]", border: "border-[#171717]" },
  COST:        { bg: "bg-[#DCEBFF]", text: "text-[#171717]", border: "border-[#171717]" },
};

export function CategoryBadge({ category, size = "sm" }: CategoryBadgeProps) {
  const colors = categoryColors[category.toUpperCase()] ?? {
    bg: "bg-[#FAF9F5]",
    text: "text-[#171717]",
    border: "border-[#171717]",
  };

  const sizeClasses =
    size === "sm"
      ? "text-xs px-2 py-0.5"
      : "text-sm px-2.5 py-1";

  return (
    <span
      className={`inline-block font-hand font-bold tracking-wide uppercase rounded-md border-[1.2px] shadow-[1px_1px_0px_#171717] ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
    >
      {category}
    </span>
  );
}
