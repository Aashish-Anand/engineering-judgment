"use client";

import { useState, type CSSProperties } from "react";
import { littlesLaw, simulateQueue, type QueueInputs } from "@/data/pressure-models";
import { DiagramFigure, type Tone } from "./DiagramKit";
import { Range } from "./Range";
import styles from "./DiagramKit.module.css";

type Settings = Pick<QueueInputs, "arrivalsPerSecond" | "serviceMs" | "concurrency" | "attempts">;

const BASELINE_MS = 50;
const SLOWDOWN_AT = 5;
const MAX_WAIT_MS = 1000;
const BACKOFF_MS = 500;
const SECONDS = 30;

const whole = (n: number) => Math.round(n).toLocaleString("en-US");
const secondsText = (ms: number) => `${ms / 1000} s`;

/** Rounds a chart's top up to 1, 2 or 5 × a power of ten, so the scale label stays readable. */
function niceMax(value: number) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  return [1, 2, 5, 10].map(m => m * power).find(m => m >= value)!;
}

function TimeSeries({ label, tone, values, format }: { label: string; tone: Tone; values: number[]; format: (n: number) => string }) {
  const top = niceMax(Math.max(...values));
  const x = (i: number) => (i / (values.length - 1)) * 300;
  const y = (v: number) => 100 - (v / top) * 100;
  const line = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const before = values[Math.floor((SLOWDOWN_AT / SECONDS) * values.length) - 1];
  const end = values.at(-1)!;
  const mark = (SLOWDOWN_AT / SECONDS) * 300;
  return (
    <div className={`${styles.chart} ${styles[tone]}`} role="img" aria-label={`${label}: ${format(before)} before the slowdown, ${format(Math.max(...values))} at most, ${format(end)} after ${SECONDS} seconds.`}>
      <div className={styles.chartHead}><span>{label}</span><b>{format(end)}</b></div>
      <div className={styles.plot} aria-hidden="true">
        <svg viewBox="0 0 300 100" preserveAspectRatio="none">
          <polygon className={styles.area} points={`0,100 ${line} 300,100`} />
          <line className={styles.mark} x1={mark} x2={mark} y1={0} y2={100} vectorEffect="non-scaling-stroke" />
          <polyline className={styles.line} points={line} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className={styles.yMax}>{format(top)}</span>
      </div>
      <div className={styles.xAxis} aria-hidden="true" style={{ "--at": `${(SLOWDOWN_AT / SECONDS) * 100}%` } as CSSProperties}>
        <span>↑ slowdown at {SLOWDOWN_AT} s</span><span>{SECONDS} s</span>
      </div>
    </div>
  );
}

/**
 * A dependency behind a waiting queue. Calls take 50 ms until second 5, then the chosen service time.
 * Readers set arrivals, service time, concurrency limit and attempts, and watch queue length,
 * latency and rejected work over 30 seconds, with Little's Law spelled out for their numbers.
 */
export function QueueSimulator({ title, initial }: { title: string; initial: Settings }) {
  const [settings, setSettings] = useState(initial);
  const [redraw, setRedraw] = useState(0);
  const set = (key: keyof Settings) => (value: number) => { setSettings(s => ({ ...s, [key]: value })); setRedraw(n => n + 1); };
  const { arrivalsPerSecond, serviceMs, concurrency, attempts } = settings;
  const { samples, capacityPerSecond } = simulateQueue({ ...settings, baselineServiceMs: BASELINE_MS, slowdownAtSeconds: SLOWDOWN_AT, maxWaitMs: MAX_WAIT_MS, backoffMs: BACKOFF_MS, seconds: SECONDS });
  const end = samples.at(-1)!;
  const needed = littlesLaw(arrivalsPerSecond, serviceMs);
  const before = littlesLaw(arrivalsPerSecond, BASELINE_MS);
  const backlog = needed > concurrency;

  return (
    <DiagramFigure
      animate={false}
      title={title}
      controls={<>
        <Range label="Requests per second" value={arrivalsPerSecond} min={50} max={400} step={25} onChange={set("arrivalsPerSecond")} />
        <Range label="Time per call after the slowdown" value={serviceMs} min={50} max={2000} step={50} unit=" ms" onChange={set("serviceMs")} />
        <Range label="Concurrency limit" value={concurrency} min={20} max={400} step={20} unit=" calls" onChange={set("concurrency")} />
        <Range label="Attempts per request (including first)" value={attempts} min={1} max={4} onChange={set("attempts")} />
      </>}
      caption={`Calls take ${BASELINE_MS} ms until second ${SLOWDOWN_AT}, then the time you set. Work that waits ${secondsText(MAX_WAIT_MS)} without starting is rejected; a retry comes back ${secondsText(BACKOFF_MS)} later. A teaching model, not a capacity forecast.`}
    >
      <div key={redraw} className={`${styles.series} ${redraw > 0 ? styles.redraw : ""}`}>
        <TimeSeries label="Waiting in queue" tone="warn" values={samples.map(s => s.queued)} format={n => whole(n)} />
        <TimeSeries label="Latency" tone="info" values={samples.map(s => s.latencyMs)} format={n => n >= 1000 ? `${(n / 1000).toFixed(1)} s` : `${whole(n)} ms`} />
        <TimeSeries label="Rejected per second" tone="bad" values={samples.map(s => s.rejectedPerSecond)} format={n => whole(n)} />
      </div>
      <div className={styles.law} aria-live="polite">
        <p><b>Little&apos;s Law:</b> calls in progress = requests per second × seconds per call.</p>
        <p>Before the slowdown: <strong>{arrivalsPerSecond} × {secondsText(BASELINE_MS)} = {whole(before)}</strong> calls in progress, within the limit of {concurrency}.</p>
        {backlog
          ? <p>After it: <strong>{arrivalsPerSecond} × {secondsText(serviceMs)} = {whole(needed)}</strong>, but only {concurrency} may run. The dependency now finishes {whole(capacityPerSecond)} calls per second while {arrivalsPerSecond} arrive, so the rest wait. The queue grows until waits pass {secondsText(MAX_WAIT_MS)}, then work is rejected.</p>
          : <p>After it: <strong>{arrivalsPerSecond} × {secondsText(serviceMs)} = {whole(needed)}</strong>, still within the limit of {concurrency}. Nothing waits; each request is just slower.</p>}
        {backlog && attempts > 1 && <p>Each rejection comes back up to {attempts - 1} more {attempts === 2 ? "time" : "times"}, so the dependency is offered {whole(end.offeredPerSecond)} requests per second and still finishes only {whole(end.servedPerSecond)}. Retries add work, not capacity.</p>}
      </div>
    </DiagramFigure>
  );
}
