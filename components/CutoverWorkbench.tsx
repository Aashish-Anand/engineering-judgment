"use client";

import { useState, useId, useRef } from "react";
import { calculateCutoverState, type CutoverState } from "@/data/cutover-model";

const WORKBENCH_STAGES = [
  {
    id: "baseline",
    number: "01",
    label: "Baseline Primary",
    summary: "Production traffic writes exclusively to legacy Primary DB A. Snapshot seeds initial tables.",
  },
  {
    id: "cdc",
    number: "02",
    label: "CDC Stream",
    summary: "Debezium tails DB A Write-Ahead Log (WAL) and streams delta mutations into Kafka topic.",
  },
  {
    id: "backfill",
    number: "03",
    label: "Keyset Backfill",
    summary: "Non-blocking indexed keyset cursor copies historical rows without spiking production disk I/O.",
  },
  {
    id: "shadow",
    number: "04",
    label: "Shadow Reads",
    summary: "Stripe-style background thread sends live read traffic to DB B and compares checksums with 0% user impact.",
  },
  {
    id: "cutover",
    number: "05",
    label: "Live Cutover Lab",
    summary: "Shift production read & write traffic from 0% to 100% with reverse CDC active for instant rollback.",
  },
] as const;

type StageId = (typeof WORKBENCH_STAGES)[number]["id"];

const STAGE_PRESETS = [
  { label: "0% Start", value: 0 },
  { label: "1% Canary", value: 1 },
  { label: "20% Ramp", value: 20 },
  { label: "50% Split", value: 50 },
  { label: "100% Full Cutover", value: 100 },
];

