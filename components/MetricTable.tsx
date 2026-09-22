type MetricTableProps = {
  rows: { label: string; value: string }[];
  sideNote?: string;
};

export function MetricTable({
  rows,
  sideNote = "This is a representative scenario, not a one-size-fits-all solution.",
}: MetricTableProps) {
  return (
    <div className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-8 table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th className="font-hand text-lg text-[#171717]">Metric</th>
              <th className="font-hand text-lg text-[#171717] text-right">Current</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="font-medium text-[#171717] font-sans">{row.label}</td>
                <td className="text-right font-mono text-sm font-semibold text-[#171717]">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sideNote && (
        <div className="lg:col-span-4 bg-[#FFF0B8] border-[1.5px] border-[#171717] rounded-xl p-4 shadow-[2px_2px_0px_#171717] transform rotate-1">
          <div className="flex items-center gap-1.5 mb-1 text-xs font-mono font-bold text-[#171717] uppercase tracking-wider">
            <span>📌 Note</span>
          </div>
          <p className="font-hand text-base sm:text-lg font-bold text-[#171717] leading-snug mb-0">
            &ldquo;{sideNote}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
