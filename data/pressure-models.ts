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

/** Little's Law: average work in progress = arrival rate × time each item spends in progress. */
export function littlesLaw(perSecond: number, ms: number) {
  return perSecond * ms / 1000;
}

export type QueueInputs = {
  arrivalsPerSecond: number;
  /** Service time per call once the slowdown starts. */
  serviceMs: number;
  /** Calls the dependency can work on at once. */
  concurrency: number;
  /** Total attempts per request, including the first. */
  attempts: number;
  baselineServiceMs?: number;
  slowdownAtSeconds?: number;
  /** Work that waits this long without starting is rejected. */
  maxWaitMs?: number;
  backoffMs?: number;
  seconds?: number;
  tickMs?: number;
};

export type QueueSample = { t: number; offeredPerSecond: number; servedPerSecond: number; rejectedPerSecond: number; queued: number; inFlight: number; latencyMs: number };

type Cohort = { arrivedTick: number; attempt: number; amount: number };

/**
 * A deterministic fluid model of one dependency behind a waiting queue. Requests arrive at a steady rate;
 * at `slowdownAtSeconds` each call starts taking `serviceMs` instead of `baselineServiceMs`. Work starts
 * when a concurrency slot is free, in arrival order. Work that waits `maxWaitMs` without starting is rejected,
 * and comes back after `backoffMs` while it has attempts left. Latency is wait plus average service time for work started.
 */
export function simulateQueue({ arrivalsPerSecond, serviceMs, concurrency, attempts, baselineServiceMs = 50, slowdownAtSeconds = 5, maxWaitMs = 1000, backoffMs = 500, seconds = 30, tickMs = 50 }: QueueInputs) {
  const dt = tickMs / 1000;
  const ticks = Math.round(seconds / dt);
  const ticksFor = (ms: number) => Math.max(1, Math.round(ms / tickMs));
  const maxWaitTicks = ticksFor(maxWaitMs);
  const backoffTicks = ticksFor(backoffMs);
  const retriesDue: Cohort[][] = Array.from({ length: ticks + 1 }, () => []);
  let queue: Cohort[] = [];
  let inFlight = 0;
  let lastLatency = baselineServiceMs;
  const totals = { arrived: 0, served: 0, rejected: 0, failed: 0 };
  const samples: QueueSample[] = [];

  for (let k = 0; k < ticks; k++) {
    const serviceNow = k * dt >= slowdownAtSeconds ? serviceMs : baselineServiceMs;
    // Calls finish at a steady rate: each tick, a slice of in-flight work proportional to tick ÷ service time.
    const served = inFlight * Math.min(1, tickMs / serviceNow);
    inFlight -= served;
    totals.served += served;

    const fresh = arrivalsPerSecond * dt;
    totals.arrived += fresh;
    const arriving = [{ arrivedTick: k, attempt: 1, amount: fresh }, ...retriesDue[k].map(c => ({ ...c, arrivedTick: k }))];
    queue.push(...arriving.filter(c => c.amount > 0));
    const offered = arriving.reduce((sum, c) => sum + c.amount, 0);

    let rejected = 0;
    while (queue.length && k - queue[0].arrivedTick >= maxWaitTicks) {
      const cohort = queue.shift()!;
      rejected += cohort.amount;
      if (cohort.attempt < attempts && k + backoffTicks < ticks) retriesDue[k + backoffTicks].push({ ...cohort, attempt: cohort.attempt + 1 });
      else totals.failed += cohort.amount;
    }
    totals.rejected += rejected;

    let free = concurrency - inFlight;
    let started = 0;
    let latencySum = 0;
    const waiting: Cohort[] = [];
    for (const cohort of queue) {
      const take = Math.min(cohort.amount, Math.max(0, free));
      if (take > 0) {
        free -= take;
        started += take;
        latencySum += take * ((k - cohort.arrivedTick) * tickMs + serviceNow);
      }
      if (cohort.amount - take > 1e-9) waiting.push({ ...cohort, amount: cohort.amount - take });
    }
    queue = waiting;
    inFlight += started;
    if (started > 0) lastLatency = latencySum / started;

    samples.push({
      t: Number((k * dt).toFixed(3)),
      offeredPerSecond: offered / dt,
      servedPerSecond: served / dt,
      rejectedPerSecond: rejected / dt,
      queued: queue.reduce((sum, c) => sum + c.amount, 0),
      inFlight,
      latencyMs: lastLatency,
    });
  }

  return { samples, totals, capacityPerSecond: concurrency * 1000 / serviceMs };
}
