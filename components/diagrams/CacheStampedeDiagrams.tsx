"use client";

import { useState } from "react";
import { stampedeLoad } from "@/data/pressure-models";
import { BranchFlow, BudgetBars, DiagramFigure, Sequence, type Tone } from "./kit/DiagramKit";
import { Range } from "./kit/Range";

/* Cache stampede diagrams. Figures mirror content/blueprints/cache-stampede.mdx; change both together. */

/** Rebuild queries the database can run at once before its latency climbs (illustrative). */
const DB_HEADROOM = 150;

export function StampedeSequence() {
  return (
    <DiagramFigure
      scroll
      title="One key expires · 300 ms later, 3,600 identical queries"
      caption="The shaded rows are the rebuild window. Every request that arrives in it misses and runs the same query. The extra queries slow the database, which lengthens the window, which lets in more misses."
    >
      <Sequence
        actors={["12,000 req/s", "App fleet", "Cache", "Database"]}
        window={{ from: 2, to: 6, label: "REBUILD WINDOW" }}
        steps={[
          { from: 0, to: 1, label: "GET /home · region=eu" },
          { from: 2, to: 2, label: "home:eu TTL expires", tone: "warn" },
          { from: 1, to: 2, label: "miss" },
          { from: 1, to: 3, label: "rebuild query #1 · 300 ms", tone: "accent" },
          { from: 1, to: 3, label: "rebuild queries #2 … #3,600", detail: "same key, same result, all at once", tone: "bad" },
          { from: 3, to: 3, label: "CPU saturated · 300 ms becomes 3 s", tone: "bad" },
          { from: 1, to: 3, label: "window is now 10× longer · more misses", tone: "bad" },
          { from: 1, to: 2, label: "SET home:eu (3,600 times)" },
        ]}
      />
    </DiagramFigure>
  );
}

export function StampedeProtectionFlow() {
  return (
    <DiagramFigure title="One read path, three cache states" caption="The soft expiry triggers a refresh while the value is still servable, so readers never wait. Only a value that is completely missing makes readers wait, and even then one request rebuilds it.">
      <BranchFlow
        trunk={["Request for home:eu", "Read value + soft expiry"]}
        branches={[
          { label: "Fresh", tone: "ok", steps: [{ text: "Before soft expiry" }, { text: "Optionally refresh early (XFetch)", marker: "rare" }], end: "Return the cached value." },
          { label: "Stale but present", tone: "warn", steps: [{ text: "Return the stale value now" }, { text: "SET lock NX PX 5000" }, { text: "Winner refreshes in the background", marker: "1 query" }], end: "Readers never wait; the next read is fresh." },
          { label: "Missing (cold)", tone: "bad", steps: [{ text: "SET lock NX PX 5000" }, { text: "Winner rebuilds; others poll the cache", marker: "1 query" }, { text: "Give up after 2 s: fall back or fail" }], end: "Only a cold key makes readers wait." },
        ]}
      />
    </DiagramFigure>
  );
}

export function CacheStampedeWorkbench() {
  const [rate, setRate] = useState(12_000);
  const [rebuild, setRebuild] = useState(300);
  const [instances, setInstances] = useState(40);
  const load = stampedeLoad(rate, rebuild, instances);
  const tone = (queries: number): Tone => (queries > DB_HEADROOM ? "bad" : queries > DB_HEADROOM * 0.7 ? "warn" : "ok");
  const row = (label: string, queries: number, note: string) => ({ label, segments: [{ label: queries.toLocaleString("en-US"), value: queries, tone: tone(queries) }], note });
  return (
    <DiagramFigure
      animate={false}
      title={`Rebuild queries when one hot key expires · database headroom ${DB_HEADROOM}`}
      controls={<>
        <Range label="Requests per second for the key" value={rate} min={1000} max={40_000} step={1000} valueText={rate.toLocaleString("en-US")} onChange={setRate} />
        <Range label="Rebuild query time" value={rebuild} min={50} max={2000} step={50} unit=" ms" onChange={setRebuild} />
        <Range label="App instances" value={instances} min={5} max={200} step={5} onChange={setInstances} />
      </>}
      caption={<>{rate.toLocaleString("en-US")} requests per second × {rebuild} ms ≈ {load.misses.toLocaleString("en-US")} requests arrive while the value is missing. This counts only the first window: once the database is past its headroom, the rebuild slows down and the window, and the count, grow.</>}
    >
      <BudgetBars
        max={DB_HEADROOM * 4}
        limit={DB_HEADROOM}
        limitLabel={`DB headroom · ${DB_HEADROOM}`}
        unit="queries"
        rows={[
          row("No protection", load.unprotected.queries, `Every miss queries the database, and ${load.unprotected.waiting.toLocaleString("en-US")} requests wait for it.`),
          row(`Single-flight in each of ${instances} instances`, load.singleFlight.queries, load.singleFlight.queries > DB_HEADROOM ? "One query per instance: the fleet is now big enough to stampede on its own." : "One query per instance. It grows with the fleet, so autoscaling eats the margin."),
          row("Shared lock or lease", load.lock.queries, `One query for the whole fleet, but ${load.lock.waiting.toLocaleString("en-US")} requests still wait for it.`),
          row("Serve stale, refresh in background", load.serveStale.queries, "One query, and nobody waits: readers get the previous value until the refresh lands."),
        ]}
      />
    </DiagramFigure>
  );
}
