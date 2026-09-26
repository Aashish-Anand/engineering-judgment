import { PartitionFlowNode as Node, PartitionFlowArrow as Arrow } from "./PartitionFlowNode";

export function DatabaseRequestGate() {
  return <figure className="my-6 rounded-xl border border-ink bg-white p-4 sm:p-6">
    <figcaption className="font-hand text-xl font-bold mb-4">Put the limit before every database call</figcaption>
    <Node title="Cache miss or refresh">The request needs to read partition P7.</Node>
    <Arrow>Check P7&apos;s shared rate budget and active-query limit</Arrow>
    <div className="grid sm:grid-cols-2 gap-3">
      <Node title="Budget available" tone="green">Start the DB query. Release its active-query slot when it finishes or times out.</Node>
      <Node title="Budget exhausted" tone="yellow">Serve an allowed older public copy, or reject promptly. Do not let an unlimited waiting queue grow.</Node>
    </div>
    <p className="text-sm mt-4 mb-0">Cache hits return immediately. Every path that reaches the database—including refresh jobs and retries—passes through the gate.</p>
  </figure>;
}

export function ReactionKeyExample() {
  return <figure className="my-6 rounded-xl border border-ink bg-white p-4 sm:p-6">
    <figcaption className="font-hand text-xl font-bold mb-4">Same post, different partition keys</figcaption>
    <Node title="Post: taylor-post-42">Use a stable hash of the user ID to choose one of four buckets. The bucket numbers below are illustrative.</Node>
    <Arrow>bucket = stable_hash(user_id) % 4</Arrow>
    <div className="grid sm:grid-cols-2 gap-3">
      <Node title="Alice → bucket 0" tone="blue"><dl><dt className="font-semibold">Partition key</dt><dd className="break-all font-mono">taylor-post-42#b0</dd><dt className="font-semibold mt-2">Record inside it</dt><dd>Alice: liked = true</dd></dl></Node>
      <Node title="Bob → bucket 2" tone="green"><dl><dt className="font-semibold">Partition key</dt><dd className="break-all font-mono">taylor-post-42#b2</dd><dt className="font-semibold mt-2">Record inside it</dt><dd>Bob: liked = true</dd></dl></Node>
    </div>
    <p className="text-sm mt-4 mb-0">To read Alice&apos;s reaction, calculate her bucket again. We can locate her record without searching all four buckets. Verify that the database spreads these keys over enough physical capacity.</p>
  </figure>;
}

export function ReactionRetryExample() {
  return <figure className="my-6 rounded-xl border border-ink bg-white p-4 sm:p-6">
    <figcaption className="font-hand text-xl font-bold mb-4">A retry is not a second post like</figcaption>
    <ol className="space-y-3 list-decimal pl-5">
      <li><strong>Alice taps Like.</strong> Operation <code>op-17</code> changes her stored state from unliked to liked. Its accepted count delta is +1.</li>
      <li><strong>The response is lost.</strong> Her phone retries <code>op-17</code>. The service recognizes that it already applied this operation. Count change: 0.</li>
      <li><strong>Alice taps Unlike.</strong> A newer accepted operation changes her state from liked to unliked. Count change: −1.</li>
      <li><strong>The old Like arrives late.</strong> A stored version check rejects it. Alice remains unliked.</li>
    </ol>
    <p className="text-sm mt-4 mb-0">Commit the reaction and its change event together. A background worker applies accepted deltas to bucket counts and detects replayed events. The public total updates later. A client timestamp alone is not a reliable ordering rule.</p>
  </figure>;
}

export function ReactionMigrationExample() {
  return <figure className="my-6 rounded-xl border border-ink bg-white p-4 sm:p-6">
    <figcaption className="font-hand text-xl font-bold mb-4">Why switching from 4 to 8 buckets needs a plan</figcaption>
    <Node title="Example user hash: 6">Old rule: 6 % 4 = bucket 2. New rule: 6 % 8 = bucket 6. The same user now routes to a different key.</Node>
    <Arrow>A new routing rule does not move the saved record</Arrow>
    <div className="grid sm:grid-cols-3 gap-3">
      <Node title="1. Prepare" tone="blue">Keep writes on the old rule. Copy reactions into the new layout and capture changes during the copy.</Node>
      <Node title="2. Catch up" tone="yellow">Apply those changes, compare state, and test reads on a small set of posts.</Node>
      <Node title="3. Hand over" tone="green">Use a routing version to block old writers, drain accepted work, then allow the new owner to accept writes.</Node>
    </div>
    <p className="text-sm mt-4 mb-0">Old routing must reject or redirect requests after handover. A rollback after new writes needs those writes copied back or replayed; changing a flag alone can lose them.</p>
  </figure>;
}

export function CommentReadExample() {
  return <figure className="my-6 rounded-xl border border-ink bg-white p-4 sm:p-6">
    <figcaption className="font-hand text-xl font-bold mb-4">Reading comments costs more after splitting writes</figcaption>
    <div className="grid sm:grid-cols-2 gap-3">
      <Node title="Bucket 0">Comment A · 10:03<br />Comment C · 10:01</Node>
      <Node title="Bucket 1" tone="green">Comment B · 10:02<br />Comment D · 10:00</Node>
    </div>
    <Arrow>Read candidates from both buckets; merge newest first</Arrow>
    <Node title="First page: A, B, C, D" tone="yellow">Break time ties with the comment ID. The next-page token records how far each bucket has been read.</Node>
    <p className="text-sm mt-4 mb-0">Eight buckets can require eight queries for one page, plus merging. A separate list designed for comment reads can reduce this cost, but if all updates use one post key, that list may become the next hot partition.</p>
  </figure>;
}
