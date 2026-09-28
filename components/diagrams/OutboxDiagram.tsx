import { PartitionFlowNode as Node, PartitionFlowArrow as Arrow } from "./PartitionFlowNode";

/**
 * Shows the dual-write problem (default) or the outbox solution (resolved).
 * Follows the same HTML-node diagram style as HotPartitionDiagram.
 */
export function OutboxDiagram({ resolved = false }: { resolved?: boolean }) {
  return <figure className="my-8 border border-ink rounded-xl bg-white p-4 sm:p-6">
    <figcaption className="font-hand text-2xl font-bold mb-5">{resolved ? "One transaction. One source of truth for the event." : "Two writes. Two chances to fail independently."}</figcaption>
    {resolved ? <>
      <Node title="Order service receives a purchase">The application starts a single database transaction.</Node>
      <Arrow>BEGIN TRANSACTION</Arrow>
      <div className="grid sm:grid-cols-2 gap-3">
        <Node title="INSERT order row" tone="green">The business data: order_id, items, total, status.</Node>
        <Node title="INSERT outbox row" tone="green">The event payload: order_id, event_type, serialized data.</Node>
      </div>
      <Arrow>COMMIT — both rows succeed or both roll back</Arrow>
      <Node title="Transaction committed" tone="yellow">The event exists in the database. It has not left the database yet — and that is the point.</Node>
      <Arrow>A separate relay publishes the row to the broker</Arrow>
      <div className="grid sm:grid-cols-3 gap-3">
        <Node title="Payment service" tone="blue">Charges the customer.</Node>
        <Node title="Inventory service" tone="blue">Reserves stock.</Node>
        <Node title="Notification service" tone="blue">Sends confirmation.</Node>
      </div>
      <p className="mt-4 mb-0 text-sm"><strong>If the broker is down</strong>, orders still succeed. Events queue in the outbox table and drain when the broker recovers.</p>
    </> : <>
      <Node title="Order service receives a purchase">The application needs to save the order AND tell downstream services about it.</Node>
      <Arrow>Step 1: Write to the database</Arrow>
      <Node title="INSERT INTO orders ..." tone="green">✓ The order is saved. The database transaction commits.</Node>
      <Arrow>Step 2: Publish to the message broker</Arrow>
      <Node title="broker.publish(OrderCreated)" tone="yellow">The application calls the broker as a separate network operation.</Node>
      <Arrow>What if this fails?</Arrow>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Node title="Crash or network error" tone="blue">The order exists in the database. The event never reaches the broker. Downstream services never learn about it.</Node>
          <p className="text-sm mt-2 text-center font-hand font-bold text-[#DC2626]">← Lost event (silent data loss)</p>
        </div>
        <div>
          <Node title="Publish before commit?" tone="blue">If we publish first and the DB commit fails, downstream services act on an order that does not exist.</Node>
          <p className="text-sm mt-2 text-center font-hand font-bold text-[#DC2626]">← Ghost event (phantom data)</p>
        </div>
      </div>
      <p className="mt-4 mb-0 text-sm"><strong>Neither ordering fixes the problem.</strong> Two independent systems cannot be made atomically consistent without a coordination mechanism.</p>
    </>}
  </figure>;
}

/**
 * Shows the relay flow: polling vs CDC, and the publish-then-mark cycle.
 */
export function OutboxRelayFlow({ cdc = false }: { cdc?: boolean }) {
  return <figure className="my-8 border border-ink rounded-xl bg-white p-4 sm:p-6">
    <figcaption className="font-hand text-2xl font-bold mb-5">{cdc ? "CDC relay: tail the transaction log" : "Polling relay: query unpublished rows"}</figcaption>
    {cdc ? <>
      <Node title="Database transaction log (WAL)">Every committed INSERT into the outbox table appears here.</Node>
      <Arrow>CDC connector (e.g. Debezium) tails the log</Arrow>
      <Node title="CDC captures the new outbox row" tone="yellow">The connector reads the change, extracts the event payload, and publishes it.</Node>
      <Arrow>Publish to Kafka topic</Arrow>
      <Node title="Event delivered to broker" tone="green">The connector tracks its WAL position. On restart, it resumes from the last committed offset.</Node>
      <p className="text-sm mt-4 mb-0">Near-real-time delivery. Trade-off: WAL retention, connector operational complexity, and schema coupling between the outbox table and the CDC pipeline.</p>
    </> : <>
      <Node title="Relay worker wakes up">Runs on a timer or after a notification. Queries the outbox table for unpublished rows.</Node>
      <Arrow>SELECT ... WHERE published_at IS NULL ORDER BY id LIMIT N</Arrow>
      <Node title="Batch of unpublished events" tone="yellow">The relay reads events in committed order, oldest first.</Node>
      <Arrow>Publish each event to the broker</Arrow>
      <Node title="Broker acknowledges" tone="green">The relay marks the row: UPDATE outbox SET published_at = NOW() WHERE id = ?</Node>
      <Arrow>Advance the high-water mark</Arrow>
      <Node title="Next poll skips published rows" tone="blue">If the relay crashes after publish but before marking, it will re-publish on restart. Consumers must handle duplicates.</Node>
      <p className="text-sm mt-4 mb-0">Polling interval controls latency. A 1-second poll adds up to 1 second of delay. Shorter intervals increase database load. Monitor the oldest unpublished row age.</p>
    </>}
  </figure>;
}
