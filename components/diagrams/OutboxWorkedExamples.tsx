import { PartitionFlowNode as Node, PartitionFlowArrow as Arrow } from "./PartitionFlowNode";

/**
 * Worked example: the outbox row lifecycle — write, publish, mark, clean up.
 */
export function OutboxRowLifecycle() {
  return <figure className="my-6 rounded-xl border border-ink bg-white p-4 sm:p-6">
    <figcaption className="font-hand text-xl font-bold mb-4">One outbox row from creation to cleanup</figcaption>
    <div className="grid sm:grid-cols-4 gap-3">
      <Node title="1. Created" tone="blue"><dl><dt className="font-semibold">id</dt><dd className="font-mono text-xs">47291</dd><dt className="font-semibold mt-1">event_type</dt><dd className="font-mono text-xs">OrderCreated</dd><dt className="font-semibold mt-1">published_at</dt><dd className="font-mono text-xs">NULL</dd></dl></Node>
      <Node title="2. Published" tone="yellow"><dl><dt className="font-semibold">Relay reads row</dt><dd className="text-xs">Publishes payload to broker topic.</dd><dt className="font-semibold mt-1">Broker ACK</dt><dd className="text-xs">Message durably stored.</dd></dl></Node>
      <Node title="3. Marked" tone="green"><dl><dt className="font-semibold">published_at</dt><dd className="font-mono text-xs">2024-01-15 14:30:02</dd><dt className="font-semibold mt-1">Status</dt><dd className="text-xs">Row will not be re-read by relay.</dd></dl></Node>
      <Node title="4. Archived" tone="blue"><dl><dt className="font-semibold">Cleanup job</dt><dd className="text-xs">Deletes or moves rows older than retention period.</dd><dt className="font-semibold mt-1">Table stays small</dt><dd className="text-xs">Prevents index bloat.</dd></dl></Node>
    </div>
    <p className="text-sm mt-4 mb-0">If the relay crashes between step 2 and step 3, the row remains unmarked. On restart, it is re-published. The consumer uses the outbox <code>id</code> to detect and discard the duplicate.</p>
  </figure>;
}

/**
 * Worked example: crash timeline — what exactly goes wrong with naive dual writes.
 */
export function DualWriteCrashTimeline() {
  return <figure className="my-6 rounded-xl border border-ink bg-white p-4 sm:p-6">
    <figcaption className="font-hand text-xl font-bold mb-4">A crash turns a successful order into a silent failure</figcaption>
    <ol className="space-y-3 list-decimal pl-5">
      <li><strong>14:30:01.000 — Application commits the order.</strong> <code>INSERT INTO orders</code> succeeds. The database transaction closes.</li>
      <li><strong>14:30:01.003 — Application calls the broker.</strong> The process begins to serialize and publish <code>OrderCreated</code>.</li>
      <li><strong>14:30:01.004 — The process crashes.</strong> Out of memory, deployment restart, or network partition. The event is lost in the application&apos;s memory.</li>
      <li><strong>14:30:01.100 — The process restarts.</strong> It has no record that an event was pending. The order exists in the database. No event will ever be published for it.</li>
    </ol>
    <p className="text-sm mt-4 mb-0">Payment is never charged. Inventory is never reserved. The customer sees a confirmed order, but nothing downstream acts on it. This is the <strong>lost event</strong> failure — the most common dual-write bug.</p>
  </figure>;
}

/**
 * Worked example: idempotent consumer handling re-delivered outbox events.
 */
export function IdempotentConsumerExample() {
  return <figure className="my-6 rounded-xl border border-ink bg-white p-4 sm:p-6">
    <figcaption className="font-hand text-xl font-bold mb-4">The consumer sees the same event twice — and handles it</figcaption>
    <Node title="Payment service receives OrderCreated (event_id: 47291)">First delivery. The service checks: has event 47291 been processed?</Node>
    <Arrow>Not found in processed_events table → process it</Arrow>
    <div className="grid sm:grid-cols-2 gap-3">
      <Node title="Charge the customer" tone="green">Payment API call succeeds. The service records event_id 47291 in its processed_events table.</Node>
      <Node title="Relay re-delivers event 47291" tone="yellow">Relay crashed before marking the outbox row. Same event arrives again.</Node>
    </div>
    <Arrow>Consumer checks processed_events: 47291 already exists</Arrow>
    <Node title="Skip — no double charge" tone="green">The consumer acknowledges the message without re-processing. The customer is charged exactly once.</Node>
    <p className="text-sm mt-4 mb-0">The deduplication check and the business operation should be in the same transaction on the consumer side. Otherwise, a crash between processing and recording can cause the same problem we are trying to solve.</p>
  </figure>;
}

/**
 * Worked example: outbox table schema as a concrete reference.
 */
export function OutboxSchemaExample() {
  return <figure className="my-6 rounded-xl border border-ink bg-white p-4 sm:p-6">
    <figcaption className="font-hand text-xl font-bold mb-4">A practical outbox table schema</figcaption>
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-ink">
            <th className="text-left py-2 px-3 font-hand font-bold">Column</th>
            <th className="text-left py-2 px-3 font-hand font-bold">Type</th>
            <th className="text-left py-2 px-3 font-hand font-bold">Purpose</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["id", "BIGSERIAL", "Monotonic ordering for the relay; deduplication key for consumers"],
            ["aggregate_type", "VARCHAR", "e.g. 'Order' — routes to the correct broker topic"],
            ["aggregate_id", "VARCHAR", "e.g. 'order-7842' — the broker partition key for per-entity ordering"],
            ["event_type", "VARCHAR", "e.g. 'OrderCreated' — consumers use this to deserialize the payload"],
            ["payload", "JSONB", "The serialized event data. Keep it self-contained."],
            ["created_at", "TIMESTAMPTZ", "When the event was committed. Useful for monitoring and cleanup."],
            ["published_at", "TIMESTAMPTZ", "NULL until the relay marks it. The relay queries WHERE published_at IS NULL."],
          ].map(([col, type, purpose]) => <tr key={col} className="border-b border-ink/10">
            <td className="py-2 px-3 font-mono font-semibold">{col}</td>
            <td className="py-2 px-3 font-mono text-ink-secondary">{type}</td>
            <td className="py-2 px-3">{purpose}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
    <p className="text-sm mt-4 mb-0">Index on <code>(published_at, id)</code> keeps relay queries fast. Partition the table by <code>created_at</code> to make cleanup a metadata operation instead of row-by-row deletion.</p>
  </figure>;
}
