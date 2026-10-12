"use client";

import { useState } from "react";
import {
  dualWriteApproaches,
  keyTradeoffs,
  failureModes,
  tenXProblems,
  avoidList,
} from "@/data/topics/safely-migrate-production-database";

const TABS = [
  { id: "tradeoffs", label: "Trade-offs & Approaches", badge: "Decisions" },
  { id: "incidents", label: "Failure Modes & Runbook", badge: "7 Scenarios" },
  { id: "traps", label: "Classic Traps & 10× Scale", badge: "Safety Guards" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function TradeoffDiagnosticsHub() {
  const [activeTab, setActiveTab] = useState<TabId>("tradeoffs");

  return (
    <div className="my-8 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Tab Navigation Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm select-none" aria-hidden="true">
              ⚖️
            </span>
            <span className="font-sans font-bold text-base sm:text-lg text-slate-900 tracking-tight">
              Trade-offs, Failure Runbook &amp; Production Traps
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded">
            HIGH DENSITY MATRIX
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-sans transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white font-bold shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panels */}
      <div className="p-5 sm:p-6">
        {/* Tab 1: Trade-offs */}
        {activeTab === "tradeoffs" && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                1. Dual-Write Architecture Options
              </span>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Approach</th>
                      <th>Advantage</th>
                      <th>Trade-off / Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dualWriteApproaches.map((row, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold text-slate-900">{row[0]}</td>
                        <td className="text-emerald-700">{row[1]}</td>
                        <td className="text-slate-600">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                2. Key Migration Strategy Trade-offs
              </span>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Decision</th>
                      <th>Benefit</th>
                      <th>Cost / Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keyTradeoffs.map((row, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold text-slate-900">{row[0]}</td>
                        <td className="text-slate-700">{row[1]}</td>
                        <td className="text-slate-600">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Incidents & Runbook */}
        {activeTab === "incidents" && (
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Production Failure Modes, Telemetry Detection &amp; Response Runbook
            </span>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Failure Mode</th>
                    <th>Detection Signal</th>
                    <th>Automated / Operational Response</th>
                  </tr>
                </thead>
                <tbody>
                  {failureModes.map((row, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold text-rose-700">{row[0]}</td>
                      <td className="font-mono text-xs text-slate-700">{row[1]}</td>
                      <td className="text-slate-700">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Traps & 10x Scale */}
        {activeTab === "traps" && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                The 3 Classic Production Migration Traps
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl">
                  <span className="font-mono text-[10px] font-bold text-rose-600 block mb-1">TRAP 01</span>
                  <h4 className="font-sans text-sm font-bold text-slate-900 mb-1.5">&ldquo;Why not a 3-hour maintenance window?&rdquo;</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-0">
                    Maintenance windows always overrun. If a schema migration takes 5 hours instead of 3, you face an agonizing choice: abort and restart next weekend, or extend downtime during peak business hours.
                  </p>
                </div>

                <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl">
                  <span className="font-mono text-[10px] font-bold text-rose-600 block mb-1">TRAP 02</span>
                  <h4 className="font-sans text-sm font-bold text-slate-900 mb-1.5">&ldquo;Why not validate with SELECT COUNT(*)?&rdquo;</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-0">
                    Row counts only prove quantity, not correctness. Two tables can have exactly 10,000,000 rows while having 50,000 corrupted values, truncated timestamps, or mismatched account balances. Sampled checksums are mandatory.
                  </p>
                </div>

                <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl">
                  <span className="font-mono text-[10px] font-bold text-rose-600 block mb-1">TRAP 03</span>
                  <h4 className="font-sans text-sm font-bold text-slate-900 mb-1.5">&ldquo;Why not decommission DB A immediately?&rdquo;</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-0">
                    Latent bugs often take 48–72 hours to surface (e.g. weekly reporting queries or end-of-month reconciliations). Keep the legacy database running in read-only reverse sync for at least one full business cycle.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                What Happens at 10× Scale (100M Writes / Day)?
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-slate-700">
                {tenXProblems.map((problem, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                    <span className="text-blue-600 font-bold shrink-0">▸</span>
                    <span>{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
              <span className="font-mono text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-2">
                ⚠️ Avoid Unless Explicitly Justified:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-800">
                {avoidList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold shrink-0">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
