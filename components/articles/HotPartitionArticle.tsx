import { Breadcrumb } from "@/components/Breadcrumb";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ArticleNav } from "@/components/ArticleNav";
import { CategoryBadge } from "@/components/CategoryBadge";
import { TableOfContents } from "@/components/TableOfContents";
import { SectionHeader } from "@/components/SectionHeader";
import { MetricTable } from "@/components/MetricTable";
import { DecisionTable } from "@/components/DecisionTable";
import { InsightCard } from "@/components/InsightCard";
import { Timeline } from "@/components/Timeline";
import { LevelExpectation } from "@/components/LevelExpectation";
import { ExpandableQuestion } from "@/components/ExpandableQuestion";
import { RelatedTopics } from "@/components/RelatedTopics";
import { WhatBreaksNext } from "@/components/doodle/WhatBreaksNext";
import { HotPartitionLab } from "@/components/HotPartitionLab";
import { HotPartitionDiagram } from "@/components/diagrams/HotPartitionDiagram";
import { HotPartitionFlow } from "@/components/diagrams/HotPartitionFlow";
import {
  DatabaseRequestGate,
  ReactionKeyExample,
  ReactionRetryExample,
  ReactionMigrationExample,
  CommentReadExample,
} from "@/components/diagrams/HotPartitionWorkedExamples";
import { getTopicById } from "@/data/topics/catalog";
import { meta, tocItems, phases, expectations, followUps } from "@/data/topics/fix-hot-partition";

