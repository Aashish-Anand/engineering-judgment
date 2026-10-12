"use client";

import { useState } from "react";
import { calculatePartitionLoad } from "@/data/hot-partition-model";

const format = (value: number) => Math.round(value).toLocaleString("en-US");

export function HotPartitionLab() {
  const [mode, setMode] = useState<"reads" | "writes">("reads");
  const [cache, setCache] = useState(0);
  const [partitions, setPartitions] = useState(1);
  const result = calculatePartitionLoad(mode, cache, partitions);
  const stateLabel = { overloaded: "Overloaded", "little-room": "Below the limit, but little spare room", "room-to-spare": "Room to spare in this model" }[result.status];

  return (
    <section className="my-8 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs" aria-label="Traffic experiment">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="font-sans text-lg sm:text-xl font-bold text-slate-900 m-0">You are on call. Try a fix.</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-0">Focus on the 70,000 req/s for the hot post. Each independent DB partition has an assumed 10,000 req/s limit.</p>
        </div>
        <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">Interactive Simulation</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {(["reads", "writes"] as const).map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => setMode(value)}
            aria-pressed={mode === value}
            className={`text-xs py-1.5 px-3.5 rounded-lg font-sans font-semibold border transition-colors cursor-pointer ${
              mode === value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {value === "reads" ? "Reading the post (Singleflight / Cache)" : "Saving post likes (Write Salting)"}
          </button>
        ))}
      </div>

      {mode === "reads" ? (
        <label className="block mb-5 font-sans text-xs sm:text-sm font-semibold text-slate-700">
          Reads served by cache: <span className="font-mono font-bold text-blue-600">{cache}%</span>
          <input className="block w-full mt-2 accent-blue-600 cursor-pointer" type="range" min={0} max={99} value={cache} onChange={(e) => setCache(Number(e.target.value))} />
          <span className="block text-xs text-slate-400 mt-1 font-normal">Try 90%: notice how much peak load still hits the underlying primary partition.</span>
        </label>
      ) : (
        <label className="block mb-5 font-sans text-xs sm:text-sm font-semibold text-slate-700">
          Independent DB partitions sharing post-like writes
          <select className="block w-full p-2.5 border border-slate-200 rounded-lg mt-2 bg-slate-50 font-mono text-xs sm:text-sm" value={partitions} onChange={(e) => setPartitions(Number(e.target.value))}>
            {[1, 2, 4, 7, 8, 16].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "partition" : "partitions"}</option>
            ))}
          </select>
          <span className="block text-xs text-slate-400 mt-1 font-normal">Compare 7 vs 8 partitions. Operating exactly at the ceiling leaves 0 headroom for traffic bursts.</span>
        </label>
      )}

      <figure className="my-5 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
        <figcaption className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-3">Requests per second at each partition (Scale: 0 to 70,000)</figcaption>
        <div className="space-y-2">
          {Array.from({ length: result.count }, (_, i) => (
            <div key={i} className="grid grid-cols-[2rem_1fr_4rem] sm:grid-cols-[3rem_1fr_5rem] items-center gap-2 text-xs font-mono font-semibold">
              <span className="text-slate-600">P{i + 1}</span>
              <div className="relative h-4 bg-slate-200 rounded overflow-hidden" aria-hidden="true">
                <div
                  className={`h-full rounded ${result.status === "overloaded" ? "bg-red-500" : result.status === "little-room" ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${(result.perDestination / result.incoming) * 100}%` }}
                />
                <span className="absolute inset-y-0 border-l-2 border-slate-900" style={{ left: "14.2857%" }} />
              </div>
              <span className="text-right text-slate-900 tabular-nums">{format(result.perDestination)}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-3 mb-0 font-sans">Dark marker = 10,000 requests/s safe threshold limit per partition node.</p>
      </figure>

      <div className="border-t border-slate-100 pt-3" aria-live="polite">
        <strong className="text-xs sm:text-sm font-sans font-bold text-slate-900">{stateLabel}.</strong>
        <p className="mt-1 text-xs sm:text-sm font-sans text-slate-600 mb-0">
          {mode === "reads" ? `${format(result.cachedRequests)} reads/s absorbed by cache. ${format(result.databaseRequests)} hit the database.` : `70,000 writes/s ÷ ${result.count} partitions = ${format(result.perDestination)} writes/s each.`} {result.excess > 0 ? `${format(result.excess)} requests/s exceed cluster capacity; in-flight requests will queue or reject.` : "System operates within safe physical saturation thresholds."}
        </p>
      </div>
    </section>
  );
}
