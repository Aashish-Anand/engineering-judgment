"use client";

import { useId, useState } from "react";
import { paymentTrace, poolPressure, retryLevels, rollingSurgeReplicas } from "@/data/pressure-models";
import { Amplification, BudgetBars, DiagramFigure, Sequence, type SequenceStep, type Tone } from "./kit/DiagramKit";

/* The blueprint diagrams that carry a real what-if. Each one replaces a separate text-only workbench;
   figures and wording mirror the article prose, so change both together. */

function Range({ label, value, min, max, step = 1, unit = "", onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (value: number) => void }) {
  const id = useId();
  return (
    <label htmlFor={id}>
      <span>{label}: <output htmlFor={id}>{value}{unit}</output></span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
    </label>
  );
}

export function RetryAmplificationWorkbench() {
  const [layers, setLayers] = useState(3);
  const [attempts, setAttempts] = useState(3);
  const { everyLayer, oneOwner } = retryLevels(layers, attempts);
  const worst = everyLayer.at(-1)!.calls;
  return (
    <DiagramFigure
      id="workbench"
      animate={false}
      title="Calls reaching each hop · every attempt fails"
      controls={<>
        <Range label="Retrying layers" value={layers} min={1} max={4} onChange={setLayers} />
        <Range label="Attempts per layer (including first)" value={attempts} min={1} max={4} onChange={setAttempts} />
      </>}
      caption={<>Nested retries multiply: {attempts} attempts across {layers} {layers === 1 ? "layer" : "layers"} is {attempts}<sup>{layers}</sup> = {worst} {worst === 1 ? "call" : "calls"} at the dependency for one original request. Jitter spreads the timing but not this count; one retry owner, a deadline, and a retry budget cap it.</>}
    >
      <Amplification
        columns={[
          { title: `Every layer retries (${attempts} attempts each)`, tone: worst > attempts ? "bad" : "neutral", levels: everyLayer, total: `${worst} ${worst === 1 ? "call hits" : "calls hit"} a dependency that may already be slow.` },
          { title: "One retry owner (next to the dependency)", tone: "ok", levels: oneOwner, total: `At most ${attempts} ${attempts === 1 ? "call" : "calls"}, inside the deadline and the retry budget.` },
        ]}
      />
    </DiagramFigure>
  );
}

const CHECKOUTS_PER_SECOND = 400;

export function ConnectionBudgetWorkbench() {
  const [replicas, setReplicas] = useState(8);
  const [poolSize, setPoolSize] = useState(20);
  const [hold, setHold] = useState(40);
  const steady = poolPressure(replicas, poolSize, CHECKOUTS_PER_SECOND, hold);
  const surgeReplicas = rollingSurgeReplicas(replicas);
  const surge = surgeReplicas * poolSize;
  const inUse = Math.round(steady.averageOccupancy);
  const ceiling = Math.min(steady.maximumSessions, steady.budget);
  const sessionTone = (value: number): Tone => (value > steady.budget ? "bad" : value === steady.budget ? "warn" : "accent");
  const useTone: Tone = inUse >= ceiling ? "bad" : inUse >= ceiling * 0.7 ? "warn" : "ok";
  return (
    <DiagramFigure
      id="workbench"
      animate={false}
      title="Connection demand against a 160-session budget"
      controls={<>
        <Range label="Application replicas" value={replicas} min={2} max={20} step={2} onChange={setReplicas} />
        <Range label="Pool size per replica" value={poolSize} min={5} max={40} step={5} onChange={setPoolSize} />
        <Range label="Average checkout time" value={hold} min={20} max={600} step={20} unit=" ms" onChange={setHold} />
      </>}
      caption={<>The budget is what the application may use after reserving sessions for administration, workers, and other services. Average connections in use follow Little&apos;s Law: {CHECKOUTS_PER_SECOND} checkouts per second × {hold} ms ≈ {inUse}. This is a stable-workload average; bursts and tail latency need headroom above it.</>}
    >
      <BudgetBars
        max={Math.max(420, surge)}
        limit={steady.budget}
        limitLabel={`App budget · ${steady.budget}`}
        unit="sessions"
        rows={[
          { label: `Every pool full · ${replicas} × ${poolSize}`, segments: [{ label: `${replicas} × ${poolSize}`, value: steady.maximumSessions, tone: sessionTone(steady.maximumSessions) }], note: steady.maximumSessions > steady.budget ? "Replica pools can open more sessions than the database allows." : "Replica pools fit within the budget." },
          { label: `Rolling deploy · ${surgeReplicas} replicas briefly`, segments: [{ label: `${replicas} old`, value: steady.maximumSessions, tone: sessionTone(steady.maximumSessions) }, { label: `+${surgeReplicas - replicas} new`, value: surge - steady.maximumSessions, tone: "warn" }], note: surge > steady.budget ? "The 25% surge pushes demand past the budget during every deploy." : "Even the deploy surge fits." },
          { label: "Average in use", segments: [{ label: `${inUse}`, value: inUse, tone: useTone }], note: inUse >= ceiling ? "No headroom: requests will queue for connections even at average load." : inUse >= ceiling * 0.7 ? "Little headroom for bursts; find the missing hold time before adding connections." : "Average demand fits with headroom for bursts." },
        ]}
      />
    </DiagramFigure>
  );
}

