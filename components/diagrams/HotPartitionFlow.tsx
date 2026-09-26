import { PartitionFlowNode as Node, PartitionFlowArrow as Arrow } from "./PartitionFlowNode";

export function HotPartitionFlow({ writes = false }: { writes?: boolean }) {
  return <figure className="my-8 border border-ink rounded-xl bg-white p-4 sm:p-6">
    <figcaption className="font-hand text-2xl font-bold mb-5">{writes ? "Two users. Two independent paths." : "Most reads stop at the saved copy."}</figcaption>
    {writes ? <>
      <Node title="Reaction service">Use both the post ID and user ID to choose where a reaction lives.</Node>
      <Arrow>Route by user · these branches run in parallel</Arrow>
      <div className="grid grid-cols-2 gap-3">
        <Node title="Alice → bucket A" tone="blue">Like → unlike → retry<br />All return to Alice&apos;s record.</Node>
        <Node title="Bob → bucket B" tone="green">Like → retry<br />Bob can update his record independently.</Node>
      </div>
      <Arrow>Process saved changes in the background</Arrow>
      <Node title="Bucket counts → display total" tone="yellow">Combine results periodically. Avoid updating one global counter for every click.</Node>
      <p className="text-sm mt-4 mb-0">The user&apos;s reaction is saved first. The public count can catch up later. Buckets only add capacity when the underlying resources can share the work.</p>
    </> : <>
      <Node title="70,000 reads per second">Fans ask for the same public post.</Node>
      <Arrow>Check a nearby cache</Arrow>
      <Node title="Is there a usable saved copy?" tone="yellow">Example: 99% of requests find one.</Node>
      <div className="grid grid-cols-2 gap-3">
        <div><Arrow>Yes · 69,300/s</Arrow><Node title="Return the copy" tone="green">No database read for these requests.</Node></div>
        <div><Arrow>No · 700/s</Arrow><Node title="Read the database">Return the post and refresh the saved copy.</Node></div>
      </div>
      <p className="text-sm mt-4 mb-0">An illustrative steady-state calculation. A sudden burst of missing copies needs shared refreshes and a limit on database requests.</p>
    </>}
  </figure>;
}