export function CutoverWorkbench() {
  const [activeStage, setActiveStage] = useState<StageId>("cutover");
  const headingId = useId();

  // Cutover simulation state (for Stage 5 and live metrics)
  const [percent, setPercent] = useState<number>(0);
  const [injectLag, setInjectLag] = useState(false);
  const [injectDivergence, setInjectDivergence] = useState(false);
  const [isRolledBack, setIsRolledBack] = useState(false);
  const lastNonZeroPercentRef = useRef<number>(20);

  const state: CutoverState = calculateCutoverState({
    cutoverPercent: percent,
    injectLagSpike: injectLag,
    injectDivergence: injectDivergence,
    isRolledBack,
  });

  const handlePresetClick = (value: number) => {
    setIsRolledBack(false);
    setPercent(value);
    if (value > 0) lastNonZeroPercentRef.current = value;
  };

  const handleRollbackToggle = () => {
    if (isRolledBack) {
      setIsRolledBack(false);
      setPercent(lastNonZeroPercentRef.current || 20);
    } else {
      lastNonZeroPercentRef.current = percent > 0 ? percent : 20;
      setIsRolledBack(true);
      setPercent(0);
    }
  };

  return (
    <div
      className="my-8 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden"
      aria-labelledby={headingId}
    >
      {/* Workbench Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 id={headingId} className="font-sans font-bold text-xl sm:text-2xl text-slate-900 m-0 tracking-tight">
              Migration workbench
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs font-bold px-2.5 py-1 rounded border ${
                state.healthStatus === "rollback"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : state.healthStatus === "critical"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : state.healthStatus === "warning"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {state.healthStatus === "rollback"
                ? "REVERSE CDC ACTIVE"
                : state.healthStatus === "critical"
                ? "CRITICAL DIVERGENCE"
                : state.healthStatus === "warning"
                ? "ELEVATED LAG"
                : "HEALTHY SYNCHRONIZED"}
            </span>
          </div>
        </div>

        {/* Stepped Phase Tabs */}
        <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {WORKBENCH_STAGES.map((stage) => {
            const isActive = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStage(stage.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-sans transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <span
                  className={`font-mono text-[10px] w-4 h-4 rounded flex items-center justify-center font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {stage.number}
                </span>
                <span>{stage.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workbench Body */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Dynamic Architecture Topology Diagram */}
        <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80">
            <span className="font-mono text-xs font-bold text-slate-600 uppercase tracking-wider">
              Live Topology · {WORKBENCH_STAGES.find((s) => s.id === activeStage)?.label}
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              {activeStage === "cutover" ? `Traffic split: ${100 - percent}% A / ${percent}% B` : "Status: Single Writer"}
            </span>
          </div>

          {/* Clean SVG Vector Diagram */}
          <div className="w-full py-2 overflow-x-auto">
            <svg
              viewBox="0 0 760 170"
              className="w-full min-w-[600px] max-w-[760px] h-auto select-none font-sans text-xs"
              aria-label="Migration Topology Visualizer"
            >
              {/* App Router Node */}
              <g transform="translate(20, 50)">
                <rect
                  width="130"
                  height="70"
                  rx="8"
                  className="fill-white stroke-slate-300 stroke-[1.5]"
                />
                <text x="65" y="32" textAnchor="middle" className="font-bold fill-slate-900 text-xs font-sans">
                  App Services
                </text>
                <text x="65" y="52" textAnchor="middle" className="fill-slate-500 text-[10px] font-mono">
                  2,300 RPS / 250 WPS
                </text>
              </g>

              {/* Arrow from App to Primary DB A */}
              <path
                d="M 150 70 L 290 70"
                className={`stroke-2 fill-none ${
                  activeStage === "cutover" && percent === 100
                    ? "stroke-slate-300 stroke-dashed"
                    : "stroke-blue-600"
                }`}
                markerEnd="url(#arrow-blue)"
              />
              <text x="220" y="62" textAnchor="middle" className="fill-blue-700 font-mono text-[10px] font-bold">
                {activeStage === "cutover" ? `${100 - percent}% Primary Writes` : "Live Production Writes"}
              </text>

              {/* Primary DB A Node */}
              <g transform="translate(290, 35)">
                <rect
                  width="150"
                  height="100"
                  rx="8"
                  className={`fill-white stroke-[2] ${
                    activeStage === "cutover" && percent === 100
                      ? "stroke-slate-300"
                      : "stroke-blue-600 shadow-sm"
                  }`}
                />
                <rect x="0" y="0" width="150" height="24" rx="8" className="fill-blue-50" />
                <text x="75" y="17" textAnchor="middle" className="font-bold fill-blue-900 text-xs font-sans">
                  Primary DB A
                </text>
                <text x="75" y="48" textAnchor="middle" className="fill-slate-700 text-[11px] font-mono">
                  {activeStage === "cutover" ? `Reads: ${state.readsA.toLocaleString()} RPS` : "Reads: 2,300 RPS"}
                </text>
                <text x="75" y="66" textAnchor="middle" className="fill-slate-700 text-[11px] font-mono">
                  {activeStage === "cutover" ? `Writes: ${state.writesA.toLocaleString()} WPS` : "Writes: 250 WPS"}
                </text>
                <text x="75" y="86" textAnchor="middle" className="fill-emerald-600 text-[10px] font-mono font-bold">
                  {activeStage === "cutover" && percent === 100 ? "Standby / Read-only" : "● Master Source"}
                </text>
              </g>

              {/* Middle Pipeline: CDC / Backfill */}
              <g transform="translate(470, 45)">
                {activeStage === "cdc" && (
                  <>
                    <rect width="100" height="80" rx="8" className="fill-amber-50 stroke-amber-400 stroke-[1.5]" />
                    <text x="50" y="28" textAnchor="middle" className="font-bold fill-amber-900 text-[11px]">
                      Debezium CDC
                    </text>
                    <text x="50" y="48" textAnchor="middle" className="fill-amber-700 font-mono text-[9px]">
                      WAL Stream
                    </text>
                    <text x="50" y="64" textAnchor="middle" className="fill-amber-800 font-mono text-[9px] font-bold">
                      &lt; 42ms Lag
                    </text>
                  </>
                )}

                {activeStage === "backfill" && (
                  <>
                    <rect width="100" height="80" rx="8" className="fill-indigo-50 stroke-indigo-400 stroke-[1.5]" />
                    <text x="50" y="28" textAnchor="middle" className="font-bold fill-indigo-900 text-[11px]">
                      Keyset Backfill
                    </text>
                    <text x="50" y="48" textAnchor="middle" className="fill-indigo-700 font-mono text-[9px]">
                      1k rows / 25ms
                    </text>
                    <text x="50" y="64" textAnchor="middle" className="fill-indigo-800 font-mono text-[9px] font-bold">
                      O(1) Seek Index
                    </text>
                  </>
                )}

                {activeStage === "shadow" && (
                  <>
                    <rect width="100" height="80" rx="8" className="fill-purple-50 stroke-purple-400 stroke-[1.5]" />
                    <text x="50" y="28" textAnchor="middle" className="font-bold fill-purple-900 text-[11px]">
                      Shadow Comparator
                    </text>
                    <text x="50" y="48" textAnchor="middle" className="fill-purple-700 font-mono text-[9px]">
                      Async Microtask
                    </text>
                    <text x="50" y="64" textAnchor="middle" className="fill-purple-800 font-mono text-[9px] font-bold">
                      0.00% Divergence
                    </text>
                  </>
                )}

                {(activeStage === "baseline" || activeStage === "cutover") && (
                  <>
                    <rect width="100" height="80" rx="8" className="fill-slate-100 stroke-slate-300 stroke-[1.5]" />
                    <text x="50" y="32" textAnchor="middle" className="font-bold fill-slate-700 text-[11px]">
                      {isRolledBack ? "↺ Reverse CDC" : "Continuous CDC"}
                    </text>
                    <text x="50" y="52" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">
                      {isRolledBack ? "Replaying B → A" : "Replaying A → B"}
                    </text>
                    <text x="50" y="68" textAnchor="middle" className="fill-emerald-700 font-mono text-[9px] font-bold">
                      {state.replicationLagMs}ms Lag
                    </text>
                  </>
                )}
              </g>

              {/* Target DB B Node */}
              <g transform="translate(600, 35)">
                <rect
                  width="150"
                  height="100"
                  rx="8"
                  className={`fill-white stroke-[2] ${
                    percent > 0 ? "stroke-emerald-600 shadow-sm" : "stroke-slate-300"
                  }`}
                />
                <rect x="0" y="0" width="150" height="24" rx="8" className="fill-emerald-50" />
                <text x="75" y="17" textAnchor="middle" className="font-bold fill-emerald-900 text-xs font-sans">
                  Target DB B
                </text>
                <text x="75" y="48" textAnchor="middle" className="fill-slate-700 text-[11px] font-mono">
                  Reads: {state.readsB.toLocaleString()} RPS
                </text>
                <text x="75" y="66" textAnchor="middle" className="fill-slate-700 text-[11px] font-mono">
                  Writes: {state.writesB.toLocaleString()} WPS
                </text>
                <text x="75" y="86" textAnchor="middle" className="fill-emerald-600 text-[10px] font-mono font-bold">
                  {percent === 100 ? "● Authoritative Primary" : percent > 0 ? "● Active Split Target" : "Standby Ingest"}
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Phase Context & Senior Intuition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-mono text-[11px] uppercase font-bold text-slate-500 block mb-1">
              Operational Focus · {WORKBENCH_STAGES.find((s) => s.id === activeStage)?.label}
            </span>
            <p className="font-sans text-xs sm:text-sm text-slate-800 leading-relaxed mb-0">
              {WORKBENCH_STAGES.find((s) => s.id === activeStage)?.summary}
            </p>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
            <span className="font-mono text-[11px] uppercase font-bold text-blue-800 block mb-1">
              Senior Engineering Rule
            </span>
            <p className="font-sans text-xs sm:text-sm text-slate-900 leading-relaxed mb-0">
              {activeStage === "baseline" && "Never perform a cold dump without verifying historical snapshot consistency and disk I/O headroom on the source."}
              {activeStage === "cdc" && "Verify Kafka retention windows. If CDC consumer dies for 4 hours, source WAL must not run out of disk space before recovery."}
              {activeStage === "backfill" && "Never use OFFSET pagination. Always use an indexed keyset cursor (WHERE id > $last_id LIMIT 1000) with a 25ms throttle sleep."}
              {activeStage === "shadow" && "Shadow reads must run asynchronously in background microtasks. A timeout or failure in DB B must NEVER degrade customer response times."}
              {activeStage === "cutover" && "Never shift live writes to DB B until Reverse CDC is actively syncing back to DB A to preserve a zero-data-loss rollback path."}
            </p>
          </div>
        </div>

        {/* Phase Implementation Code / Details */}
        {activeStage === "backfill" && (
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>keyset-cursor-backfill.sql</span>
              <span className="text-emerald-400">O(1) Direct Index Seek</span>
            </div>
            <pre className="p-0 m-0 bg-transparent text-slate-200 border-none shadow-none">
{`-- 1. Non-blocking indexed keyset cursor seek
SELECT id, user_id, amount, status, updated_at
FROM transactions
WHERE id > $last_processed_id
ORDER BY id ASC
LIMIT 1000;

-- 2. Throttled insert + 25ms sleep ensures source CPU stays < 55%`}
            </pre>
          </div>
        )}

        {activeStage === "shadow" && (
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>stripe-shadow-read-comparator.ts</span>
              <span className="text-emerald-400">Zero Customer Impact</span>
            </div>
            <pre className="p-0 m-0 bg-transparent text-slate-200 border-none shadow-none">
{`// 1. Return trusted source of truth immediately
const legacyRecord = await dbA.getAccount(userId);

// 2. Fire-and-forget background verification
queueMicrotask(async () => {
  const targetRecord = await dbB.getAccount(userId);
  if (!deepEquals(legacyRecord, targetRecord)) {
    metrics.increment("migration.divergence_detected", { userId });
  }
});`}
            </pre>
          </div>
        )}

        {/* Cutover Simulation Controls (Live in Stage 5, and telemetry summary in all stages) */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="font-sans font-bold text-sm text-slate-900">
              Migration Cutover Gate &amp; Blast Radius Control
            </span>
            <span className="font-mono text-xs text-slate-600">
              DB A: <strong className="text-blue-600">{state.percentA}%</strong> · DB B:{" "}
              <strong className="text-emerald-600">{state.percentB}%</strong>
            </span>
          </div>

          {/* Gate preset buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {STAGE_PRESETS.map((preset) => {
              const isSelected = !isRolledBack && percent === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetClick(preset.value)}
                  className={`text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white font-bold shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Continuous Traffic Slider */}
          <div className="mb-4">
            <input
              id="cutover-slider"
              aria-label="Traffic sent to target database"
              type="range"
              min="0"
              max="100"
              step="1"
              value={percent}
              disabled={isRolledBack}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPercent(val);
                if (val > 0) lastNonZeroPercentRef.current = val;
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
            />
          </div>

          {/* Chaos & Safety Controls Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => setInjectLag((p) => !p)}
              className={`text-xs py-1.5 px-3 rounded-lg font-medium transition-colors border ${
                injectLag
                  ? "bg-rose-50 text-rose-700 border-rose-300 font-bold"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {injectLag ? "✓ CDC Lag Injected (3,400ms)" : "Simulate Lag Spike"}
            </button>

            <button
              type="button"
              onClick={() => setInjectDivergence((p) => !p)}
              className={`text-xs py-1.5 px-3 rounded-lg font-medium transition-colors border ${
                injectDivergence
                  ? "bg-rose-50 text-rose-700 border-rose-300 font-bold"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {injectDivergence ? "✓ Divergence Injected (0.42%)" : "Simulate Checksum Mismatch"}
            </button>

            <button
              type="button"
              onClick={handleRollbackToggle}
              className={`text-xs py-1.5 px-3.5 rounded-lg font-bold transition-all ml-auto border ${
                isRolledBack
                  ? "bg-rose-100 text-rose-800 border-rose-300"
                  : "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
              }`}
            >
              {isRolledBack ? "↺ Reverse CDC Active · Click to Resume" : "🚨 Emergency Rollback (0% B)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
