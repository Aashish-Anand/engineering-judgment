"use client";

import { useState } from "react";
import { paymentTrace, poisonTrace, poolPressure, retryPressure, schemaPhases } from "@/data/pressure-models";
import styles from "./ProductionPressureLab.module.css";

export type PressureLabKind = "idempotent-api" | "poison-messages" | "retry-storm" | "connection-pool" | "schema-evolution";

export function ProductionPressureLab({ kind }: { kind: PressureLabKind }) {
  const [stable, setStable] = useState(true);
  const [step, setStep] = useState(0);
  const [limit, setLimit] = useState(3);
  const [ordered, setOrdered] = useState(true);
  const [layers, setLayers] = useState(3);
  const [attempts, setAttempts] = useState(3);
  const [replicas, setReplicas] = useState(8);
  const [hold, setHold] = useState(40);
  const [phase, setPhase] = useState(0);
  const [oldReader, setOldReader] = useState(true);
  const [newReader, setNewReader] = useState(false);
  const retry = retryPressure(layers, attempts);
  const pool = poolPressure(replicas, 20, 400, hold);
  const payment = paymentTrace(stable);
  const poison = poisonTrace(limit, ordered);
  const schema = schemaPhases[phase];

  return <div className={styles.lab}>
    <span className="eyebrow">Interactive workbench</span>
    <p className={styles.note}>Illustrative model. Change one assumption and follow its consequence.</p>
    {kind === "idempotent-api" && <>
      <h3>Recover after a charge succeeds and the worker crashes</h3>
      <label className={styles.toggle}><input type="checkbox" checked={stable} onChange={e => { setStable(e.target.checked); setStep(0); }} /> Reuse the original provider key</label>
      <p className={styles.note}>Assumes the provider durably deduplicates this key and recovery occurs inside its retention window. The unchecked case deliberately breaks that contract.</p>
      <ol className={styles.trace}>{payment.steps.slice(0, step + 1).map(item => <li key={item}>{item}</li>)}</ol>
      <div className={styles.buttons}><button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>Previous</button><button type="button" disabled={step === 4} onClick={() => setStep(step + 1)}>Next event</button><button type="button" onClick={() => setStep(0)}>Reset trace</button></div>
      <p role="status">Step {step + 1} of 5 · {step < 1 ? 0 : step < 3 ? 1 : payment.charges} provider charge(s). {step === 2 ? "Local outcome is unknown." : ""}</p>
    </>}
    {kind === "poison-messages" && <>
      <h3>Event 41 fails validation; event 42 ships the same order</h3>
      <label>Total attempts before quarantine: <strong>{limit}</strong><input type="range" min="1" max="8" value={limit} onChange={e => setLimit(Number(e.target.value))} /></label>
      <label className={styles.toggle}><input type="checkbox" checked={ordered} onChange={e => setOrdered(e.target.checked)} /> Enforce per-order transitions</label>
      <p className={styles.note}>One permanently invalid event; every attempt fails. Quarantine handoff succeeds durably. Independent orders can continue in either mode.</p>
      <div role="status"><p><strong>{poison.attempts} failed attempt(s), {poison.quarantined} quarantined event.</strong> Raising the limit spends more work on the same invalid payload.</p><p>{poison.following}</p><p>{poison.replay}</p></div>
    </>}
    {kind === "retry-storm" && <>
      <h3>Watch nested retry policies multiply</h3>
      <label>Retrying layers: <strong>{layers}</strong><input type="range" min="1" max="4" value={layers} onChange={e => setLayers(Number(e.target.value))} /></label>
      <label>Total attempts per layer (including first): <strong>{attempts}</strong><input type="range" min="1" max="4" value={attempts} onChange={e => setAttempts(Number(e.target.value))} /></label>
      <p className={styles.note}>Worst case: every attempt reaches the next layer, fails retryably, and no deadline or budget stops it. Fixed batch of 200 original operations; these are counts, not requests per second.</p>
      <div role="status"><p className={styles.metric}>{retry.amplification}× amplification</p><p>200 original operations → {retry.downstreamAttempts.toLocaleString("en-US")} downstream attempts.</p><p>Use one retry owner, then add deadlines and a retry budget. Jitter spreads timing; it does not change this worst-case count.</p></div>
      <button type="button" onClick={() => setLayers(1)}>Compare with one retry owner</button>
    </>}
    {kind === "connection-pool" && <>
      <h3>Allocate 160 application database connections</h3>
      <label>Application replicas: <strong>{replicas}</strong><input type="range" min="2" max="20" step="2" value={replicas} onChange={e => setReplicas(Number(e.target.value))} /></label>
      <label>Average checkout duration: <strong>{hold} ms</strong><input type="range" min="20" max="600" step="20" value={hold} onChange={e => setHold(Number(e.target.value))} /></label>
      <p className={styles.note}>20 connections per replica, 400 checkouts/s total, one checkout per operation. The application budget already excludes other workloads. Occupancy uses a stable-workload estimate; it does not predict overload latency.</p>
      <div role="status"><p className={styles.metric}>{pool.maximumSessions} / {pool.budget} possible sessions</p><p>{pool.maximumSessions > pool.budget ? "Replica pools exceed the shared application budget." : "Replica pools fit within the application budget."}</p><p>Estimated average occupied connections: <strong>{pool.averageOccupancy}</strong>. {pool.averageOccupancy >= Math.min(pool.maximumSessions, pool.budget) ? "No average headroom: the assumed stable workload is not safely supportable." : "Average demand fits; bursts and tail latency still require headroom."}</p></div>
    </>}
    {kind === "schema-evolution" && <>
      <h3>Test readers against the migration phase</h3>
      <label>Migration phase<select value={phase} onChange={e => setPhase(Number(e.target.value))}>{schemaPhases.map((p, i) => <option key={p.label} value={i}>{i + 1}. {p.label}</option>)}</select></label>
      <label className={styles.toggle}><input type="checkbox" checked={oldReader} onChange={e => setOldReader(e.target.checked)} /> Old reader or rollback binary still required</label>
      <label className={styles.toggle}><input type="checkbox" checked={newReader} onChange={e => setNewReader(e.target.checked)} /> Route reads to the new column</label>
      <p className={styles.note}>This scenario copies a value without changing its meaning. Phase prerequisites are assumed complete; selecting a phase does not execute a real migration.</p>
      <div role="status"><p><strong>{schema.label}:</strong> {schema.detail}</p><p>{oldReader && !schema.oldCompatible ? "Unsafe: the old reader references a removed column." : newReader && !schema.safeRead ? "Unsafe: the new representation is not yet proven complete and current." : "Selected reader combination is compatible under this phase’s assumptions."}</p></div>
    </>}
  </div>;
}
