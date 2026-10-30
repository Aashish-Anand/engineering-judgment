"use client";

import { useState } from "react";

export function OutboxLab() {
  const [wps, setWps] = useState(5000); // writes per second (brief peak)
  const [relayType, setRelayType] = useState<"poll" | "cdc">("poll");
  const [pollIntervalMs, setPollIntervalMs] = useState(200);
  const [batchSize, setBatchSize] = useState(500);
  const [workerCount, setWorkerCount] = useState(4);
  const [duplicateRatePercent, setDuplicateRatePercent] = useState(1.5);

  // Calculated metrics
  const cdcLagMs = 25; // near-instant Debezium WAL tailing
  const pollLagMs = pollIntervalMs / 2 + (wps > batchSize * workerCount * (1000 / pollIntervalMs) ? 1200 : 80);
  const effectiveLagMs = relayType === "cdc" ? cdcLagMs : pollLagMs;
  const duplicateEventsPerMin = Math.round((wps * 60 * duplicateRatePercent) / 100);
  const maxRelayCapacityWps = relayType === "cdc" ? 15000 : Math.round(workerCount * batchSize * (1000 / pollIntervalMs));
  const isBacklogged = wps > maxRelayCapacityWps;

  return (
    <div className="my-8 p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-5 border-b border-slate-100">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            ⚡ Interactive Architecture Lab
          </span>
          <h4 className="font-sans text-base sm:text-lg font-bold text-slate-900 mt-2 mb-0">
            Transactional Outbox &amp; Relay Throughput Simulator
          </h4>
        </div>
        <span className="text-xs font-mono text-slate-600">Model: ACID Outbox Row ➔ Relay ➔ Kafka Partition</span>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setRelayType("poll")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
            relayType === "poll"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Polling Relay (SKIP LOCKED)
        </button>
        <button
          type="button"
          onClick={() => setRelayType("cdc")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
            relayType === "cdc"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Change Data Capture (Debezium WAL)
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Primary DB Write Throughput:</span>
            <span className="font-mono text-blue-600 font-bold">{wps.toLocaleString("en-US")} orders/sec</span>
          </div>
          <input
            type="range"
            aria-label="Primary DB Write Throughput"
            min={200}
            max={8000}
            step={200}
            value={wps}
            onChange={(e) => setWps(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-600 mt-0.5">
            <span>200 WPS</span>
            <span>8,000 WPS</span>
          </div>
        </div>

        {relayType === "poll" ? (
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Polling Interval:</span>
              <span className="font-mono text-blue-600 font-bold">{pollIntervalMs} ms</span>
            </div>
            <input
              type="range"
              aria-label="Polling Interval"
              min={100}
              max={3000}
              step={100}
              value={pollIntervalMs}
              onChange={(e) => setPollIntervalMs(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-600 mt-0.5">
              <span>100ms (Aggressive)</span>
              <span>3,000ms (Relaxed)</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>CDC WAL Streaming Latency:</span>
              <span className="font-mono text-emerald-700 font-bold">~25 ms (Sub-second)</span>
            </div>
            <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs text-emerald-900">
              Debezium reads the PostgreSQL Write-Ahead Log directly without executing polling queries on the database engine.
            </div>
          </div>
        )}

        {relayType === "poll" && (
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Concurrent Workers (SKIP LOCKED):</span>
              <span className="font-mono text-slate-900 font-bold">{workerCount} workers</span>
            </div>
            <input
              type="range"
              aria-label="Concurrent Workers (SKIP LOCKED)"
              min={1}
              max={12}
              step={1}
              value={workerCount}
              onChange={(e) => setWorkerCount(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-600 mt-0.5">
              <span>1 worker</span>
              <span>12 workers</span>
            </div>
          </div>
        )}

        {relayType === "poll" && (
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Batch Size (Rows per Worker):</span>
              <span className="font-mono text-slate-900 font-bold">{batchSize} rows</span>
            </div>
            <input
              type="range"
              aria-label="Batch Size (Rows per Worker)"
              min={25}
              max={500}
              step={25}
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-600 mt-0.5">
              <span>25 rows</span>
              <span>500 rows</span>
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Consumer Re-Delivery / Retry Rate:</span>
            <span className="font-mono text-amber-700 font-bold">{duplicateRatePercent}%</span>
          </div>
          <input
            type="range"
            aria-label="Consumer Re-Delivery / Retry Rate"
            min={0.5}
            max={5}
            step={0.5}
            value={duplicateRatePercent}
            onChange={(e) => setDuplicateRatePercent(Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-600 mt-0.5">
            <span>0.5% (Stable network)</span>
            <span>5.0% (Frequent rebalances)</span>
          </div>
        </div>
      </div>

      {/* Output Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-600 block">End-to-End Lag</span>
          <span className={`font-sans text-base sm:text-lg font-extrabold ${effectiveLagMs > 1000 ? "text-amber-700" : "text-emerald-700"}`}>
            ~{Math.round(effectiveLagMs)} ms
          </span>
          <p className="text-[11px] text-slate-600 m-0 mt-0.5">DB Commit ➔ Broker ACK</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-600 block">Relay Drain Capacity</span>
          <span className={`font-sans text-base sm:text-lg font-extrabold ${isBacklogged ? "text-red-700" : "text-blue-700"}`}>
            {maxRelayCapacityWps.toLocaleString("en-US")} WPS
          </span>
          <p className="text-[11px] text-slate-600 m-0 mt-0.5">{isBacklogged ? "⚠️ Outbox backlog growing" : "Sufficient headroom"}</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-600 block">Duplicates Intercepted</span>
          <span className="font-sans text-base sm:text-lg font-extrabold text-amber-700">
            {duplicateEventsPerMin.toLocaleString("en-US")} / min
          </span>
          <p className="text-[11px] text-slate-600 m-0 mt-0.5">Deduplicated at consumer</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-600 block">Delivery Guarantee</span>
          <span className="font-sans text-base sm:text-lg font-extrabold text-emerald-700">
            At-Least-Once
          </span>
          <p className="text-[11px] text-slate-600 m-0 mt-0.5">Zero lost events</p>
        </div>
      </div>

      {/* Senior Engineer Insight */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs font-sans text-slate-700 leading-relaxed">
        <strong className="text-blue-900 font-bold block mb-1">💡 Architecture Synthesis:</strong>
        {relayType === "poll" ? (
          <>
            With <strong>Polling Relay (SKIP LOCKED)</strong>, {workerCount} workers drain up to {maxRelayCapacityWps.toLocaleString("en-US")} WPS. Because the outbox query uses a partial index (<code>WHERE published_at IS NULL</code>), table scans remain fast. Consumers must still store idempotency keys to drop the ~{duplicateEventsPerMin.toLocaleString("en-US")} duplicate re-deliveries every minute.
          </>
        ) : (
          <>
            With <strong>CDC Debezium WAL streaming</strong>, latency drops to ~{cdcLagMs}ms without polling query overhead. The outbox table can be pruned via table partitioning by <code>created_at</code>, keeping database maintenance overhead near zero.
          </>
        )}
      </div>
    </div>
  );
}
