/** Deterministic teaching models, not production capacity predictions. */
export function retryPressure(layers: number, attempts: number, originals = 200) {
  const amplification = attempts ** layers;
  return { amplification, downstreamAttempts: originals * amplification };
}

export function poolPressure(replicas: number, poolSize: number, rate: number, holdMs: number, budget = 160) {
  return { maximumSessions: replicas * poolSize, averageOccupancy: rate * holdMs / 1000, budget };
}

export function poisonTrace(attemptLimit: number, preserveOrder: boolean) {
  return {
    attempts: attemptLimit,
    quarantined: 1,
    following: preserveOrder ? "Event 42 paused: reservation 41 is unresolved." : "Event 42 proceeds: unsafe if shipping requires reservation 41.",
    replay: "After repair, replay event 41 with its original ID; validate state before releasing event 42.",
  };
}

export function paymentTrace(stableKey: boolean) {
  return stableKey
    ? { charges: 1, steps: ["Persist intent P with key K.", "Provider accepts K: charge C succeeds.", "Worker crashes before recording C.", "Recovery retries K within provider retention: existing C is returned.", "Persist C and replay the confirmed response."] }
    : { charges: 2, steps: ["Persist intent P with key K.", "Provider accepts K: charge C succeeds.", "Worker crashes before recording C.", "Recovery submits a fresh key K2: provider creates charge C2.", "Two charges now require reconciliation and remediation."] };
}

export const schemaPhases = [
  { label: "Expand", safeRead: false, oldCompatible: true, detail: "Add the new nullable column. Old reads and writes remain authoritative." },
  { label: "Bridge", safeRead: false, oldCompatible: true, detail: "Deploy dual writes with old reads; drain old-only writers or add synchronization." },
  { label: "Backfill", safeRead: false, oldCompatible: true, detail: "Copy historical values in bounded resumable chunks. Do not assume partial coverage is complete." },
  { label: "Validate", safeRead: true, oldCompatible: true, detail: "Model assumption: all writers bridge, backfill finished, and coverage and values agree. Read switching is now allowed." },
  { label: "Switch", safeRead: true, oldCompatible: true, detail: "Read the new column and preserve old writes through the rollback window." },
  { label: "Contract", safeRead: true, oldCompatible: false, detail: "After old consumers and rollback obligations retire, remove the old column. Old binaries are no longer compatible." },
] as const;
