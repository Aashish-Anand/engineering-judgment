import type { ComponentType } from "react";
import type { TopicId } from "@/data/topics/catalog";
import { BranchFlow, DiagramFigure, Swimlane } from "./kit/DiagramKit";
import { ConnectionBudgetWorkbench, PaymentCrashWorkbench, RetryAmplificationWorkbench, RetryStormQueueSimulator } from "./InteractiveConceptDiagrams";

/* One concept diagram per data-driven blueprint. Figures mirror the article prose; change both together. */

function PoisonAcknowledgementPaths() {
  return (
    <DiagramFigure id="workbench" title="Three outcomes · when each one may acknowledge" caption="An acknowledgement is a promise that the work is safe. Success acknowledges after the effect is durable; a permanent failure acknowledges only after quarantine confirms a durable copy.">
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

function SchemaPhases() {
  return (
    <DiagramFigure id="workbench" scroll title="Who reads and writes what · expand to contract" caption="Every phase keeps each running version working. The old column stays written until the rollback image no longer needs it; only then is it dropped.">
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

/** Where each diagram appears: after the paragraphs of the named section. `interactive` diagrams are the article's workbench; `more` adds diagrams to other sections. */
export const blueprintConceptDiagrams: Partial<Record<TopicId, { sectionId: string; Diagram: ComponentType; interactive: boolean; more?: { sectionId: string; Diagram: ComponentType }[] }>> = {
  "idempotent-api": { sectionId: "worked-example", Diagram: PaymentCrashWorkbench, interactive: true },
  "poison-messages": { sectionId: "mental-model", Diagram: PoisonAcknowledgementPaths, interactive: false },
  "retry-storm": { sectionId: "naive", Diagram: RetryAmplificationWorkbench, interactive: true, more: [{ sectionId: "worked-example", Diagram: RetryStormQueueSimulator }] },
  "connection-pool": { sectionId: "mental-model", Diagram: ConnectionBudgetWorkbench, interactive: true },
  "schema-evolution": { sectionId: "mental-model", Diagram: SchemaPhases, interactive: false },
};
