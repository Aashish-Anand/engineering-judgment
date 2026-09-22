type ProblemStatementProps = {
  children: React.ReactNode;
};

export function ProblemStatement({ children }: ProblemStatementProps) {
  return (
    <div className="my-6 p-5 sm:p-6 bg-white border-[1.5px] border-[#171717] rounded-[14px_16px_13px_15px/15px_13px_16px_14px] shadow-[2px_3px_0px_#171717]">
      <div className="text-[0.95rem] sm:text-base text-[#374151] leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 font-sans">
        {children}
      </div>
    </div>
  );
}
