"use client";

import { useState } from "react";
import Link from "next/link";

type Scenario = {
  id: string;
  name: string;
  badge: string;
  href: string;
  normalMetrics: {
    throughput: string;
    latency: string;
    saturation: string;
    status: string;
  };
  spikedMetrics: {
    throughput: string;
    latency: string;
    saturation: string;
    status: string;
  };
  nodes: {
    name: string;
    role: string;
    steadyDetail: string;
    pressureDetail: string;
    tone: "blue" | "emerald" | "amber" | "rose";
  }[];
  insight: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "db-migration",
    name: "10M-Write DB Cutover",
    badge: "CDC + Dual-Write",
    href: "/topics/database/safely-migrate-production-database",
    normalMetrics: {
      throughput: "250 WPS (Steady)",
      latency: "14ms Replication Lag",
      saturation: "28% Connection Pool",
      status: "Synchronized",
    },
    spikedMetrics: {
      throughput: "2,400 WPS (Peak)",
      latency: "680ms CDC Lag",
      saturation: "82% Pool Saturation",
      status: "Reverse CDC Guarded",
    },
    nodes: [
      {
        name: "Legacy Primary (A)",
        role: "PostgreSQL 14",
        steadyDetail: "250 live writes/sec",
        pressureDetail: "Surge absorbed · WAL streaming",
        tone: "blue",
      },
      {
        name: "Debezium CDC",
        role: "Kafka Connect",
        steadyDetail: "14ms tail latency",
        pressureDetail: "Lag buffered in Kafka topic",
        tone: "amber",
      },
      {
        name: "Target Primary (B)",
        role: "PostgreSQL 16",
        steadyDetail: "0% live write traffic",
        pressureDetail: "Reverse replication armed (<30s)",
        tone: "emerald",
      },
    ],
    insight:
      "Never flip DNS until Reverse CDC is replicating mutations back to the legacy database.",
  },
  {
    id: "flash-sale",
    name: "5M RPS Flash Sale",
    badge: "Admission & Stock",
    href: "/topics/traffic/survive-flash-sale",
    normalMetrics: {
      throughput: "12,000 RPS",
      latency: "2.1ms P99",
      saturation: "4% Inventory Sold",
      status: "Smooth Ingestion",
    },
    spikedMetrics: {
      throughput: "5,000,000 RPS",
      latency: "4.8ms P99 Edge",
      saturation: "98.4% Requests Shed",
      status: "DB Connections Safe",
    },
    nodes: [
      {
        name: "Cloudflare Edge",
        role: "Token Bucket Drip",
        steadyDetail: "100% requests passed",
        pressureDetail: "Sheds 4.9M invalid retries",
        tone: "rose",
      },
      {
        name: "Redis Shard",
        role: "Lua Atomic Decr",
        steadyDetail: "O(1) stock reservation",
        pressureDetail: "Zero overselling · 500μs latency",
        tone: "emerald",
      },
      {
        name: "MySQL Cluster",
        role: "Async Drain Queue",
        steadyDetail: "50 writes/sec batch",
        pressureDetail: "Buffered drain via Kafka orders",
        tone: "blue",
      },
    ],
    insight:
      "Admit traffic in drops at the edge. The database never sees the 5M RPS surge.",
  },
  {
    id: "hot-partition",
    name: "Hot Partition Skew",
    badge: "Key Salting & Fan-out",
    href: "/topics/traffic/fix-hot-partition",
    normalMetrics: {
      throughput: "4,000 likes/sec",
      latency: "1.8ms Redis P99",
      saturation: "Uniform Partitioning",
      status: "Balanced Load",
    },
    spikedMetrics: {
      throughput: "70,000 likes/sec",
      latency: "3.2ms Salted P99",
      saturation: "10 Buckets Active",
      status: "Hotspot Dissolved",
    },
    nodes: [
      {
        name: "Client Ingestion",
        role: "MurmurHash3",
        steadyDetail: "Direct partition routing",
        pressureDetail: "PostId:Taylor + salt(0..9)",
        tone: "amber",
      },
      {
        name: "10-Way Shards",
        role: "Distributed Counters",
        steadyDetail: "Single key hotspot risk",
        pressureDetail: "7K likes/sec evenly spread",
        tone: "emerald",
      },
      {
        name: "Cron Aggregator",
        role: "Periodic Sum",
        steadyDetail: "Real-time count",
        pressureDetail: "Lazy aggregation saves 99% I/O",
        tone: "blue",
      },
    ],
    insight:
      "Salting turns a single locking bottleneck into 10 independent parallel writes.",
  },
];

