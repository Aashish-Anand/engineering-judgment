export type CutoverPhase =
  | "baseline"
  | "canary"
  | "early-ramp"
  | "split-dual-write"
  | "late-ramp"
  | "full-cutover";

export type CutoverHealth = "healthy" | "warning" | "critical" | "rollback";

export type CutoverOptions = {
  cutoverPercent: number; // 0 to 100
  injectLagSpike?: boolean;
  injectDivergence?: boolean;
  isRolledBack?: boolean;
};

export type CutoverState = {
  cutoverPercent: number;
  percentA: number;
  percentB: number;
  readsA: number;
  readsB: number;
  writesA: number;
  writesB: number;
  replicationLagMs: number;
  divergenceRatePercent: number;
  blastRadiusPercent: number;
  healthStatus: CutoverHealth;
  phaseName: CutoverPhase;
  phaseTitle: string;
  phaseSummary: string;
  seniorAdvice: string;
  recommendedAction: string;
};

const TOTAL_PEAK_READS = 2300; // ~100M reads/day peak RPS
const TOTAL_PEAK_WRITES = 250;  // ~10M writes/day peak WPS

export function calculateCutoverState(options: CutoverOptions): CutoverState {
  const {
    cutoverPercent: rawPercent,
    injectLagSpike = false,
    injectDivergence = false,
    isRolledBack = false,
  } = options;

  const cutoverPercent = isRolledBack ? 0 : Math.max(0, Math.min(100, Math.round(rawPercent)));
  const percentA = 100 - cutoverPercent;
  const percentB = cutoverPercent;

  const readsB = Math.round((cutoverPercent / 100) * TOTAL_PEAK_READS);
  const readsA = TOTAL_PEAK_READS - readsB;

  const writesB = Math.round((cutoverPercent / 100) * TOTAL_PEAK_WRITES);
  const writesA = TOTAL_PEAK_WRITES - writesB;

  // Replication lag computation
  let replicationLagMs = 42 + Math.round((cutoverPercent / 100) * 35);
  if (injectLagSpike) {
    replicationLagMs += 3450;
  }
  if (isRolledBack) {
    replicationLagMs = 18; // Reverse CDC catching up
  }

  // Divergence calculation from shadow reads
  let divergenceRatePercent = 0.0;
  if (injectDivergence) {
    divergenceRatePercent = 0.42;
  }
  if (isRolledBack) {
    divergenceRatePercent = 0.0;
  }

  const blastRadiusPercent = cutoverPercent;

  // Health evaluation
  let healthStatus: CutoverHealth = "healthy";
  if (isRolledBack) {
    healthStatus = "rollback";
  } else if (divergenceRatePercent > 0 || replicationLagMs > 2500) {
    healthStatus = "critical";
  } else if (replicationLagMs > 300 || (cutoverPercent >= 40 && cutoverPercent <= 60)) {
    healthStatus = "warning";
  }

  // Phase categorization
  let phaseName: CutoverPhase = "baseline";
  let phaseTitle = "Phase 1 · Baseline Validation (100% DB A)";
  let phaseSummary =
    "All traffic writes to DB A. Initial snapshot and CDC pipeline are synchronizing historical and live rows to DB B.";
  let seniorAdvice =
    "Verify CDC lag is stable under peak business hours before routing any live traffic. A zero-lag pipeline under idle traffic does not prove headroom.";
  let recommendedAction = "Run historical checksum validation across primary keys.";

  if (cutoverPercent === 0 && isRolledBack) {
    phaseTitle = "Emergency Rollback Executed (100% DB A)";
    phaseSummary =
      "Traffic instantly reverted to DB A. Reverse CDC is actively replaying writes made to DB B back to DB A to preserve zero data loss.";
    seniorAdvice =
      "Never shut down Reverse CDC until you determine why DB B diverged. The reverse log protects accepted writes.";
    recommendedAction = "Inspect CDC dead letter queue and target query error logs.";
  } else if (cutoverPercent >= 1 && cutoverPercent <= 5) {
    phaseName = "canary";
    phaseTitle = `Phase 2 · Canary Traffic (${cutoverPercent}% DB B)`;
    phaseSummary =
      "A tiny slice of real traffic (internal employees, specific test tenants) reads and writes to DB B.";
    seniorAdvice =
      "Canary routing exposes schema mismatches, missing enum values, and dialect syntax bugs on a fraction of users with minimal blast radius.";
    recommendedAction = "Monitor application p99 latency and database connection pool usage.";
  } else if (cutoverPercent > 5 && cutoverPercent <= 25) {
    phaseName = "early-ramp";
    phaseTitle = `Phase 3 · Early Ramp (${cutoverPercent}% DB B)`;
    phaseSummary =
      "Expanding traffic to general read volume while monitoring IOPS, replication lag, and cache hit ratios.";
    seniorAdvice =
      "Watch DB B's disk I/O and buffer cache hit ratio. If the new database hasn't warmed its cache, read latency will spike.";
    recommendedAction = "Verify shadow read comparison metrics show 0.00% divergence.";
  } else if (cutoverPercent > 25 && cutoverPercent <= 75) {
    phaseName = "split-dual-write";
    phaseTitle = `Phase 4 · Split Load (${cutoverPercent}% DB B) · HIGH RISK`;
    phaseSummary =
      "Traffic is split heavily between both databases. Both clusters are active simultaneously.";
    seniorAdvice =
      "⚠️ 50/50 is the most dangerous operational window. Split-brain risk and dual-write conflict probability are at their mathematical maximum. Do NOT linger here; advance or roll back promptly.";
    recommendedAction = "Keep on-call alert channels open and prepare instant rollback trigger.";
  } else if (cutoverPercent > 75 && cutoverPercent < 100) {
    phaseName = "late-ramp";
    phaseTitle = `Phase 5 · Late Ramp (${cutoverPercent}% DB B)`;
    phaseSummary =
      "DB B is handling the vast majority of traffic. DB A now acts primarily as the warm backup.";
    seniorAdvice =
      "Confirm Reverse CDC (DB B ➔ DB A) has sufficient throughput to keep DB A updated in real-time in case an emergency rollback is required.";
    recommendedAction = "Check reverse replication lag before committing to final cutover.";
  } else if (cutoverPercent === 100) {
    phaseName = "full-cutover";
    phaseTitle = "Phase 6 · Full Cutover Complete (100% DB B)";
    phaseSummary =
      "100% of read and write traffic is handled by DB B. The migration is complete.";
    seniorAdvice =
      "Keep DB A running in read-only reverse sync for 24–48 hours before decommissioning to support retroactive audits and disaster recovery.";
    recommendedAction = "Mark migration milestone complete; schedule DB A archive window.";
  }

  return {
    cutoverPercent,
    percentA,
    percentB,
    readsA,
    readsB,
    writesA,
    writesB,
    replicationLagMs,
    divergenceRatePercent,
    blastRadiusPercent,
    healthStatus,
    phaseName,
    phaseTitle,
    phaseSummary,
    seniorAdvice,
    recommendedAction,
  };
}
