import { describe, expect, it } from "vitest";
import { paymentTrace, poisonTrace, poolPressure, retryPressure, schemaPhases } from "@/data/pressure-models";
import { productionBlueprints } from "@/data/topics/production-blueprints";
import { topicCatalog } from "@/data/topics/catalog";

describe("pressure workbench invariants", () => {
  it("preserves one charge only when recovery preserves provider identity", () => {
    expect(paymentTrace(true).charges).toBe(1);
    expect(paymentTrace(false).charges).toBe(2);
  });
  it("isolates poison work without treating dependent work as safe", () => {
    expect(poisonTrace(8, true).quarantined).toBe(1);
    expect(poisonTrace(8, true).attempts).toBe(8);
    expect(poisonTrace(1, true).following).toContain("paused");
    expect(poisonTrace(1, false).following).toContain("unsafe");
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
  it("allows new reads only after validation and ends old compatibility at contract", () => {
    expect(schemaPhases.filter(phase => phase.safeRead).map(phase => phase.label)).toEqual(["Validate", "Switch", "Contract"]);
    expect(schemaPhases.filter(phase => !phase.oldCompatible).map(phase => phase.label)).toEqual(["Contract"]);
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
