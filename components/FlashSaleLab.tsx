"use client";

import { useState } from "react";

export function FlashSaleLab() {
  const [totalStock, setTotalStock] = useState(10000);
  const [peakRps, setPeakRps] = useState(2000000);
  const [admissionDrip, setAdmissionDrip] = useState(10000); // req/s admitted to Redis
  const [abandonmentRate, setAbandonmentRate] = useState(25); // % who don't pay within TTL
  const [ttlMinutes, setTtlMinutes] = useState(10);

  // Calculations
  const edgeShedPercent = Math.max(0, ((peakRps - admissionDrip) / peakRps) * 100);
  const selloutSeconds = totalStock / admissionDrip;
  const initialReservations = totalStock;
  const abandonedUnits = Math.round((initialReservations * abandonmentRate) / 100);
  const confirmedUnits = totalStock - abandonedUnits;
  const dbWriteRate = Math.min(500, confirmedUnits / (ttlMinutes * 60)); // smoothed via Kafka

  return (
    <div className="my-8 p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-5 border-b border-slate-100">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            ⚡ Interactive Architecture Lab
          </span>
          <h4 className="font-sans text-base sm:text-lg font-bold text-slate-900 mt-2 mb-0">
            Multi-Tier Flash Sale Admission &amp; Reservation Simulator
          </h4>
        </div>
        <span className="text-xs font-mono text-slate-400">Model: Edge Funnel ➔ Redis Lua ➔ Kafka Buffer</span>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Peak Incoming Concurrency:</span>
            <span className="font-mono text-blue-600 font-bold">{peakRps.toLocaleString("en-US")} RPS</span>
          </div>
          <input
            type="range"
            min={100000}
            max={5000000}
            step={100000}
            value={peakRps}
            onChange={(e) => setPeakRps(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-0.5">
            <span>100K RPS</span>
            <span>5M RPS</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Edge Queue Admission Drip:</span>
            <span className="font-mono text-blue-600 font-bold">{admissionDrip.toLocaleString("en-US")} req/s</span>
          </div>
          <input
            type="range"
            min={1000}
            max={50000}
            step={1000}
            value={admissionDrip}
            onChange={(e) => setAdmissionDrip(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-0.5">
            <span>1K / sec</span>
            <span>50K / sec</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Available Inventory Units:</span>
            <span className="font-mono text-slate-900 font-bold">{totalStock.toLocaleString("en-US")} units</span>
          </div>
          <input
            type="range"
            min={1000}
            max={50000}
            step={1000}
            value={totalStock}
            onChange={(e) => setTotalStock(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-0.5">
            <span>1,000 units</span>
            <span>50,000 units</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Checkout Abandonment Rate:</span>
            <span className="font-mono text-amber-700 font-bold">{abandonmentRate}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={60}
            step={5}
            value={abandonmentRate}
            onChange={(e) => setAbandonmentRate(Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-0.5">
            <span>5% (Hyper-committed)</span>
            <span>60% (Casual buyers)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Stock Reservation TTL:</span>
            <span className="font-mono text-slate-900 font-bold">{ttlMinutes} minutes</span>
          </div>
          <input
            type="range"
            min={3}
            max={20}
            step={1}
            value={ttlMinutes}
            onChange={(e) => setTtlMinutes(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-0.5">
            <span>3 minutes</span>
            <span>20 minutes</span>
          </div>
        </div>
      </div>

      {/* Output Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Edge Shed Ratio</span>
          <span className="font-sans text-base sm:text-lg font-extrabold text-blue-700">
            {edgeShedPercent.toFixed(1)}%
          </span>
          <p className="text-[11px] text-slate-500 m-0 mt-0.5">Shed by Virtual Queue</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Initial Sellout Time</span>
          <span className="font-sans text-base sm:text-lg font-extrabold text-emerald-700">
            {selloutSeconds.toFixed(1)}s
          </span>
          <p className="text-[11px] text-slate-500 m-0 mt-0.5">Redis stock drops to 0</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">Auto-Restock Wave</span>
          <span className="font-sans text-base sm:text-lg font-extrabold text-amber-700">
            {abandonedUnits.toLocaleString("en-US")} units
          </span>
          <p className="text-[11px] text-slate-500 m-0 mt-0.5">Recycled at {ttlMinutes}m TTL</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">DB Settlement Load</span>
          <span className="font-sans text-base sm:text-lg font-extrabold text-slate-900">
            ~{Math.round(dbWriteRate)} WPS
          </span>
          <p className="text-[11px] text-slate-500 m-0 mt-0.5">Async Kafka consumer</p>
        </div>
      </div>

      {/* Senior Engineer Insight */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs font-sans text-slate-700 leading-relaxed">
        <strong className="text-blue-900 font-bold block mb-1">💡 Architecture Synthesis:</strong>
        Without the Edge Virtual Queue, {peakRps.toLocaleString("en-US")} RPS would saturate PostgreSQL connection pools in under 5ms. With our layered admission gate, exactly {admissionDrip.toLocaleString("en-US")} req/s reach Redis Lua, and background settlement to the database is smoothed to ~{Math.round(dbWriteRate)} writes/sec via Kafka.
      </div>
    </div>
  );
}