export function ArchitecturePressurePreview() {
  const [activeTab, setActiveTab] = useState(0);
  const [isSpiked, setIsSpiked] = useState(false);

  const scenario = SCENARIOS[activeTab];
  const metrics = isSpiked ? scenario.spikedMetrics : scenario.normalMetrics;

  const getToneBadge = (tone: string) => {
    switch (tone) {
      case "emerald":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "amber":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "rose":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
      {/* Console Top Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSpiked ? "bg-rose-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isSpiked ? "bg-rose-600" : "bg-emerald-500"
              }`}
            />
          </span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600">
            {isSpiked ? "🔥 High Pressure Stress Test" : "Production Baseline"}
          </span>
        </div>

        {/* Spike Toggle */}
        <button
          type="button"
          onClick={() => setIsSpiked((v) => !v)}
          className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded-md border transition-all cursor-pointer shadow-2xs ${
            isSpiked
              ? "bg-rose-600 text-white border-rose-700 hover:bg-rose-700"
              : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
          }`}
        >
          {isSpiked ? "Reset to Baseline ↺" : "Inject 10× Spike ⚡"}
        </button>
      </div>

      {/* Scenario Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100/70 border border-slate-200/60 rounded-lg mb-3.5">
        {SCENARIOS.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setActiveTab(idx);
            }}
            className={`flex-1 py-1 px-2 rounded-md font-sans text-xs font-semibold transition-all cursor-pointer ${
              activeTab === idx
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3.5">
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-center">
          <span className="block font-mono text-[10px] uppercase text-slate-400">
            Throughput
          </span>
          <span className="block font-mono text-xs font-bold text-slate-800">
            {metrics.throughput}
          </span>
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-center">
          <span className="block font-mono text-[10px] uppercase text-slate-400">
            Replication / P99
          </span>
          <span
            className={`block font-mono text-xs font-bold ${
              isSpiked ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {metrics.latency}
          </span>
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-center">
          <span className="block font-mono text-[10px] uppercase text-slate-400">
            Load Saturation
          </span>
          <span className="block font-mono text-xs font-bold text-slate-800">
            {metrics.saturation}
          </span>
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-center">
          <span className="block font-mono text-[10px] uppercase text-slate-400">
            System State
          </span>
          <span
            className={`block font-mono text-xs font-bold ${
              isSpiked ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {metrics.status}
          </span>
        </div>
      </div>

      {/* Visual Topology Pipeline */}
      <div className="space-y-2 mb-3.5">
        {scenario.nodes.map((node, i) => (
          <div
            key={node.name}
            className="flex items-center justify-between p-2.5 bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[11px] font-bold text-slate-400">
                0{i + 1}
              </span>
              <div className="min-w-0">
                <span className="font-sans font-bold text-xs text-slate-900 block truncate">
                  {node.name}
                </span>
                <span className="font-mono text-[10px] text-slate-500 block">
                  {node.role}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${getToneBadge(
                  node.tone
                )}`}
              >
                {isSpiked ? node.pressureDetail : node.steadyDetail}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Architectural Takeaway */}
      <div className="p-2.5 bg-blue-50/50 border border-blue-200/70 rounded-lg flex items-center justify-between gap-3 text-xs">
        <p className="font-sans text-xs text-slate-700 leading-snug mb-0 flex-1">
          <strong className="text-blue-900">Principle:</strong> {scenario.insight}
        </p>
        <Link
          href={scenario.href}
          className="shrink-0 font-sans font-bold text-xs text-blue-600 hover:text-blue-800 underline no-underline whitespace-nowrap"
        >
          View Blueprint →
        </Link>
      </div>
    </div>
  );
}
