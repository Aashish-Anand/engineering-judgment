import { expect, test } from "vitest";
import { calculateCutoverState } from "@/data/cutover-model";

test("baseline state routes 100% of reads and writes to DB A", () => {
  const state = calculateCutoverState({ cutoverPercent: 0 });
  expect(state.percentA).toBe(100);
  expect(state.percentB).toBe(0);
  expect(state.readsA).toBe(2300);
  expect(state.readsB).toBe(0);
  expect(state.writesA).toBe(250);
  expect(state.writesB).toBe(0);
  expect(state.healthStatus).toBe("healthy");
  expect(state.divergenceRatePercent).toBe(0);
});

test("canary at 1% correctly splits traffic and reports minimal blast radius", () => {
  const state = calculateCutoverState({ cutoverPercent: 1 });
  expect(state.percentA).toBe(99);
  expect(state.percentB).toBe(1);
  expect(state.readsB).toBe(23);
  expect(state.writesB).toBe(3);
  expect(state.blastRadiusPercent).toBe(1);
  expect(state.phaseName).toBe("canary");
});

test("split dual-write (50%) flags warning status due to operational risk", () => {
  const state = calculateCutoverState({ cutoverPercent: 50 });
  expect(state.percentA).toBe(50);
  expect(state.percentB).toBe(50);
  expect(state.phaseName).toBe("split-dual-write");
  expect(state.healthStatus).toBe("warning");
  expect(state.seniorAdvice).toContain("50/50 is the most dangerous operational window");
});

test("injecting replication lag spike elevates healthStatus to critical", () => {
  const state = calculateCutoverState({ cutoverPercent: 20, injectLagSpike: true });
  expect(state.replicationLagMs).toBeGreaterThan(2500);
  expect(state.healthStatus).toBe("critical");
});

test("injecting divergence elevates healthStatus to critical and sets divergence rate", () => {
  const state = calculateCutoverState({ cutoverPercent: 20, injectDivergence: true });
  expect(state.divergenceRatePercent).toBe(0.42);
  expect(state.healthStatus).toBe("critical");
});

test("triggering emergency rollback resets traffic to DB A and sets rollback status", () => {
  const state = calculateCutoverState({
    cutoverPercent: 80,
    injectLagSpike: true,
    isRolledBack: true,
  });
  expect(state.percentA).toBe(100);
  expect(state.percentB).toBe(0);
  expect(state.readsA).toBe(2300);
  expect(state.readsB).toBe(0);
  expect(state.healthStatus).toBe("rollback");
  expect(state.divergenceRatePercent).toBe(0);
});
