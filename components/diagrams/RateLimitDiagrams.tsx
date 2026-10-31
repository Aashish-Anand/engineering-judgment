"use client";

import { useState } from "react";
import { boundaryBurst } from "@/data/pressure-models";
import { BranchFlow, BudgetBars, DiagramFigure, Swimlane, type Tone } from "./kit/DiagramKit";
import { Range } from "./kit/Range";

/* Rate limiting diagrams. Figures mirror content/blueprints/rate-limiting.mdx; change both together. */

export function NaiveLimiterLanes() {
  return (
    <DiagramFigure
      scroll
      title="Three first attempts at 600 requests per minute"
      caption="Each design enforces something, just not the limit you wrote down. The fixed window leaks at its edges, local counters multiply by the fleet, and a read-then-write counter loses updates under concurrency."
    >
      <Swimlane
        columns={["Fixed window in Redis", "Counter on each gateway", "GET then SET in Redis"]}
        rows={[
          { label: "How it counts", cells: [{ text: "INCR key per minute; reset at :00", tone: "neutral" }, { text: "In-memory map on each of 30 gateways", tone: "neutral" }, { text: "Read count, add one, write it back", tone: "neutral" }] },
          { label: "Where it breaks", cells: [{ text: "600 at 0:59 + 600 at 1:00", tone: "bad" }, { text: "Load balancer spreads one client across 30 counters", tone: "bad" }, { text: "Two gateways read 599 and both write 600", tone: "bad" }] },
          { label: "What gets through", cells: [{ text: "1,200 in two seconds", tone: "bad" }, { text: "Up to 18,000 a minute", tone: "bad" }, { text: "Over the limit by however many raced", tone: "bad" }] },
          { label: "Worth keeping", cells: [{ text: "Atomic increment", tone: "ok" }, { text: "Local fallback when Redis is down", tone: "ok" }, { text: "One round trip per request", tone: "ok" }] },
        ]}
      />
    </DiagramFigure>
  );
}

export function RateLimitDecisionFlow() {
  return (
    <DiagramFigure title="Every request, one atomic decision" caption="The limiter decides in one round trip and always tells the client what happened. When the shared store is unreachable it degrades to a per-gateway bucket instead of letting everything through or rejecting everyone.">
      <BranchFlow
        trunk={["Request at the gateway", "Identify the caller (API key)", "EVALSHA bucket script · 1 round trip"]}
        branches={[
          { label: "Token available", tone: "ok", steps: [{ text: "Spend one token" }, { text: "Add RateLimit headers", marker: "remaining" }], end: "Forward to the service." },
          { label: "Bucket empty", tone: "warn", steps: [{ text: "Spend nothing" }, { text: "Retry-After = time to next token" }], end: "Return 429 without touching the service." },
          { label: "Redis unreachable", tone: "bad", steps: [{ text: "Timeout after 5 ms" }, { text: "Local bucket: limit ÷ gateways", marker: "fallback" }], end: "Fail open, but bounded; alert." },
        ]}
      />
    </DiagramFigure>
  );
}

export function RateLimitWorkbench() {
  const [perMinute, setPerMinute] = useState(600);
  const [burst, setBurst] = useState(100);
  const [gateways, setGateways] = useState(30);
  const allowed = boundaryBurst(perMinute, burst, gateways);
  const tone = (value: number): Tone => (value > perMinute ? "bad" : value > perMinute * 0.5 ? "warn" : "ok");
  const row = (label: string, value: number, note: string) => ({ label, segments: [{ label: value.toLocaleString("en-US"), value, tone: tone(value) }], note });
  return (
    <DiagramFigure
      animate={false}
      title={`One client, two seconds around the minute boundary · limit ${perMinute.toLocaleString("en-US")}/min`}
      controls={<>
        <Range label="Limit per minute" value={perMinute} min={60} max={1200} step={60} onChange={setPerMinute} />
        <Range label="Token bucket burst capacity" value={burst} min={10} max={600} step={10} onChange={setBurst} />
        <Range label="Gateway instances" value={gateways} min={1} max={30} onChange={setGateways} />
      </>}
      caption={<>The client saves its allowance, then sends as fast as it can from 0:59 to 1:01. The red line is the whole minute&apos;s limit; anything past it in two seconds is a burst your backend was never sized for. The bucket refills {(perMinute / 60).toLocaleString("en-US", { maximumFractionDigits: 1 })} tokens per second, so its long-run rate matches the limit while its burst stays at {burst}.</>}
    >
      <BudgetBars
        max={perMinute * 4}
        limit={perMinute}
        limitLabel={`Limit · ${perMinute.toLocaleString("en-US")}`}
        unit="requests"
        rows={[
          row(`Fixed window on each of ${gateways} ${gateways === 1 ? "gateway" : "gateways"}`, allowed.localCounters, gateways === 1 ? "With one gateway, local counting is just a fixed window." : `Each gateway grants the full allowance, twice, around the boundary: ${gateways} × 2 × ${perMinute.toLocaleString("en-US")}.`),
          row("Fixed window, shared counter", allowed.fixedWindow, "The counter resets at :00, so the old minute's allowance and the new one are spent back to back."),
          row("Sliding window counter", allowed.slidingWindow, "Just after :00 the previous minute still counts at full weight, so nothing new is allowed yet."),
          row(`Token bucket · burst ${burst}`, allowed.tokenBucket, allowed.tokenBucket >= perMinute ? "A burst capacity as large as the limit lets the whole minute through at once." : "Only the saved burst plus two seconds of refill; the rest waits for tokens."),
        ]}
      />
    </DiagramFigure>
  );
}
