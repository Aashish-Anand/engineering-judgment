/** The data-driven blueprints rendered by ProductionBlueprintArticle. */
export type DataBlueprintId = "idempotent-api" | "poison-messages" | "retry-storm" | "connection-pool" | "schema-evolution";

export const blueprintExamples: Record<DataBlueprintId, { language: string; code: string; note: string; avoid: string[] }> = {
  "idempotent-api": {
    language: "pseudocode",
    code: `intent = claim_unique(account_id, operation, key, request_hash)
if intent.request_hash != request_hash: return conflict
if intent.is_terminal: return authorized_stored_result(intent)
if not acquire_recovery_lease(intent): return pending

# Outside the SQL transaction; stable key survives worker crashes.
result = provider.charge(intent.payload, key=intent.provider_key)
if result.is_ambiguous:
    schedule_reconciliation(intent.id)  # never use a fresh key
    return pending
commit_result_and_order_transition(intent.id, result)`,
    note: "Protocol sketch: claim and result updates need database constraints and conditional transitions. Lease expiry can overlap workers; remote deduplication is still required. Recovery must query or retry within the provider’s supported contract.",
    avoid: ["Do not turn a timeout into a definitive payment failure.", "Do not choose a fresh provider key during recovery or deduplicate unrelated purchases by amount.", "Do not delete unresolved intent records just because a retention timer fired."],
  },
  "poison-messages": {
    language: "pseudocode",
    code: `try:
    validate_supported_event(event)
    transaction:
        if insert_processed_id_if_absent(event.id):
            apply_business_transition(event)
    acknowledge(event)
catch PermanentPayloadError as error:
    quarantine_confirmed(event, error)  # original ID + context
    acknowledge(event)                 # only after durable handoff
catch TransientDependencyError:
    schedule_bounded_redelivery(event) # broker-specific durable retry`,
    note: "If quarantine handoff fails, leave the source unacknowledged. Duplicated quarantine deliveries must be tolerated. The local transaction covers local business state; remote effects require a separate safe protocol. Unexpected handler bugs should alert and follow a bounded recovery policy.",
    avoid: ["Do not acknowledge work merely because an exception was logged.", "Do not retry malformed input indefinitely or replay a repaired backlog without rate limits.", "Do not treat quarantine as proof that dependent events may safely run."],
  },
  "retry-storm": {
    language: "pseudocode",
    code: `while caller_deadline.has_time_for(attempt_timeout):
    if not concurrency.try_acquire(): return overloaded
    try:
        result = call_with_timeout_and_cancellation(remaining_deadline)
    finally:
        concurrency.release()
    if result.ok: return result
    if not result.retryable or not operation.safe_to_repeat: break
    if not retry_budget.take_token(): break
    delay = random(0, bounded_exponential_backoff(attempt))
    if not caller_deadline.has_time_for(delay + attempt_timeout): break
    wait(delay)
return truthful_fallback_or_failure`,
    note: "Control-flow sketch, with one retry owner. Timeout handling must account for work that keeps running remotely; releasing a local slot alone does not terminate it. Do not hold a concurrency slot while sleeping between attempts.",
    avoid: ["Do not reset the end-to-end deadline at each layer.", "Do not enable independent retries in every SDK, proxy, and service without accounting for multiplication.", "Do not use jitter or a circuit breaker as a substitute for bounded concurrency and a work budget."],
  },
  "connection-pool": {
    language: "pseudocode",
    code: `application_budget = database_budget - other_workloads - headroom
peak_replicas = steady_replicas + rollout_overlap
pool_max_per_replica <= application_budget / peak_replicas

connection = pool.acquire(deadline=acquisition_deadline)
try:
    transaction(connection):
        execute_bounded_database_work(connection)
finally:
    pool.release(connection)
# Perform eligible remote calls outside the database transaction.`,
    note: "The inequality allocates a ceiling; it does not determine optimal query concurrency. Include every service instance and worker using this budget. Choose concrete timeout and cancellation behavior using the driver and database contract.",
    avoid: ["Do not increase all replica pools when the database is already saturated.", "Do not hold a checked-out connection during an unrelated network call.", "Do not budget only for steady state or allow an unbounded acquisition queue."],
  },
  "schema-evolution": {
    language: "sql",
    code: `-- PostgreSQL example: run bounded chunks only after writers bridge.
-- $1 and $2 are stable primary-key range boundaries.
UPDATE orders
SET fulfillment_note = delivery_instructions
WHERE id > $1 AND id <= $2
  AND fulfillment_note IS NULL;

-- Inspect coverage and mismatches before switching reads.
SELECT count(*) AS mismatches
FROM orders
WHERE fulfillment_note IS DISTINCT FROM delivery_instructions;`,
    note: "This example assumes null is not a valid completed value and both columns have identical semantics. Use an explicit migration marker otherwise. Commit each chunk, persist checkpoints, and throttle. The full validation scan also costs I/O; schedule or partition it appropriately. Initial DDL and the later drop are separate reviewed operations.",
    avoid: ["Do not rename or drop a column while active or rollback versions still reference it.", "Do not run an unbounded backfill or overwrite a fresher value copied outside the database.", "Do not use row-copy progress as the only evidence that reads can switch safely."],
  },
};
