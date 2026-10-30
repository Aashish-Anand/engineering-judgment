import { describe, expect, it } from "vitest";
import { littlesLaw, paymentTrace, poolPressure, retryLevels, retryPressure, rollingSurgeReplicas, simulateQueue } from "@/data/pressure-models";
import { productionBlueprints } from "@/data/topics/production-blueprints";
import { topicCatalog } from "@/data/topics/catalog";

describe("pressure workbench invariants", () => {
  it("preserves one charge only when recovery preserves provider identity", () => {
    expect(paymentTrace(true).charges).toBe(1);
    expect(paymentTrace(false).charges).toBe(2);
  });
  it("multiplies nested attempts and removes amplification when retries are disabled", () => {
    expect(retryPressure(3, 3)).toEqual({ amplification: 27, downstreamAttempts: 5400 });
    expect(retryPressure(4, 1).amplification).toBe(1);
    expect(retryPressure(1, 3).downstreamAttempts).toBe(600);
  });
  it("separates replica connection ceilings from workload occupancy", () => {
    expect(poolPressure(8, 20, 400, 40)).toEqual({ maximumSessions: 160, averageOccupancy: 16, budget: 160 });
    expect(poolPressure(16, 20, 400, 40).maximumSessions).toBe(320);
    expect(poolPressure(8, 20, 400, 400).averageOccupancy).toBe(160);
  });
  it("shows each hop's calls and caps the dependency at one owner's attempts", () => {
    const { everyLayer, oneOwner } = retryLevels(3, 3);
    expect(everyLayer.map(level => level.calls)).toEqual([1, 3, 9, 27]);
    expect(oneOwner.map(level => level.calls)).toEqual([1, 1, 1, 3]);
    expect(everyLayer.at(-1)!.calls).toBe(retryPressure(3, 3).amplification);
    expect(retryLevels(1, 4).everyLayer.map(level => level.label)).toEqual(["Client app", "Dependency"]);
  });
  it("adds rolling-deploy surge replicas", () => {
    expect(rollingSurgeReplicas(8)).toBe(10);
    expect(rollingSurgeReplicas(2)).toBe(3);
  });
});

describe("new blueprint discovery", () => {
  it("registers every article and resolves every related link", () => {
    for (const topic of productionBlueprints) {
      expect(topicCatalog.some(entry => entry.id === topic.id && entry.href === topic.href)).toBe(true);
      for (const id of topic.related) expect(topicCatalog.some(entry => entry.id === id)).toBe(true);
      expect(new Set(topic.sections.map(section => section.id)).size).toBe(topic.sections.length);
    }
  });
});

describe("queueing simulator", () => {
  const base = { arrivalsPerSecond: 200, concurrency: 80, attempts: 1 };
  const last = (result: ReturnType<typeof simulateQueue>) => result.samples.at(-1)!;

  it("matches Little's Law when the dependency is fast", () => {
    const end = last(simulateQueue({ ...base, serviceMs: 50 }));
    expect(littlesLaw(200, 50)).toBe(10);
    expect(end.inFlight).toBeCloseTo(10);
    expect(end.queued).toBe(0);
    expect(end.rejectedPerSecond).toBe(0);
    expect(end.latencyMs).toBe(50);
  });

  it("turns a slowdown past capacity into a backlog, rejections, and longer latency", () => {
    const result = simulateQueue({ ...base, serviceMs: 2000 });
    const end = last(result);
    expect(result.capacityPerSecond).toBe(40);
    expect(result.samples.find(s => s.t === 4)!.queued).toBe(0);
    expect(end.inFlight).toBeCloseTo(80);
    expect(end.servedPerSecond).toBeCloseTo(40);
    expect(end.queued).toBeCloseTo(200, -1);
    expect(end.rejectedPerSecond).toBeCloseTo(160);
    // Almost a full second of waiting on top of two seconds of service.
    expect(end.latencyMs).toBeGreaterThan(2900);
    expect(end.latencyMs).toBeLessThanOrEqual(3000);
  });

  it("needs no queue when the limit covers what Little's Law asks for", () => {
    const end = last(simulateQueue({ ...base, serviceMs: 2000, concurrency: 400 }));
    expect(end.inFlight).toBeCloseTo(littlesLaw(200, 2000));
    expect(end.queued).toBe(0);
    expect(end.latencyMs).toBe(2000);
  });

  it("adds retried work on top of new arrivals without serving more", () => {
    const once = last(simulateQueue({ ...base, serviceMs: 2000 }));
    const thrice = last(simulateQueue({ ...base, serviceMs: 2000, attempts: 3 }));
    expect(thrice.offeredPerSecond).toBeGreaterThan(once.offeredPerSecond * 2);
    expect(thrice.rejectedPerSecond).toBeGreaterThan(once.rejectedPerSecond * 2);
    expect(thrice.servedPerSecond).toBeCloseTo(once.servedPerSecond);
  });

  it("accounts for every request", () => {
    const { samples, totals } = simulateQueue({ ...base, serviceMs: 1000, attempts: 3 });
    const end = samples.at(-1)!;
    expect(totals.served + end.inFlight + end.queued + totals.failed).toBeCloseTo(totals.arrived, 6);
  });
});
