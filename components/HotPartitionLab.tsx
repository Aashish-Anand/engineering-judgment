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

  return <section className="my-8 bg-white border border-ink rounded-xl p-4 sm:p-6" aria-label="Traffic experiment">
    <h3 className="font-hand text-2xl font-bold mb-2">You are on call. Try a fix.</h3>
    <p>Focus on the 70,000 requests/s for the hot post. Each independent DB partition has an assumed 10,000 requests/s limit. Other posts are outside this experiment.</p>
    <div className="flex flex-wrap gap-2 mb-5">
      {(["reads", "writes"] as const).map((value) => <button type="button" key={value} onClick={() => setMode(value)} aria-pressed={mode === value} className={`doodle-btn ${mode === value ? "bg-pastel-yellow" : "bg-paper"}`}>{value === "reads" ? "Reading the post" : "Saving post likes"}</button>)}
    </div>
    {mode === "reads" ? <label className="block mb-5 font-medium">Reads served by the cache: {cache}%<input className="block w-full mt-4 accent-[#171717]" type="range" min={0} max={99} value={cache} onChange={(e) => setCache(Number(e.target.value))} /><span className="block text-sm mt-2 font-normal">Try 90%: does most traffic still reach the database?</span></label> : <label className="block mb-5 font-medium">Independent DB partitions sharing post-like writes<select className="block w-full p-3 border border-ink rounded mt-2 bg-paper" value={partitions} onChange={(e) => setPartitions(Number(e.target.value))}>{[1,2,4,7,8,16].map((n) => <option key={n} value={n}>{n} {n === 1 ? "partition" : "partitions"}</option>)}</select><span className="block text-sm mt-2 font-normal">Compare 7 and 8. Reaching the limit leaves no room for a burst.</span></label>}
    <figure className="my-5">
      <figcaption className="text-sm mb-3">Requests per second at each partition · fixed scale from 0 to 70,000</figcaption>
      <div className="space-y-2">
        {Array.from({ length: result.count }, (_, i) => <div key={i} className="grid grid-cols-[2rem_1fr_4rem] sm:grid-cols-[3rem_1fr_5rem] items-center gap-2 text-sm"><span>P{i + 1}</span><div className="relative h-5 bg-paper-alt rounded" aria-hidden="true"><div className={`h-full rounded ${result.status === "overloaded" ? "bg-[#DC2626]" : result.status === "little-room" ? "bg-[#B45309]" : "bg-[#15803D]"}`} style={{ width: `${result.perDestination / result.incoming * 100}%` }} /><span className="absolute inset-y-[-3px] border-l-2 border-ink" style={{left:"14.2857%"}} /></div><span className="text-right tabular-nums">{format(result.perDestination)}</span></div>)}
      </div>
      <p className="text-sm mt-3 mb-0">Black marker = 10,000 requests/s limit. P = partition.</p>
    </figure>
    <div className="border-t border-ink/20 pt-4" aria-live="polite">
      <strong>{stateLabel}.</strong>
      <p className="mt-2">{mode === "reads" ? `${format(result.cachedRequests)} reads/s stop at the cache. ${format(result.databaseRequests)} reach the database.` : `70,000 writes/s ÷ ${result.count} partitions = ${format(result.perDestination)} writes/s each.`} {result.excess > 0 ? `${format(result.excess)} requests/s exceed total capacity; they must wait or be rejected.` : "There is no excess work in this steady-state calculation."}</p>
    </div>
    <details className="text-sm"><summary className="cursor-pointer font-semibold">What this experiment assumes</summary><p className="mt-2 mb-0">All requests have the same cost; write traffic is spread evenly over separate physical resources; cache capacity is sufficient. The 80% threshold is a teaching guide for spare room, not a universal rule. Real capacity depends on payload size, operation type, and existing traffic. Caching cannot safely replace saving new actions.</p></details>
  </section>;
}
