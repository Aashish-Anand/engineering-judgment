import { PartitionFlowNode as Node, PartitionFlowArrow as Arrow } from "./PartitionFlowNode";

export function HotPartitionDiagram({ resolved = false }: { resolved?: boolean }) {
  return <figure className="my-8 border border-ink rounded-xl bg-white p-4 sm:p-6">
    <figcaption className="font-hand text-2xl font-bold mb-5">{resolved ? "Follow each kind of work to its next bottleneck" : "One popular post sends everyone to the same place"}</figcaption>
    {resolved ? <>
      <Node title="Taylor's post gets popular">Reading, reacting, and delivering feeds create different kinds of work.</Node>
      <Arrow>Give each job its own path</Arrow>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Read the post", "Cached copies", "Watch: refresh bursts and cache bandwidth."],
          ["Like the post", "User reaction buckets", "Watch: the job that combines counts."],
          ["Open a feed", "Combine recent posts", "Watch: feed read cost and freshness."],
        ].map(([title, destination, watch]) => <div key={title}><Node title={title}>{destination}</Node><Arrow>Next pressure point</Arrow><div className="text-sm border-l-2 border-ink pl-3">{watch}</div></div>)}
      </div>
    </> : <>
      <Node title="100,000 requests each second">70,000 target Taylor&apos;s post; 30,000 target other posts.</Node>
      <Arrow>The partition key chooses the DB partition</Arrow>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2" aria-label="Sixteen partitions; partition 7 receives 70,000 requests per second, each other partition receives 2,000 in this example">
        {Array.from({ length: 16 }, (_, i) => <div key={i} className={`rounded-lg border p-2 text-center ${i === 6 ? "bg-pastel-pink border-[#DC2626]" : "bg-paper border-ink/20"}`}>
          <span className="block font-hand font-bold">P{i + 1}</span><span className="block text-sm">{i === 6 ? "70k/s" : "2k/s"}</span><span className="block text-xs mt-1">{i === 6 ? "7× limit" : "spare room"}</span>
        </div>)}
      </div>
      <p className="mt-4 mb-0 text-sm"><strong>P7 is the hot partition.</strong> Assume a limit of 10,000 requests/s for each partition. The others have room, but they do not own this key. Numbers are simplified, not product limits.</p>
    </>}
  </figure>;
}
