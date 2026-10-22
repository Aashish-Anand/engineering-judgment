"use client";

import { useState, useId } from "react";

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

  return (
    <div
      className="my-6 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs"
      aria-labelledby={headingId}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-base select-none" aria-hidden="true">
            🧮
          </span>
          <h3 id={headingId} className="font-sans font-bold text-base sm:text-lg text-slate-900 m-0">
            Live Capacity &amp; Sizing Calculator
          </h3>
        </div>
        <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
          BACK-OF-THE-ENVELOPE SIZING
        </span>
      </div>

      <p className="font-sans text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
        Tweak workload parameters below to compute instantaneous write throughput, continuous WAL generation volume, and the minimum CDC consumer ingestion rate needed to keep replication lag under 1.0s.
      </p>

      {/* Control sliders/selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Daily Writes */}
        <div>
          <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            1. Daily Write Volume
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DAILY_WRITE_PRESETS.map((preset) => {
              const isSelected = dailyWrites === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setDailyWrites(preset.value)}
                  className={`text-xs py-1 px-2.5 rounded font-mono font-medium transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row Payload Size */}
        <div>
          <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            2. Row Payload Size
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ROW_SIZE_PRESETS.map((preset) => {
              const isSelected = rowKb === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setRowKb(preset.value)}
                  className={`text-xs py-1 px-2.5 rounded font-mono font-medium transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Peak Multiplier */}
        <div>
          <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            3. Peak Burst Multiplier
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PEAK_MULTIPLIERS.map((preset) => {
              const isSelected = peakMultiplier === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setPeakMultiplier(preset.value)}
                  className={`text-xs py-1 px-2.5 rounded font-mono font-medium transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Calculated Telemetry Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
        <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Avg / Peak Writes
          </span>
          <span className="font-mono text-base sm:text-lg font-bold text-slate-900 block">
            {avgWps.toLocaleString("en-US")} / <span className="text-blue-600">{peakWps.toLocaleString("en-US")} WPS</span>
          </span>
          <span className="text-[10px] text-slate-500">Peak write burst rate</span>
        </div>

        <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            WAL Stream Volume
          </span>
          <span className="font-mono text-base sm:text-lg font-bold text-amber-600 block">
            {walGbPerHour} GB / hr
          </span>
          <span className="text-[10px] text-slate-500">~{walKbPerSec.toLocaleString("en-US")} KB/s continuous</span>
        </div>

        <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            250M Backfill Window
          </span>
          <span className="font-mono text-base sm:text-lg font-bold text-emerald-600 block">
            ~{backfillHours} hours
          </span>
          <span className="text-[10px] text-slate-500">Throttled keyset cursor</span>
        </div>

        <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Max CDC Lag Alert
          </span>
          <span className="font-mono text-base sm:text-lg font-bold text-indigo-600 block">
            &lt; 1,000 ms
          </span>
          <span className="text-[10px] text-slate-500">Rollback safety margin</span>
        </div>
      </div>

      {/* Senior Engineering Insight Pill */}
      <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg flex items-start gap-2 text-xs font-sans text-slate-700 leading-relaxed">
        <span className="text-blue-600 shrink-0 font-bold">💡 Staff Takeaway:</span>
        <span>
          At <strong>{dailyWrites.toLocaleString("en-US")} writes/day</strong>, the source primary produces <strong>{walGbPerHour} GB/hr</strong> of write-ahead logs. The CDC pipeline (Debezium + Kafka) must guarantee a consumption rate of at least <strong>{(peakWps * 1.5).toFixed(0)} WPS</strong> to drain lag spikes without buffering on disk.
        </span>
      </div>
    </div>
  );
}