const recoverySteps = (freshKey: boolean): SequenceStep[] => freshKey
  ? [
    { from: 4, to: 3, label: "charge(new key K2)", tone: "bad" },
    { from: 3, to: 3, label: "charge C2 created", tone: "bad" },
    { from: 4, to: 2, label: "P = succeeded · customer charged twice", tone: "bad" },
  ]
  : [
    { from: 4, to: 3, label: "look up or retry with K", tone: "accent" },
    { from: 3, to: 4, label: "returns C (deduplicated)", tone: "ok" },
    { from: 4, to: 2, label: "P = succeeded, only if pending", tone: "ok" },
  ];

export function PaymentCrashWorkbench() {
  const [freshKey, setFreshKey] = useState(false);
  const toggleId = useId();
  const charges = paymentTrace(!freshKey).charges;
  return (
    <DiagramFigure
      id="workbench"
      scroll
      title="Crash window · one intent, one provider key"
      controls={<label htmlFor={toggleId}><input id={toggleId} type="checkbox" checked={freshKey} onChange={e => setFreshKey(e.target.checked)} /> Recovery uses a fresh key (breaks the contract) · <strong>{charges} {charges === 1 ? "charge" : "charges"}</strong></label>}
      caption={freshKey
        ? "With a new key, the provider cannot recognise the retry as the same payment, so it creates charge C2. Someone now has to detect and refund the duplicate."
        : "The shaded rows are the ambiguous window: the provider has charge C, but your database still says pending. Every retry and recovery reuses key K, so the provider returns C instead of charging again."}
    >
      <Sequence
        actors={["Client", "API", "Intent DB", "Provider", "Recovery"]}
        window={{ from: 3, to: 7, label: "AMBIGUOUS" }}
        steps={[
          { from: 0, to: 1, label: "POST /pay · key K" },
          { from: 1, to: 2, label: "claim K → intent P", detail: "unique constraint picks one owner", tone: "accent" },
          { from: 1, to: 3, label: "charge(key K)" },
          { from: 3, to: 3, label: "charge C created", tone: "ok" },
          { from: 1, to: 1, label: "worker crashes before saving C", tone: "bad" },
          { from: 0, to: 1, label: "retry · same key K" },
          { from: 1, to: 2, label: "K exists → P is pending", detail: "no new intent, no new key", tone: "accent" },
          { from: 1, to: 0, label: "202 · pending" },
          ...recoverySteps(freshKey),
        ]}
      />
    </DiagramFigure>
  );
}
