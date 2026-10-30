import { describe, expect, it } from "vitest";
import { paymentTrace, poolPressure, retryLevels, retryPressure, rollingSurgeReplicas } from "@/data/pressure-models";
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
