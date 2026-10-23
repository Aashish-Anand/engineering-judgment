"use client";

import { useState, useId } from "react";
import styles from "./LearningWidgets.module.css";

const DAILY_WRITE_PRESETS = [
  { label: "1M", value: 1_000_000 },
  { label: "5M", value: 5_000_000 },
  { label: "10M (Scenario)", value: 10_000_000 },
  { label: "50M", value: 50_000_000 },
  { label: "100M", value: 100_000_000 },
];

const ROW_SIZE_PRESETS = [
  { label: "1 KB", value: 1 },
  { label: "2 KB (Default)", value: 2 },
  { label: "4 KB", value: 4 },
  { label: "8 KB", value: 8 },
];

const PEAK_MULTIPLIERS = [
  { label: "1.5×", value: 1.5 },
  { label: "3.0× (Standard)", value: 3.0 },
  { label: "5.0× (Flash Surge)", value: 5.0 },
];

export function CapacitySizingLab() {
  const [dailyWrites, setDailyWrites] = useState<number>(10_000_000);
  const [rowKb, setRowKb] = useState<number>(2);
  const [peakMultiplier, setPeakMultiplier] = useState<number>(3.0);
  const headingId = useId();

  // Calculations
  const avgWps = Math.round(dailyWrites / 86_400);
  const peakWps = Math.round(avgWps * peakMultiplier);
  const walKbPerSec = Math.round(peakWps * rowKb);
  const walGbPerHour = ((walKbPerSec * 3600) / (1024 * 1024)).toFixed(2);
  
  // Historical backfill estimation for 250M rows at 1,000 rows/batch with 30ms sleep
  const totalBatches = 250_000_000 / 1_000;
  const backfillSeconds = (totalBatches * 35) / 1000; // 35ms per chunk (query + network + delay)
  const backfillHours = (backfillSeconds / 3600).toFixed(1);

  const inputs = [
    { id: "writes", label: "Daily writes", value: dailyWrites, options: DAILY_WRITE_PRESETS, change: setDailyWrites },
    { id: "payload", label: "Row payload", value: rowKb, options: ROW_SIZE_PRESETS, change: setRowKb },
    { id: "burst", label: "Peak multiplier", value: peakMultiplier, options: PEAK_MULTIPLIERS, change: setPeakMultiplier },
  ];

  return (
    <div className={styles.calculator} aria-labelledby={headingId}>
      <h3 id={headingId}>Capacity &amp; sizing</h3>
      <p className={styles.description}>Change the workload to estimate write throughput and replication capacity.</p>
      <div className={styles.inputs}>
        {inputs.map(input => <label key={input.id} htmlFor={`${headingId}-${input.id}`}>
          {input.label}
          <select id={`${headingId}-${input.id}`} value={input.value} onChange={event => input.change(Number(event.target.value))}>
            {input.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>)}
      </div>
      <dl className={styles.metrics} aria-live="polite">
        <div><dt>Avg / peak writes</dt><dd>{avgWps.toLocaleString("en-US")} / {peakWps.toLocaleString("en-US")}<small> writes/s</small></dd></div>
        <div><dt>WAL stream</dt><dd>{walGbPerHour}<small> GB/hr</small></dd></div>
        <div><dt>250M-row backfill</dt><dd>~{backfillHours}<small> hours</small></dd></div>
        <div><dt>CDC lag alert</dt><dd>&lt; 1,000<small> ms</small></dd></div>
      </dl>
      <details className={styles.notes}>
        <summary>Capacity assumptions &amp; takeaway</summary>
        <p>At {dailyWrites.toLocaleString("en-US")} writes/day, the source produces {walGbPerHour} GB/hr of write-ahead logs (~{walKbPerSec.toLocaleString("en-US")} KB/s). A consumer rate of at least {(peakWps * 1.5).toFixed(0)} writes/s provides headroom to drain lag spikes. Backfill assumes 250M rows, 1,000 rows per batch, and 35ms per batch including delay.</p>
      </details>
    </div>
  );
}
