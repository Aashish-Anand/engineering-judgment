import type { ComponentType } from "react";
import type { TopicId } from "@/data/topics/catalog";
import { Amplification, BranchFlow, BudgetBars, DiagramFigure, Sequence, Swimlane } from "./kit/DiagramKit";

/* One concept diagram per data-driven blueprint. Figures mirror the article prose; change both together. */

function PaymentCrashWindow() {
  return (
    <DiagramFigure scroll title="Crash window · one intent, one provider key" caption="The shaded rows are the ambiguous window: the provider has charge C, but your database still says pending. Every retry and recovery reuses key K, so the provider returns C instead of charging again.">
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
          { from: 4, to: 3, label: "look up or retry with K", tone: "accent" },
          { from: 3, to: 4, label: "returns C (deduplicated)", tone: "ok" },
          { from: 4, to: 2, label: "P = succeeded, only if pending", tone: "ok" },
        ]}
      />
    </DiagramFigure>
  );
}

function PoisonAcknowledgementPaths() {
  return (
    <DiagramFigure title="Three outcomes · when each one may acknowledge" caption="An acknowledgement is a promise that the work is safe. Success acknowledges after the effect is durable; a permanent failure acknowledges only after quarantine confirms a durable copy.">
      <BranchFlow
        trunk={["Queue delivers event 41", "Consumer validates and classifies"]}
        branches={[
          { label: "Success", tone: "ok", steps: [{ text: "Apply the effect and record event ID 41 in one transaction" }, { text: "Acknowledge", marker: "ACK" }], end: "A redelivery finds ID 41 and is skipped." },
          { label: "Transient failure", tone: "warn", steps: [{ text: "Dependency timeout or 503" }, { text: "Retry later with backoff, bounded by attempts and age", marker: "NO ACK" }], end: "When the budget runs out, treat it as permanent." },
          { label: "Permanent failure", tone: "bad", steps: [{ text: "Invalid payload or unknown version" }, { text: "Write the original event, error, and attempts to quarantine" }, { text: "Acknowledge after quarantine confirms", marker: "ACK" }], end: "Repair, then replay a canary batch at a capped rate." },
        ]}
      />
    </DiagramFigure>
  );
}

function RetryAmplificationTree() {
  return (
    <DiagramFigure title="Calls reaching each layer · all attempts fail" caption="Three layers that each allow three total attempts multiply: 3 × 3 × 3 = 27 calls for one original request. Giving one layer ownership of retries caps the dependency at 3.">
      <Amplification
        columns={[
          { title: "Every layer retries (3 attempts each)", tone: "bad", levels: [{ label: "User request", calls: 1 }, { label: "API", calls: 3 }, { label: "Client SDK", calls: 9 }, { label: "Inventory", calls: 27 }], total: "27 calls hit a dependency that is already slow." },
          { title: "One retry owner (the API)", tone: "ok", levels: [{ label: "User request", calls: 1 }, { label: "API", calls: 1 }, { label: "Client SDK", calls: 3 }, { label: "Inventory", calls: 3 }], total: "At most 3 calls, inside the deadline and the retry budget." },
        ]}
      />
    </DiagramFigure>
  );
}

function ConnectionBudget() {
  return (
    <DiagramFigure title="Connection demand against a 160-session budget" caption="The budget is what the application may use after reserving sessions for administration, workers, and other services. Replicas multiply pool size, and a rolling deploy briefly runs old and new replicas together.">
      <BudgetBars
        max={340}
        limit={160}
        limitLabel="App budget · 160"
        unit="sessions"
        rows={[
          { label: "8 replicas × pool 20", segments: [{ label: "8 × 20", value: 160, tone: "accent" }], note: "Exactly at the budget: no headroom for variance." },
          { label: "Rolling deploy · 8 old + 2 surge", segments: [{ label: "8 old × 20", value: 160, tone: "accent" }, { label: "2 new × 20", value: 40, tone: "warn" }], note: "Old and new replicas overlap; steady-state counts hide this peak." },
          { label: "Autoscale to 16 replicas × pool 20", segments: [{ label: "16 × 20", value: 320, tone: "bad" }], note: "Twice the budget: the database refuses sessions while requests queue." },
          { label: "16 replicas × pool 10", segments: [{ label: "16 × 10", value: 160, tone: "ok" }], note: "Divide the budget by the maximum replica count, then leave room for surge." },
        ]}
      />
    </DiagramFigure>
  );
}

function SchemaPhases() {
  return (
    <DiagramFigure scroll title="Who reads and writes what · expand to contract" caption="Every phase keeps each running version working. The old column stays written until the rollback image no longer needs it; only then is it dropped.">
      <Swimlane
        columns={["Expand", "Bridge", "Backfill", "Switch reads", "Contract"]}
        rows={[
          { label: "Schema", cells: [{ text: "+ fulfillment_note (nullable)", tone: "info" }, { text: "Both columns", tone: "neutral" }, { text: "Both columns", tone: "neutral" }, { text: "Both columns", tone: "neutral" }, { text: "Drop delivery_instructions", tone: "warn" }] },
          { label: "App v1 (old)", cells: [{ text: "Reads and writes old", tone: "neutral" }, { text: "Draining", tone: "warn" }, null, null, null] },
          { label: "App v2 (bridge)", cells: [null, { text: "Writes both · reads old", tone: "info" }, { text: "Writes both · reads old", tone: "info" }, { text: "Writes both · reads new (flag)", tone: "ok" }, null] },
          { label: "Backfill job", cells: [null, null, { text: "Copy old → new where new is null, in chunks", tone: "info" }, { text: "Verify values agree", tone: "ok" }, null] },
          { label: "App v3 (new)", cells: [null, null, null, null, { text: "Reads and writes new only", tone: "ok" }] },
          { label: "Rollback target", cells: [{ text: "v1 safe", tone: "ok" }, { text: "v1 safe", tone: "ok" }, { text: "v1 safe: old still written", tone: "ok" }, { text: "v2 safe", tone: "ok" }, { text: "Window closed", tone: "bad" }] },
        ]}
      />
    </DiagramFigure>
  );
}

/** Where each diagram appears: after the paragraphs of the named section. */
export const blueprintConceptDiagrams: Partial<Record<TopicId, { sectionId: string; Diagram: ComponentType }>> = {
  "idempotent-api": { sectionId: "worked-example", Diagram: PaymentCrashWindow },
  "poison-messages": { sectionId: "mental-model", Diagram: PoisonAcknowledgementPaths },
  "retry-storm": { sectionId: "naive", Diagram: RetryAmplificationTree },
  "connection-pool": { sectionId: "mental-model", Diagram: ConnectionBudget },
  "schema-evolution": { sectionId: "mental-model", Diagram: SchemaPhases },
};