export function HotPartitionArticle() {
  return (
    <article className="pt-4 pb-16 px-6">
      <div className="wide-width mx-auto">
        <Breadcrumb items={[{ label: "Problems", href: "/" }, { label: "Traffic", href: "/#problems" }, { label: "Hot Partition" }]} />
        <header className="mb-8 pb-6 border-b border-ink/20">
          <CategoryBadge category={meta.category} size="md" />
          <h1 className="font-hand text-3xl sm:text-4xl font-bold mt-3 mb-4">{meta.title}</h1>
          <p className="text-lg">Taylor Swift publishes a post. Millions of fans want to see it. Most DB nodes have spare capacity, but one partition is overwhelmed. Why doesn&apos;t adding servers fix it?</p>
          <p className="text-sm">A worked system-design walkthrough: find the bottleneck, protect the database, spread independent writes, and check what breaks next.</p>
        </header>
        <div className="flex flex-col lg:flex-row gap-10">
          <TableOfContents items={tocItems} />
          <div className="flex-1 min-w-0 prose-width">
            <SectionHeader number="01" id="the-problem" title="The problem: one post, one overloaded partition" />
            <p>It is 8:00 pm. Taylor posts. Fans open the post, refresh the post-like count, tap the like button, and leave comments. Within seconds, the post starts timing out. Unrelated posts stored nearby become slow too.</p>
            <p>The database divides its data into <strong>partitions</strong>. A <strong>partition key</strong> decides which partition holds a record. Our original design groups a post and its reactions under <code>post_id</code>. Every request for Taylor&apos;s post therefore goes to the same partition, P7.</p>
            <p>A <strong>DB node</strong> is the machine serving database work; it can host several partitions. A partition is a grouping of data, not necessarily a whole machine. This distinction will matter when we split the data later.</p>
            <MetricTable rows={[
              { label: "Incoming traffic", value: "100,000 requests/s" },
              { label: "Database partitions", value: "16" },
              { label: "Requests routed to P7", value: "70,000/s (70%)" },
              { label: "Other 15 partitions", value: "2,000/s each on average" },
              { label: "Required behavior", value: "Keep accepted reactions durable" },
            ]} sideNote="These are teaching numbers, not a database benchmark. A read, a large comment query, and a write do not necessarily cost the same." />
            <ScrollReveal><HotPartitionDiagram /></ScrollReveal>
            <p>Our goal is not simply to make the graph look balanced. Fans should be able to read the post, accepted user actions must not disappear, and ordinary posts should remain usable. We can allow the public post-like count to update a little later; we cannot silently discard a saved reaction.</p>

            <SectionHeader number="02" id="the-mistake" title="The first mistake: add servers without changing the work" />
            <p>Suppose we double the app servers. They can accept more requests, but they all still ask P7 for the same data. We have increased the number of callers, not the capacity of the bottleneck.</p>
            <p>Adding DB nodes can help when many busy keys share a node and the database can move them apart. It does not automatically divide one frequently updated record. Moving Taylor&apos;s post to a dedicated partition may protect its neighbors, but that new partition still receives all of the post&apos;s work.</p>
            <ScrollReveal><InsightCard title="Hot partition is not always the same as hot key">If many different posts overload P7, rebalancing them may be enough. If one post dominates P7, we must avoid repeated work for that post or split work that can safely run independently.</InsightCard></ScrollReveal>
            <p>This is why “use more partitions” is not yet an answer. We need to explain <em>which records move, how requests find them, and whether those records still compete for the same physical capacity</em>.</p>

            <SectionHeader number="03" id="diagnosis" title="Find what is actually making P7 busy" />
            <p>Start with per-partition latency, errors, throttling, and resource use. A healthy cluster average can hide one overloaded partition. Then use sampled request logs to identify the busiest post IDs and the operations hitting them.</p>
            <DecisionTable headers={["What we observe", "What it means", "Likely response"]} rows={[
              ["Repeated reads of the same public post", "We keep fetching identical content", "Reuse cached copies"],
              ["Many updates to one post-like counter", "Different users contend on one record", "Store reactions separately; combine counts later"],
              ["Many independent posts on one DB node", "Placement is uneven", "Rebalance or add physical capacity"],
              ["Errors followed by a retry spike", "Failures are generating more work", "Limit retries and reject excess work early"],
              ["Oldest background job keeps getting older", "Workers cannot keep up", "Reduce work or increase processing capacity"],
            ]} />
            <p>Also measure bytes and query cost. A huge image can exhaust bandwidth while a tiny counter update exhausts write capacity. “70% of requests” tells us where to investigate; it does not prove which resource is saturated.</p>
            <p>For the rest of this walkthrough, assume we found two major causes: repeated public-post reads and a shared post-like counter. Comments and follower-feed jobs need separate checks—we will return to them after fixing those first two bottlenecks.</p>

            <SectionHeader number="04" id="mental-model" title="The mental model: reuse reads, distribute independent changes" />
            <p>A thousand fans reading the same public text do not require a thousand database reads. But a thousand fans submitting reactions are making a thousand distinct changes. Caching helps the first case; it cannot replace durable storage for the second.</p>
            <ScrollReveal><InsightCard title="Split the problem before splitting the database">Public reads can share a copy. Alice&apos;s and Bob&apos;s reactions can be stored independently. Two changes from Alice still need a rule that preserves her latest intent.</InsightCard></ScrollReveal>
            <p>There is one more constraint: if every independent reaction still updates the same global counter synchronously, we have rebuilt the bottleneck. The design must separate saving a user&apos;s reaction from refreshing the number displayed on the post.</p>

            <SectionHeader number="05" id="architecture" title="The architecture: two paths with different guarantees" />
            <ScrollReveal><HotPartitionDiagram resolved /></ScrollReveal>
            <h3 className="font-hand text-2xl font-bold mt-6 mb-3">Path A: reading the public post</h3>
            <p>Keep reusable public content in an edge cache or app-local cache. A cache is simply a stored copy that avoids repeated database work. Keep viewer-specific state—such as “you liked this post”—separate. A private response must not accidentally become a shared public copy.</p>
            <p>The following read-only example sends all 70,000 hot requests through the read path. At a 99% cache hit rate, 69,300 reads use the copy and only 700 reach the database. This is a simplified experiment, not a claim that our mixed workload consists entirely of reads.</p>
            <HotPartitionFlow />
            <p>Now let that cached copy expire. If 1,000 requests arrive together, they should not all fetch a replacement. Let one refresh run and have the others wait briefly or use an older copy when permitted. This is <strong>request coalescing</strong>. Vary expiry times across cached copies—<strong>expiration jitter</strong>—so they do not all refresh at once.</p>
            <p>Old public post-like counts may be acceptable briefly. Deleted posts, revoked access, and privacy changes need explicit invalidation or access checks. A short expiry time alone is not a security guarantee.</p>
            <h3 className="font-hand text-2xl font-bold mt-6 mb-3">Keep a database request limit—even when the cache is healthy</h3>
            <p>A good hit rate is not a safety mechanism. A cache outage or sudden expiry can turn 700 DB reads into 70,000. Put an admission gate <em>after</em> the cache lookup and <em>before</em> starting a database query. Refresh jobs and retries must pass through it too.</p>
            <DatabaseRequestGate />
            <p>For a concrete read-only budget, suppose testing shows P7 can handle 10,000 reads/s. Reserve 4,000 for other work and spare capacity, leaving at most 6,000 reads/s for this hot post. A <strong>token bucket</strong> adds tokens at that rate; starting a query spends a token. Its small bucket size limits how large a burst can pass.</p>
            <p>Also limit queries running at the same time. If queries slow down, even an acceptable request rate can fill all database connections. Release that active-query slot when the query completes or is cancelled.</p>
            <p>The budget is <strong>6,000 across the service</strong>, not 6,000 on each app server. Ten independent limiters would allow 60,000. Use a shared limit or bounded allocations whose total stays within the budget. If the limiter is unavailable, use a conservative local fallback. If no capacity remains, serve a permitted older public copy or reject promptly; do not build an unlimited waiting line.</p>
            <p className="text-sm">The distinction between a shared budget and a per-server limit is described in <a className="underline" href="https://gateway.envoyproxy.io/docs/concepts/rate-limiting/">Envoy&apos;s rate-limiting documentation</a>. The numbers here are illustrative; read and write budgets need separate workload measurements.</p>
            <h3 className="font-hand text-2xl font-bold mt-6 mb-3">Path B: saving post-like actions</h3>
            <p>Replace “update the same counter for every click” with “save this user&apos;s reaction.” Spread those reaction records across several bucket keys. A background worker maintains bucket counts and periodically publishes a combined display count, rather than synchronously updating one global record on every action.</p>
            <HotPartitionFlow writes />
            <p>This changes the guarantee deliberately: Alice&apos;s reaction is durable when we confirm it, but the public count may take a moment to catch up. If the product requires a globally exact count immediately after every action, this cheaper design does not satisfy that requirement.</p>

            <SectionHeader number="06" id="incident" title="During the incident: stabilize first, redesign safely" />
            <p>Do not start an untested repartitioning job while P7 is already failing. First reduce pressure using controls you have already built and tested. The durable fix can then be rolled out without competing with emergency traffic.</p>
            <ScrollReveal><Timeline phases={phases} /></ScrollReveal>
            <p>Protect ordinary posts with real resource budgets: reserved workers, bounded database connections, and limits on celebrity-post jobs. Two queue names do not provide isolation if one queue can consume every worker and connection.</p>
            <p>For reaction writes, report success only after durable acceptance—either the committed reaction or a durable command with an explicit “pending” contract. An in-memory queue is not durable acceptance. A full queue should lead to a clear retryable rejection, not a success message for work we may lose.</p>
            <p>Watch recovery in both directions: user-visible errors and latency should fall, while the age of waiting work should shrink. A growing backlog with a green API success-rate graph is not recovery.</p>

            <SectionHeader number="07" id="sharding" title="Work through the reaction design: keys, retries, and migration" />
            <h3 className="font-hand text-2xl font-bold mt-6 mb-3">1. Make Alice&apos;s record easy to find</h3>
            <p>Take post <code>taylor-post-42</code> and four buckets. Compute <code>stable_hash(user_id) % 4</code>. Suppose Alice maps to bucket 0 and Bob to bucket 2. Use <code>post_id + bucket</code> as the partition key and <code>user_id</code> to identify the reaction inside that bucket.</p>
            <ReactionKeyExample />
            <p>When Alice taps “unlike,” the same calculation finds her existing record. We do not search every bucket. A stable hash is important: the same user ID must map consistently across app servers and restarts.</p>
            <p>Putting Alice&apos;s ID only in a sort key while leaving <code>post_id</code> as the partition key still groups those writes under the same partition key. And four bucket keys do not guarantee four DB nodes: verify actual placement and throughput. Splitting keys helps only when the database can serve them with additional capacity.</p>
            <p className="text-sm"><a className="underline" href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-sharding.html">AWS&apos;s write-sharding guidance</a> describes calculated bucket suffixes and their read trade-offs. This reaction schema is a worked design example, not a universal database layout.</p>
            <h3 className="font-hand text-2xl font-bold mt-6 mb-3">2. Save one action once—even if the network retries</h3>
            <p>Alice sends a post-like action. The database saves it, but the response is lost. Her phone retries. Blindly adding 1 again would count the same action twice. Keep the same operation ID across retries and record whether that operation has already been accepted. This is <strong>idempotency</strong>: repeating a request does not repeat its effect.</p>
            <ReactionRetryExample />
            <p>Next, Alice sends an unlike. A delayed retry of her earlier post-like action must not undo it. Use an authoritative per-user/post sequence or conditional updates against the stored version; timestamps from different phones are not enough. The service must define how conflicting actions from multiple devices are ordered.</p>
            <p>Commit the reaction change and its count-update event together, for example with a transactional outbox: an event record saved in the same transaction and delivered later. Otherwise a crash between those two writes can leave a saved reaction with no count update. Apply a count delta only for an accepted state transition, make the count worker deduplicate replays, and periodically reconcile counts against stored reactions.</p>
            <h3 className="font-hand text-2xl font-bold mt-6 mb-3">3. Add buckets without losing existing reactions</h3>
            <p>Changing the formula from <code>% 4</code> to <code>% 8</code> can move records. A user whose hash is 6 was in bucket 2 and will now be in bucket 6. Changing every app server immediately would make old records appear missing and let old and new routes accept conflicting writes.</p>
            <ReactionMigrationExample />
            <p>Keep a routing version for the post. Copy existing reactions while capturing new changes, replay those changes, and verify the new copy. At handoff, stop or reject writes using the old ownership version before the new owner accepts writes; drain or retry in-flight operations using their original operation IDs.</p>
            <p>Start with a small set of posts. A rollback must preserve writes accepted after the handoff: switching the formula back without replaying those changes loses data. This is a small database migration, not merely a configuration change.</p>
            <h3 className="font-hand text-2xl font-bold mt-6 mb-3">4. Comments need a read plan too</h3>
            <p>Independent comments can also be distributed, but readers want one ordered page. Imagine bucket 0 contains comments at 10:03 and 10:01, while bucket 1 contains 10:02 and 10:00. Fetch candidates from both and merge them into one newest-first list.</p>
            <CommentReadExample />
            <p>Use a stable tie-breaker, such as comment ID, for equal timestamps. The next-page token needs each bucket&apos;s position and a defined rule for comments arriving between pages. Eight buckets can mean eight queries per page. A separate read index may reduce that cost, but an index keyed only by the same popular post can become the next hot partition.</p>

            <SectionHeader number="08" id="trade-offs" title="The trade-offs: what each fix costs" />
            <DecisionTable headers={["Decision", "What improves", "What we now own"]} rows={[
              ["Cache public content", "Repeated reads avoid the database", "Freshness, invalidation, memory, and cache-outage protection"],
              ["Bucket user reactions", "Independent writes can run in parallel", "Placement checks, routing versions, and safe migration"],
              ["Publish counts asynchronously", "No global counter update on every action", "Display lag, duplicate detection, and reconciliation"],
              ["Distribute comments", "More write capacity", "Multi-bucket paging and potentially expensive reads"],
              ["Reserve resources for ordinary traffic", "One celebrity does not consume every worker", "Capacity reservations and operational limits"],
            ]} />
            <p>There is no free “exact count” hidden in the buckets. Reading bucket 0 before Alice&apos;s action and bucket 1 after Bob&apos;s action does not necessarily give a total from one instant. Exact snapshot counts require suitable database semantics or coordination. Decide whether that cost is justified by the product.</p>

            <SectionHeader number="09" id="failure-modes" title="What can still go wrong?" />
            <DecisionTable headers={["Failure", "What you see", "How to contain it"]} rows={[
              ["Cached copies expire together", "A sudden DB-read spike", "One refresh per key, staggered expiry, and the DB gate"],
              ["The shared cache becomes hot", "Cache latency rises despite a good hit rate", "App-local copies or eligible replicated reads; measure bandwidth too"],
              ["Buckets share the same saturated node", "More keys, no throughput improvement", "Inspect physical placement and add real capacity"],
              ["Count events are replayed or lost", "Displayed count drifts from reactions", "Atomic event recording, deduplication, and reconciliation"],
              ["Arrival rate exceeds worker capacity", "Oldest-job age keeps increasing", "Bound queues, limit admission, and increase drain capacity"],
              ["Old and new routes both accept writes", "Conflicting or missing reactions", "Version checks and a controlled ownership handoff"],
            ]} />
            <p>A queue buys time; it does not create capacity. If 12,000 actions arrive each second and workers complete 8,000, the backlog grows by 4,000 every second. Increase processing capacity, reduce the admitted workload, or change the work being done.</p>

            <SectionHeader number="10" id="ten-x" title="What breaks next—and can you predict it?" />
            <ScrollReveal><WhatBreaksNext solved="Repeated DB reads and one shared reaction counter" nextIssue="Aggregation, comment reads, and follower-feed work" steps={["Save reactions", "Combine counts", "Serve feeds"]} explanation="Follow the work after the first bottleneck. Parallel writes do not help if every accepted action immediately converges on another single overloaded record or worker." /></ScrollReveal>
            <p>Publishing to millions of follower feeds is called <strong>fanout</strong>. Even with the post cached, copying it into every follower&apos;s feed can overload background workers. A hybrid feed design can push ordinary posts ahead of time while fetching celebrity posts when followers open their feeds. This trades publishing work for read-time merging; it needs its own capacity and latency budget.</p>
            <p>Now test the first two fixes in isolation. This lab uses a deliberately simplified 70,000-request/s workload: either all reads or all post-like writes. Each simulated partition has an assumed 10,000-request/s capacity. It does not model mixed operation costs, replication, or real database placement.</p>
            <HotPartitionLab />
            <p><strong>Try this:</strong> set reads to 99% cache hits, then imagine the cache disappears. Switch to writes and choose seven partitions: each gets exactly 10,000 writes/s, leaving no spare room. Eight averages 8,750—but only if traffic is evenly distributed and the buckets have independent capacity. Which assumption would you verify first in production?</p>

            <SectionHeader number="11" id="avoid" title="What to avoid" />
            <ul className="list-disc pl-6 space-y-3 my-4">
              <li><strong>Do not cache away a write.</strong> A cached response is not proof that a reaction was saved.</li>
              <li><strong>Do not split records and keep one synchronous global counter.</strong> That preserves the original contention.</li>
              <li><strong>Do not use unlimited retries or queues.</strong> They turn a brief overload into a longer incident.</li>
              <li><strong>Do not assume timestamp buckets spread a burst.</strong> All new comments may hit the current time bucket.</li>
              <li><strong>Do not promise global ordering and unlimited parallelism together.</strong> Decide which actions actually need ordering.</li>
            </ul>

            <SectionHeader number="12" id="interview" title="A clear interview answer" />
            <InsightCard title="Explain the diagnosis, the design, and the guarantees">
              <p>I would first confirm whether the hot partition contains many busy keys or one popular post, and separate read load from write load. For many keys, rebalancing may help. For one popular post, more app servers do not change where its database work goes.</p>
              <p>I would cache reusable public reads, collapse refreshes, and enforce a shared database budget so cache failures cannot overwhelm the partition. I would distribute independent user reactions using stable post-and-user bucket routing, preserve operation IDs across retries, and use versions to prevent old actions from overwriting newer intent.</p>
              <p>I would publish display counts asynchronously rather than updating one shared counter per action. Finally, I would plan comment reads, migrate routing safely, verify physical capacity, and monitor worker backlog and follower-feed work. The public count can lag; accepted reactions must remain durable.</p>
            </InsightCard>

            <SectionHeader number="13" id="expectations" title="How the answer grows with experience" />
            <p>You do not need to name every mechanism at once. Start with the bottleneck and a correct read/write distinction. A stronger answer adds failure handling and demonstrates how the design behaves during retries and migration.</p>
            <LevelExpectation levels={expectations} />

            <SectionHeader number="14" id="follow-ups" title="Follow-up questions" />
            {followUps.map((item) => <ExpandableQuestion key={item.question} question={item.question} answer={item.answer} />)}

            <SectionHeader number="15" id="related" title="Related problems" />
            <p>The same principles appear in flash sales and database migrations: control admitted work before overload spreads, and change ownership without losing accepted writes.</p>
            <RelatedTopics topics={["database-migration", "flash-sale"].map((id) => {
              const topic = getTopicById(id as "database-migration" | "flash-sale");
              return { title: topic.meta.title, category: topic.meta.category, href: topic.href };
            })} />
            <details className="my-8 rounded-lg border border-ink/20 p-4">
              <summary className="font-hand text-xl font-bold cursor-pointer">Sources and further reading</summary>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><a className="underline" href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-sharding.html">AWS: calculated write-sharding keys and query trade-offs</a></li>
                <li><a className="underline" href="https://gateway.envoyproxy.io/docs/concepts/rate-limiting/">Envoy: global and local rate limits</a></li>
                <li><a className="underline" href="https://builder.aws.com/content/3Eun1EEyX6p2e3VYNyRLSJzLuMV/using-load-shedding-to-avoid-overload">AWS: rejecting excess work to prevent overload</a></li>
                <li><a className="underline" href="https://builder.aws.com/content/3EuxuD6bWtQ6gEp9FaKQfd3Z2AM/using-dependency-isolation-to-contain-concurrency-overload">AWS: isolating workloads with concurrency budgets</a></li>
              </ul>
            </details>
            <ArticleNav currentId="hot-partition" />
          </div>
        </div>
      </div>
    </article>
  );
}
