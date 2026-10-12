"use client";

import { useState } from "react";
import { calculateCutoverState } from "@/data/cutover-model";
import { DoodleArrow } from "./doodle/DoodleArrow";

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
      ? "bg-[#DCEBFF] border-[#2563EB] text-[#1E40AF]"
      : state.healthStatus === "critical"
      ? "bg-[#FDE8E8] border-[#DC2626] text-[#991B1B]"
      : state.healthStatus === "warning"
      ? "bg-[#FEF3C7] border-[#D97706] text-[#92400E]"
      : "bg-[#DFF3DF] border-[#16A34A] text-[#166534]";

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
      className="my-8 bg-white border-[1.5px] border-[#171717] rounded-2xl p-5 sm:p-7 shadow-[3px_4px_0px_#171717] relative"
      aria-label="Database Cutover Interactive Lab"
    >
      {/* Top sticker badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-5 border-b border-[#171717]/20">
        <div className="flex items-center gap-2">
          <span className="text-xl select-none" aria-hidden="true">
            🕹️
          </span>
          <h4 className="font-hand font-bold text-xl sm:text-2xl text-[#171717] m-0">
            You are on call: Control the 100M-Read / 10M-Write Cutover
          </h4>
        </div>
        <span
          className={`font-mono text-xs font-bold px-2.5 py-1 rounded border shadow-2xs ${statusBg}`}
        >
          {statusLabel}
        </span>
      </div>

      <p className="font-sans text-sm sm:text-base text-[#374151] mb-5 leading-relaxed">
        Shift production traffic from <strong>Primary DB A</strong> to <strong>Target DB B</strong>.
        Observe replication lag, check shadow read divergence, inject chaos, or trigger an emergency rollback.
      </p>

      {/* Preset Stage Buttons */}
      <div className="mb-5">
        <span className="font-hand font-bold text-xs uppercase text-[#6B7280] block mb-2 tracking-wider">
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
                className={`doodle-btn text-xs sm:text-sm py-1 px-3 ${
                  isSelected ? "bg-[#FFF0B8]" : "bg-[#FAF9F5] hover:bg-white"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Continuous Slider */}
      <div className="mb-6 p-4 bg-[#FAF9F5] border border-[#171717] rounded-xl shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <label htmlFor="cutover-slider" className="font-hand font-bold text-base text-[#171717]">
            Live Traffic Shift to DB B:{" "}
            <span className="font-mono text-lg text-[#16A34A]">{state.percentB}%</span>
          </label>
          <span className="font-mono text-xs text-[#6B7280]">
            DB A: <strong className="text-[#2563EB]">{state.percentA}%</strong> · DB B:{" "}
            <strong className="text-[#16A34A]">{state.percentB}%</strong>
          </span>
        </div>

        <input
          id="cutover-slider"
          type="range"
          min={0}
          max={100}
          value={state.percentB}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          className="w-full accent-[#171717] h-2 bg-white rounded-lg border border-[#171717] cursor-pointer"
        />

        <div className="flex justify-between text-[11px] font-mono text-[#6B7280] mt-1.5">
          <span>0% (100% DB A)</span>
          <span>25%</span>
          <span className="font-bold text-[#D97706]">50% (Max Risk)</span>
          <span>75%</span>
          <span>100% (Full DB B)</span>
        </div>
      </div>

      {/* Visual Traffic Split Diagram */}
      <div className="mb-6 p-4 sm:p-5 bg-white border border-[#171717] rounded-xl shadow-[2px_2px_0px_#171717]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* DB A Source Node */}
          <div
            className={`md:col-span-5 p-3.5 rounded-xl border-[1.5px] border-[#171717] transition-all ${
              state.percentA > 0 ? "bg-[#DCEBFF] shadow-xs" : "bg-[#FAF9F5] opacity-50"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-hand font-bold text-base text-[#171717]">
                🗄️ Primary DB A
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-[#171717]">
                {state.percentA}% Traffic
              </span>
            </div>
            <div className="space-y-1 text-xs font-sans">
              <div className="flex justify-between text-[#374151]">
                <span>Read Throughput:</span>
                <span className="font-mono font-bold text-[#171717]">
                  {state.readsA.toLocaleString()} RPS
                </span>
              </div>
              <div className="flex justify-between text-[#374151]">
                <span>Write Throughput:</span>
                <span className="font-mono font-bold text-[#171717]">
                  {state.writesA.toLocaleString()} WPS
                </span>
              </div>
            </div>
          </div>

          {/* Router Center Node */}
          <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6B7280] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#171717]/30 mb-1">
              Traffic Router
            </span>
            <div className="hidden md:flex items-center gap-1">
              <DoodleArrow direction="straight-right" width={28} height={14} />
            </div>
            <div className="md:hidden flex justify-center my-1">
              <DoodleArrow direction="down" width={18} height={20} />
            </div>
          </div>

          {/* DB B Target Node */}
          <div
            className={`md:col-span-5 p-3.5 rounded-xl border-[1.5px] border-[#171717] transition-all ${
              state.percentB > 0 ? "bg-[#DFF3DF] shadow-xs" : "bg-[#FAF9F5] opacity-50"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-hand font-bold text-base text-[#171717]">
                🗄️ Target DB B
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-[#171717]">
                {state.percentB}% Traffic
              </span>
            </div>
            <div className="space-y-1 text-xs font-sans">
              <div className="flex justify-between text-[#374151]">
                <span>Read Throughput:</span>
                <span className="font-mono font-bold text-[#171717]">
                  {state.readsB.toLocaleString()} RPS
                </span>
              </div>
              <div className="flex justify-between text-[#374151]">
                <span>Write Throughput:</span>
                <span className="font-mono font-bold text-[#171717]">
                  {state.writesB.toLocaleString()} WPS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Metric 1: Lag */}
        <div className="p-3 bg-white border border-[#171717] rounded-xl shadow-xs">
          <span className="text-[11px] font-mono uppercase text-[#6B7280] block mb-1">
            Replication Lag
          </span>
          <span
            className={`font-mono text-lg font-bold block ${
              state.replicationLagMs > 2000
                ? "text-[#DC2626]"
                : state.replicationLagMs > 300
                ? "text-[#D97706]"
                : "text-[#16A34A]"
            }`}
          >
            {state.replicationLagMs} ms
          </span>
          <span className="text-[10px] text-[#6B7280]">
            {state.replicationLagMs < 200 ? "✓ Safe for cutover" : "⚠️ Catch-up required"}
          </span>
        </div>

        {/* Metric 2: Divergence */}
        <div className="p-3 bg-white border border-[#171717] rounded-xl shadow-xs">
          <span className="text-[11px] font-mono uppercase text-[#6B7280] block mb-1">
            Data Divergence
          </span>
          <span
            className={`font-mono text-lg font-bold block ${
              state.divergenceRatePercent > 0 ? "text-[#DC2626]" : "text-[#16A34A]"
            }`}
          >
            {state.divergenceRatePercent.toFixed(2)}%
          </span>
          <span className="text-[10px] text-[#6B7280]">
            {state.divergenceRatePercent === 0 ? "✓ Shadow reads match" : "🚨 Discrepancy detected"}
          </span>
        </div>

        {/* Metric 3: Blast Radius */}
        <div className="p-3 bg-white border border-[#171717] rounded-xl shadow-xs">
          <span className="text-[11px] font-mono uppercase text-[#6B7280] block mb-1">
            Blast Radius
          </span>
          <span className="font-mono text-lg font-bold text-[#171717] block">
            {state.blastRadiusPercent}% users
          </span>
          <span className="text-[10px] text-[#6B7280]">
            {state.blastRadiusPercent <= 5 ? "Minimal exposure" : "Broad exposure"}
          </span>
        </div>

        {/* Metric 4: Daily Shift */}
        <div className="p-3 bg-white border border-[#171717] rounded-xl shadow-xs">
          <span className="text-[11px] font-mono uppercase text-[#6B7280] block mb-1">
            Daily Writes on B
          </span>
          <span className="font-mono text-lg font-bold text-[#171717] block">
            {((state.percentB / 100) * 10).toFixed(1)}M / day
          </span>
          <span className="text-[10px] text-[#6B7280]">Out of 10M total</span>
        </div>
      </div>

      {/* Chaos Injection & Rollback Controls */}
      <div className="mb-6 p-4 bg-[#F4F1EA] border border-[#171717] rounded-xl">
        <span className="font-hand font-bold text-xs uppercase text-[#171717] block mb-2.5">
          Incident Simulation &amp; Safety Controls:
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setInjectLag((prev) => !prev)}
            className={`doodle-btn text-xs py-1 px-3 ${
              injectLag ? "bg-[#FDE8E8] text-[#DC2626]" : "bg-white"
            }`}
          >
            {injectLag ? "✓ Lag Spike Injected (3,400ms)" : "Simulate CDC Lag Spike"}
          </button>

          <button
            type="button"
            onClick={() => setInjectDivergence((prev) => !prev)}
            className={`doodle-btn text-xs py-1 px-3 ${
              injectDivergence ? "bg-[#FDE8E8] text-[#DC2626]" : "bg-white"
            }`}
          >
            {injectDivergence ? "✓ Divergence Injected (0.42%)" : "Simulate Checksum Mismatch"}
          </button>

          <button
            type="button"
            onClick={handleRollbackToggle}
            className={`doodle-btn text-xs py-1 px-3 ml-auto ${
              isRolledBack ? "bg-[#171717] text-white" : "bg-[#FFF0B8] text-[#171717]"
            }`}
          >
            {isRolledBack ? "Undo Rollback" : "🚨 Trigger Emergency Rollback (0% B)"}
          </button>
        </div>
      </div>

      {/* Pedagogical Intelligence Card */}
      <div className="p-4 sm:p-5 bg-[#FAF9F5] border-[1.5px] border-[#171717] rounded-xl mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-hand font-bold text-base sm:text-lg text-[#171717]">
            {state.phaseTitle}
          </span>
        </div>
        <p className="font-sans text-sm text-[#374151] mb-3 leading-relaxed">
          {state.phaseSummary}
        </p>

        <div className="p-3 bg-white border border-[#171717] rounded-lg mb-2.5">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#92400E] block mb-0.5">
            Senior Engineering Intuition:
          </span>
          <p className="font-hand font-bold text-xs sm:text-sm text-[#171717] mb-0 leading-snug">
            &ldquo;{state.seniorAdvice}&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#4B5563]">
          <span className="font-bold text-[#171717]">Recommended On-Call Next Action:</span>
          <span>{state.recommendedAction}</span>
        </div>
      </div>

      {/* Assumptions Accordion */}
      <details className="text-xs text-[#6B7280]">
        <summary className="cursor-pointer font-hand font-bold text-sm text-[#171717] hover:underline">
          Behind the simulation: How this math reflects production reality ▾
        </summary>
        <div className="mt-2.5 space-y-1.5 pl-3 border-l-2 border-[#171717]/20 font-sans leading-relaxed">
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
