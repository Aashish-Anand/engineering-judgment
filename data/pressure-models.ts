/** Deterministic teaching models, not production capacity predictions. */
export function retryPressure(layers: number, attempts: number, originals = 200) {
  const amplification = attempts ** layers;
  return { amplification, downstreamAttempts: originals * amplification };
}

const intermediateLayers = ["API", "Client SDK", "Service proxy"];

/**
 * Calls reaching each hop when every attempt fails retryably. The client app sends one original request;
 * each of the `layers` retrying hops multiplies by `attempts`. With one retry owner, only the hop next to
 * the dependency retries, so the dependency sees `attempts` calls at most.
 */
export function retryLevels(layers: number, attempts: number) {
  const names = ["Client app", ...intermediateLayers.slice(0, layers - 1), "Dependency"];
  return {
    everyLayer: names.map((label, i) => ({ label, calls: attempts ** i })),
    oneOwner: names.map((label, i) => ({ label, calls: i === names.length - 1 ? attempts : 1 })),
  };
}

export function poolPressure(replicas: number, poolSize: number, rate: number, holdMs: number, budget = 160) {
  return { maximumSessions: replicas * poolSize, averageOccupancy: rate * holdMs / 1000, budget };
}

/** A rolling deploy with a 25% surge briefly runs extra replicas alongside the old ones. */
export function rollingSurgeReplicas(replicas: number, surge = 0.25) {
  return replicas + Math.ceil(replicas * surge);
}

export function paymentTrace(stableKey: boolean) {
  return stableKey
    ? { charges: 1, steps: ["Persist intent P with key K.", "Provider accepts K: charge C succeeds.", "Worker crashes before recording C.", "Recovery retries K within provider retention: existing C is returned.", "Persist C and replay the confirmed response."] }
    : { charges: 2, steps: ["Persist intent P with key K.", "Provider accepts K: charge C succeeds.", "Worker crashes before recording C.", "Recovery submits a fresh key K2: provider creates charge C2.", "Two charges now require reconciliation and remediation."] };
}
