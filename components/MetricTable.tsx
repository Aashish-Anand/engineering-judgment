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
              <th className="font-sans font-bold text-xs uppercase tracking-wider text-[#171717]">Metric</th>
              <th className="font-sans font-bold text-xs uppercase tracking-wider text-[#171717] text-right">Current</th>
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
        <div className="lg:col-span-4 bg-amber-50/70 border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-mono font-bold text-amber-800 uppercase tracking-wider">
            <span>📌 Production Note</span>
          </div>
          <p className="font-sans text-xs sm:text-sm font-semibold text-amber-950 leading-relaxed mb-0">
            &ldquo;{sideNote}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
