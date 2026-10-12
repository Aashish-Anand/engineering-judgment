"use client";

import { useState } from "react";

type DecisionTableProps = {
  headers: string[];
  rows: string[][];
  title?: string;
};

export function DecisionTable({ headers, rows, title }: DecisionTableProps) {
  const [mobileMode, setMobileMode] = useState<"cards" | "table">("cards");

  return (
    <div className="my-6">
      {/* Mobile view switcher */}
      <div className="md:hidden flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
        <span className="font-sans font-bold text-xs text-slate-800">
          {title ? title : "Decision Comparison"}
        </span>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-sans font-semibold">
          <button
            type="button"
            onClick={() => setMobileMode("cards")}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              mobileMode === "cards"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                : "text-slate-500"
            }`}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setMobileMode("table")}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              mobileMode === "table"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                : "text-slate-500"
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Mobile: Card View */}
      {mobileMode === "cards" && (
        <div className="md:hidden space-y-3">
          {rows.map((row, i) => (
            <div
              key={i}
              className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs text-xs space-y-2"
            >
              {/* First column as headline */}
              <div className="pb-1.5 border-b border-slate-100 flex items-start justify-between gap-2">
                <span className="font-semibold text-sm text-slate-900 font-sans">
                  {row[0]}
                </span>
                <span className="shrink-0 text-[10px] font-mono uppercase bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">
                  {headers[0]}
                </span>
              </div>

              {/* Remaining columns as key-value pairs */}
              <div className="space-y-1.5 pt-0.5">
                {row.slice(1).map((cell, j) => {
                  const headerIndex = j + 1;
                  return (
                    <div key={headerIndex} className="flex flex-col">
                      <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                        {headers[headerIndex]}
                      </span>
                      <span className="text-slate-700 text-xs leading-relaxed font-sans">
                        {cell}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop View & Mobile Table View */}
      <div
        className={`table-scroll ${
          mobileMode === "cards" ? "hidden md:block" : "block"
        }`}
      >
        {mobileMode === "table" && (
          <div className="md:hidden text-[11px] font-mono text-slate-500 mb-1.5 flex items-center justify-end gap-1 select-none">
            <span>Scroll horizontally</span>
            <span>→</span>
          </div>
        )}
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
                  <td
                    key={j}
                    className={
                      j === 0 ? "font-semibold text-slate-900 whitespace-nowrap" : "text-slate-700"
                    }
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { DecisionTable as TradeoffTable };
export { DecisionTable as FailureModeTable };
