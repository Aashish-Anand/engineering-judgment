type SectionHeaderProps = {
  number: string;
  title: string;
  id: string;
  annotation?: string;
};

export function SectionHeader({ number, title, id, annotation }: SectionHeaderProps) {
  // Strip leading 0 if needed for circle
  const displayNum = number.replace(/^0+/, "") || number;

  return (
    <div id={id} className="scroll-mt-16 pt-10 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="circle-num">
            {displayNum}
          </span>
          <h2 className="font-hand text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight leading-tight">
            {title}
          </h2>
        </div>

        {annotation && (
          <span className="font-hand font-bold text-sm text-[#4B5563] bg-[#FFF0B8] border border-[#171717] px-2.5 py-0.5 rounded shadow-xs transform -rotate-1">
            {annotation}
          </span>
        )}
      </div>

      <div className="mt-3 w-full border-b border-dashed border-[#171717]/20" />
    </div>
  );
}
