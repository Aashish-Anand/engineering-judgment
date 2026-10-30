"use client";

import { useState } from "react";
import { calculateCutoverState } from "@/data/cutover-model";

const STAGE_PRESETS = [
  { label: "0% Start", value: 0 },
  { label: "1% Canary", value: 1 },
  { label: "20% Ramp", value: 20 },
  { label: "50% Split", value: 50 },
  { label: "100% Full Cutover", value: 100 },
];

export function DatabaseCutoverLab() {
  const [percent, setPercent] = useState<number>(0);
  const [injectLag, setInjectLag] = useState<boolean>(false);
  const [injectDivergence, setInjectDivergence] = useState<boolean>(false);
  const [isRolledBack, setIsRolledBack] = useState<boolean>(false);

  const state = calculateCutoverState({
    cutoverPercent: percent,
    injectLagSpike: injectLag,
    injectDivergence: injectDivergence,
    isRolledBack: isRolledBack,
  });

  const handleSliderChange = (newVal: number) => {
    if (isRolledBack) {
      setIsRolledBack(false);
    }
    setPercent(newVal);
  };

  const handlePresetClick = (val: number) => {
    if (isRolledBack) {
      setIsRolledBack(false);
    }
    setPercent(val);
  };

  const handleRollbackToggle = () => {
    setIsRolledBack((prev) => !prev);
  };

  const statusBg =
    state.healthStatus === "rollback"
      ? "bg-blue-50 border-blue-200 text-blue-700"
      : state.healthStatus === "critical"
      ? "bg-rose-50 border-rose-200 text-rose-700"
      : state.healthStatus === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-emerald-50 border-emerald-200 text-emerald-700";

  const statusLabel =
    state.healthStatus === "rollback"
      ? "EMERGENCY ROLLBACK ACTIVE (REVERSE CDC SYNC)"
      : state.healthStatus === "critical"
      ? "CRITICAL INCIDENT ALERT"
      : state.healthStatus === "warning"
      ? "HIGH OPERATIONAL TENSION"
      : "SYSTEM HEALTHY & SYNCHRONIZED";

  return (
    <section
      className="my-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs relative"
      aria-label="Database Cutover Interactive Lab"
    >
      {/* Top sticker badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xl select-none" aria-hidden="true">
            🕹️
          </span>
          <h4 className="font-sans font-bold text-lg sm:text-xl text-slate-900 m-0">
            You are on call: Control the 100M-Read / 10M-Write Cutover
          </h4>
        </div>
        <span
          className={`font-mono text-xs font-bold px-2.5 py-1 rounded border shadow-2xs ${statusBg}`}
        >
          {statusLabel}
        </span>
      </div>

      <p className="font-sans text-sm sm:text-base text-slate-600 mb-5 leading-relaxed">
        Shift production traffic from <strong>Primary DB A</strong> to <strong>Target DB B</strong>.
        Observe replication lag, check shadow read divergence, inject chaos, or trigger an emergency rollback.
      </p>

      {/* Preset Stage Buttons */}
      <div className="mb-5">
        <span className="font-mono text-xs font-bold uppercase text-slate-600 block mb-2 tracking-wider">
          Standard Migration Gates:
        </span>
        <div className="flex flex-wrap gap-2">
          {STAGE_PRESETS.map((preset) => {
            const isSelected = !isRolledBack && percent === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => handlePresetClick(preset.value)}
                className={`font-sans text-xs sm:text-sm py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-700 shadow-2xs font-semibold"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Continuous Slider */}
      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <label htmlFor="cutover-slider" className="font-sans font-bold text-sm sm:text-base text-slate-900">
            Live Traffic Shift to DB B:{" "}
            <span className="font-mono text-base text-emerald-700">{state.percentB}%</span>
          </label>
          <span className="font-mono text-xs text-slate-600">
            DB A: <strong className="text-blue-600">{state.percentA}%</strong> · DB B:{" "}
            <strong className="text-emerald-700">{state.percentB}%</strong>
          </span>
        </div>

        <input
          id="cutover-slider"
          type="range"
          min={0}
          max={100}
          value={state.percentB}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between text-[11px] font-mono text-slate-600 mt-1.5">
          <span>0% (100% DB A)</span>
          <span>25%</span>
          <span className="font-bold text-amber-600">50% (Max Risk)</span>
          <span>75%</span>
          <span>100% (Full DB B)</span>
        </div>
      </div>

      {/* Visual Traffic Split Diagram */}
      <div className="mb-6 p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* DB A Source Node */}
          <div
            className={`md:col-span-5 p-3.5 rounded-xl border transition-all ${
              state.percentA > 0
                ? "bg-blue-50/50 border-blue-300 shadow-2xs"
                : "bg-slate-50 border-slate-200 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-sans font-bold text-sm text-slate-900">
                🗄️ Primary DB A
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                {state.percentA}% Traffic
              </span>
            </div>
            <div className="space-y-1 text-xs font-sans">
              <div className="flex justify-between text-slate-600">
                <span>Read Throughput:</span>
                <span className="font-mono font-bold text-slate-900">
                  {state.readsA.toLocaleString("en-US")} RPS
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Write Throughput:</span>
                <span className="font-mono font-bold text-slate-900">
                  {state.writesA.toLocaleString("en-US")} WPS
                </span>
              </div>
            </div>
          </div>

          {/* Router Center Node */}
          <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mb-1">
              Traffic Router
            </span>
            <div className="hidden md:flex items-center text-slate-600 font-mono text-xs">
              → →
            </div>
            <div className="md:hidden flex justify-center my-1 text-slate-600 font-mono text-xs">
              ↓
            </div>
          </div>

          {/* DB B Target Node */}
          <div
            className={`md:col-span-5 p-3.5 rounded-xl border transition-all ${
              state.percentB > 0
                ? "bg-emerald-50/50 border-emerald-300 shadow-2xs"
                : "bg-slate-50 border-slate-200 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-sans font-bold text-sm text-slate-900">
                🗄️ Target DB B
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                {state.percentB}% Traffic
              </span>
            </div>
            <div className="space-y-1 text-xs font-sans">
              <div className="flex justify-between text-slate-600">
                <span>Read Throughput:</span>
                <span className="font-mono font-bold text-slate-900">
                  {state.readsB.toLocaleString("en-US")} RPS
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Write Throughput:</span>
                <span className="font-mono font-bold text-slate-900">
                  {state.writesB.toLocaleString("en-US")} WPS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Metric 1: Lag */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-slate-600 block mb-1">
            Replication Lag
          </span>
          <span
            className={`font-mono text-base font-bold block ${
              state.replicationLagMs > 2000
                ? "text-rose-600"
                : state.replicationLagMs > 300
                ? "text-amber-600"
                : "text-emerald-700"
            }`}
          >
            {state.replicationLagMs} ms
          </span>
          <span className="text-[10px] text-slate-600">
            {state.replicationLagMs < 200 ? "✓ Safe for cutover" : "⚠️ Catch-up required"}
          </span>
        </div>

        {/* Metric 2: Divergence */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-slate-600 block mb-1">
            Data Divergence
          </span>
          <span
            className={`font-mono text-base font-bold block ${
              state.divergenceRatePercent > 0 ? "text-rose-600" : "text-emerald-700"
            }`}
          >
            {state.divergenceRatePercent.toFixed(2)}%
          </span>
          <span className="text-[10px] text-slate-600">
            {state.divergenceRatePercent === 0 ? "✓ Shadow reads match" : "🚨 Discrepancy detected"}
          </span>
        </div>

        {/* Metric 3: Blast Radius */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-slate-600 block mb-1">
            Blast Radius
          </span>
          <span className="font-mono text-base font-bold text-slate-900 block">
            {state.blastRadiusPercent}% users
          </span>
          <span className="text-[10px] text-slate-600">
            {state.blastRadiusPercent <= 5 ? "Minimal exposure" : "Broad exposure"}
          </span>
        </div>

        {/* Metric 4: Daily Shift */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-slate-600 block mb-1">
            Daily Writes on B
          </span>
          <span className="font-mono text-base font-bold text-slate-900 block">
            {((state.percentB / 100) * 10).toFixed(1)}M / day
          </span>
          <span className="text-[10px] text-slate-600">Out of 10M total</span>
        </div>
      </div>

      {/* Chaos Injection & Rollback Controls */}
      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <span className="font-mono text-xs font-bold uppercase text-slate-700 block mb-2.5">
          Incident Simulation &amp; Safety Controls:
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setInjectLag((prev) => !prev)}
            aria-pressed={injectLag}
            className={`font-sans text-xs py-1.5 px-3 rounded-lg border transition-colors cursor-pointer ${
              injectLag
                ? "bg-rose-50 text-rose-700 border-rose-300 font-semibold"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {injectLag ? "✓ Lag Spike Injected (3,400ms)" : "Simulate CDC Lag Spike"}
          </button>

          <button
            type="button"
            onClick={() => setInjectDivergence((prev) => !prev)}
            aria-pressed={injectDivergence}
            className={`font-sans text-xs py-1.5 px-3 rounded-lg border transition-colors cursor-pointer ${
              injectDivergence
                ? "bg-rose-50 text-rose-700 border-rose-300 font-semibold"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {injectDivergence ? "✓ Divergence Injected (0.42%)" : "Simulate Checksum Mismatch"}
          </button>

          <button
            type="button"
            onClick={handleRollbackToggle}
            aria-pressed={isRolledBack}
            className={`font-sans text-xs py-1.5 px-3 rounded-lg border ml-auto transition-colors cursor-pointer ${
              isRolledBack
                ? "bg-rose-600 text-white border-rose-700 shadow-2xs font-semibold"
                : "bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-2xs font-semibold"
            }`}
          >
            {isRolledBack
              ? "↺ Reverse CDC Active · Click to Resume Cutover"
              : "🚨 Trigger Emergency Rollback (0% B)"}
          </button>
        </div>
      </div>

      {/* Pedagogical Intelligence Card */}
      <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-sans font-bold text-sm sm:text-base text-slate-900">
            {state.phaseTitle}
          </span>
        </div>
        <p className="font-sans text-xs sm:text-sm text-slate-600 mb-3 leading-relaxed">
          {state.phaseSummary}
        </p>

        <div className="p-3 bg-white border border-slate-200 rounded-lg mb-2.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-0.5">
            Senior Engineering Intuition:
          </span>
          <p className="font-sans font-semibold text-xs sm:text-sm text-slate-800 mb-0 leading-snug">
            &ldquo;{state.seniorAdvice}&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
          <span className="font-bold text-slate-800">Recommended On-Call Next Action:</span>
          <span>{state.recommendedAction}</span>
        </div>
      </div>

      {/* Assumptions Accordion */}
      <details className="text-xs text-slate-600">
        <summary className="cursor-pointer font-sans font-bold text-xs text-slate-700 hover:text-slate-900">
          Behind the simulation: How this math reflects production reality ▾
        </summary>
        <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-slate-200 font-sans leading-relaxed text-slate-600">
          <p>
            • <strong>Scale Baseline</strong>: Models a 100M-read / 10M-write daily system peaking at 2,300 RPS and 250 WPS during business hours.
          </p>
          <p>
            • <strong>Why 50% is Dangerous</strong>: When split evenly, write concurrency collisions across dual-write queues are mathematically maximized. Production teams ramp rapidly from 20% to 100% or roll back immediately if lag spikes.
          </p>
          <p>
            • <strong>Reverse CDC</strong>: In production, Reverse CDC from DB B back to DB A is started <em>before</em> any live writes touch DB B. This allows instantaneous fallback to DB A with zero lost transactions.
          </p>
        </div>
      </details>
    </section>
  );
}
