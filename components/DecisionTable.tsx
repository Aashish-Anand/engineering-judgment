type DecisionTableProps = {
  headers: string[];
  rows: string[][];
};

export function DecisionTable({ headers, rows }: DecisionTableProps) {
  return (
    <div className="table-scroll my-6">
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "font-medium text-text whitespace-nowrap" : ""}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { DecisionTable as TradeoffTable };
export { DecisionTable as FailureModeTable };
