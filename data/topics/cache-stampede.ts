import type { BlueprintTail } from "@/components/articles/BlueprintSections";
import type { QuizQuestion } from "@/components/JudgmentQuiz";

export const scenarioMetrics = [
  { label: "Hot key", value: "home:eu, the regional home page feed" },
  { label: "Read rate (illustrative)", value: "12,000 requests/second on that one key" },
  { label: "Rebuild query", value: "300 ms on a healthy database" },
  { label: "TTL", value: "60 seconds" },
  { label: "App instances", value: "40, autoscaling" },
  { label: "Database headroom (illustrative)", value: "About 150 rebuild queries at once" },
  { label: "Requirement", value: "Home page stays up when the key expires, the cache restarts, or the database is slow" },
];

export const judgmentQuiz: QuizQuestion[] = [
  {
    scenario: "A key serving 8,000 requests per second expires. Rebuilding it takes 500 ms, and there is no protection. Roughly how many rebuild queries reach the database in the first window?",
    options: [
      { text: "One, because the first request writes the value back.", isCorrect: false, explanation: "The first request does write it back, but only after 500 ms. Every request arriving before then also misses and queries." },
      { text: "About 4,000, and more if the extra load slows the rebuild.", isCorrect: true, explanation: "8,000 per second × 0.5 seconds ≈ 4,000 misses. Those queries slow the database, which lengthens the window and admits more misses." },
      { text: "8,000, one per request in the following second.", isCorrect: false, explanation: "Only requests inside the rebuild window miss. If the rebuild finishes in 500 ms, the rest of the second is served from cache." },
    ],
  },
  {
    scenario: "Each of 40 instances uses an in-process single-flight around the rebuild. Traffic doubles and autoscaling grows the fleet to 200 instances. The database handles about 150 rebuild queries at once. What happens at the next expiry?",
    options: [
      { text: "Nothing changes: single-flight guarantees one rebuild per key.", isCorrect: false, explanation: "Single-flight only coalesces callers inside one process. Each instance still sends its own query." },
      { text: "The stampede is smaller because traffic is spread across more instances.", isCorrect: false, explanation: "Spreading traffic does not matter here; every instance with a request in the window sends one query." },
      { text: "About 200 queries arrive, more than the database headroom, so it stampedes again.", isCorrect: true, explanation: "Per-instance coalescing scales with the fleet. A shared lock or lease is needed for one rebuild across all instances." },
    ],
  },
  {
    scenario: "A nightly job warms 50,000 product keys between 02:00:00 and 02:00:05, all with a 3600-second TTL. At 03:00 the database spikes. What is the most direct fix?",
    options: [
      { text: "Add random jitter to each key's TTL so expiries spread out.", isCorrect: true, explanation: "The keys expire together because they were written together with the same TTL. Jitter (say ±10%) spreads 50,000 expiries over minutes instead of seconds." },
      { text: "Raise every TTL to 24 hours.", isCorrect: false, explanation: "They would still expire within the same five seconds, just a day later, and serve older data in the meantime." },
      { text: "Run the warm-up job more often.", isCorrect: false, explanation: "Each run rewrites the keys together, so they keep expiring together." },
    ],
  },
  {
    scenario: "The refresh worker holds the lock, but the database is down, so the rebuild fails. A stale value is still in the cache. What should readers get?",
    options: [
      { text: "An error, because the data could be out of date.", isCorrect: false, explanation: "For a home page feed, a minute-old value is far better than an error. Serving stale on error is the point of keeping a hard expiry separate from the soft one." },
      { text: "The stale value, until the hard expiry, while refreshes keep retrying.", isCorrect: true, explanation: "A failed refresh must leave the stale value in place. RFC 5861 names this stale-if-error. The hard expiry bounds how old the data can get." },
      { text: "Each reader should retry the rebuild itself so the cache repairs faster.", isCorrect: false, explanation: "That recreates the stampede against a database that is already failing." },
    ],
  },
  {
    scenario: "Which value should not be served stale while it refreshes?",
    options: [
      { text: "A product's average star rating.", isCorrect: false, explanation: "A rating a minute old harms nobody; stale-while-revalidate fits well." },
      { text: "The regional home page feed.", isCorrect: false, explanation: "This is the article's example: slightly old recommendations are acceptable." },
      { text: "Whether a user's account has just been suspended for fraud.", isCorrect: true, explanation: "Some reads must be current. For those, readers wait for one rebuild behind a lock with a deadline, or skip the cache, rather than act on stale data." },
    ],
  },
];

/** Sections 06–12 of the blueprint; sections 01–05 are content/blueprints/cache-stampede.mdx. */
export const blueprint: BlueprintTail = {
  runbook: {
    steps: [
      "Confirm it is a stampede: database queries per second for one query shape jump while cache hit ratio dips, right after a TTL boundary, deploy, or cache restart.",
      "Find the keys. Group misses by key; a stampede is a few keys with thousands of misses each, not many keys with one each.",
      "Stop the feedback loop first: shed or rate-limit the rebuild query (a concurrency limit on that query shape) so the database can finish the rebuilds already running.",
      "If the cache was flushed or restarted, warm the hottest keys from a known list before sending full traffic back.",
      "Ship the lasting fix per cause: a shared lock or lease for hot keys, serve-stale with soft expiry for values that tolerate it, TTL jitter for keys written together.",
      "Verify with the right metric: rebuild queries per key per expiry should be one, and p99 latency should not move at expiry boundaries.",
    ],
  },
  tradeoffs: [
    {
      caption: "Ways to limit rebuilds",
      headers: ["Technique", "Benefit", "Cost"],
      rows: [
        ["In-process single-flight", "No network, trivial to add", "One rebuild per instance; grows with the fleet"],
        ["Shared lock (SET NX PX)", "One rebuild across the fleet", "Waiters poll; lock TTL must outlast the slowest rebuild"],
        ["Memcache-style leases", "Built into the cache; also prevents stale sets", "Needs cache-server support"],
        ["Probabilistic early refresh (XFetch)", "No lock and no visible expiry for hot keys", "Some extra refreshes; needs the rebuild time stored"],
        ["Background refresh job", "Readers never rebuild", "Refreshes keys nobody reads; must know the key list"],
      ],
    },
    {
      caption: "Freshness decisions",
      headers: ["Decision", "Benefit", "Cost"],
      rows: [
        ["Serve stale until hard expiry", "Zero waiting readers; survives database outages", "Readers can see data up to the hard TTL old"],
        ["Wait for the rebuild", "Always fresh", "Latency at every expiry; needs a deadline and fallback"],
        ["Longer TTL", "Fewer expiries", "Each stampede is the same size; staler data"],
        ["TTL jitter", "Spreads keys written together", "Expiry time is less predictable"],
      ],
    },
  ],
  failures: [
    { title: "Lock holder crashes mid-rebuild", explanation: "The process that won the lock dies before writing the value. If the lock never expired, nobody could refresh that key again.", signal: "Key stays stale or missing; lock key present with no progress", response: "Always set a lock expiry (PX) a little above the slowest normal rebuild" },
    { title: "Lock expires before a slow rebuild finishes", explanation: "The rebuild takes longer than the lock's lifetime, so a second caller takes the lock and starts the same work. Under database pressure this repeats, and the stampede returns one lock period at a time.", signal: "Rebuild count per expiry above one, rising with database latency", response: "Size the lock from p99 rebuild time; extend it while working; cap rebuild query concurrency" },
    { title: "Cold cache after a failover", explanation: "A cache restart or new region has no stale values to serve, so every hot key goes through the cold path at once. The locks keep it to one rebuild per key, but thousands of keys still rebuild together.", signal: "Hit ratio near zero; database load spikes across many query shapes", response: "Warm the hottest keys first and ramp traffic; limit total rebuild concurrency" },
    { title: "Stale value served too long", explanation: "Refreshes keep failing quietly, so readers get old data right up to the hard expiry. Nothing errors, so nobody notices the data stopped changing.", signal: "Age of served values climbing; refresh error rate", response: "Alert on refresh failures and value age; keep the hard TTL as small as the business accepts" },
    { title: "Synchronised expiry from a bulk write", explanation: "A warm-up job or import writes thousands of keys in a few seconds with the same TTL. Exactly one TTL later they all expire together and the database sees a burst of different rebuilds.", signal: "Database spikes repeating at a fixed interval after a job", response: "Jitter TTLs; spread the job; refresh early" },
  ],
  scale: {
    paragraphs: ["Ten times the keys and ten times the traffic turn per-key protection into a capacity question:"],
    items: [
      "Lock and lease traffic becomes its own load on the cache; coalesce in-process before taking the shared lock.",
      "One key that is hot enough overloads a single cache node even when every read hits; replicate it or add a small in-process cache with a short TTL in front of Redis.",
      "Cold starts take longer than the traffic can wait; warm caches from a key list and admit traffic gradually.",
      "Total rebuild work, not any single key, saturates the database; cap rebuild concurrency per query shape and prefer background refresh for the top keys.",
    ],
  },
  interview: {
    answer: `A cache stampede happens when a hot key expires and every request in the rebuild window misses and runs the same expensive query. The size is request rate times rebuild time, so 12,000 requests per second and a 300 ms rebuild is about 3,600 identical queries, and the extra load slows the rebuild, which makes the window longer.

The invariant is one rebuild per key, not per reader. I store a soft expiry inside the value and keep Redis's TTL as a later hard expiry. Past the soft expiry, readers get the stale value immediately and one of them takes a short SET NX PX lock and refreshes in the background. If the key is completely missing, one caller rebuilds and the others wait with a deadline and a fallback.

I add TTL jitter so keys written together do not expire together, in-process single-flight to reduce lock traffic, and for the hottest keys, probabilistic early refresh so they never visibly expire.`,
    levels: [
      { title: "Mid-level", description: "Explain why a miss becomes a stampede and fix the obvious case.", items: ["Compute the stampede size as rate × rebuild time", "Explain why a longer TTL does not fix it", "Add a lock so one caller rebuilds"] },
      { title: "Senior", description: "Design the read path for all three cache states.", items: ["Separate soft and hard expiry and serve stale while refreshing", "Bound the cold path with a lock expiry, a wait deadline, and a fallback", "Distinguish per-instance single-flight from fleet-wide locks, and add TTL jitter"] },
      { title: "Staff", description: "Treat cache dependence as a capacity and recovery problem.", items: ["Plan cold-start recovery: warm lists, traffic ramp, rebuild concurrency caps", "Decide per data type which reads may be stale and for how long", "Provision the database for cache-miss scenarios, not only steady-state hit ratio"] },
    ],
    wrongAnswers: [
      { question: "Why not just make the TTL longer?", explanation: "The stampede's size is request rate × rebuild time; the TTL changes neither. It only makes stampedes less frequent and the data older." },
      { question: "Why not use single-flight in each instance?", explanation: "It coalesces per process. Forty instances send forty queries, and autoscaling to two hundred sends two hundred, past the database's headroom." },
      { question: "Why not have every reader wait on a lock until the value is rebuilt?", explanation: "It stops the database stampede but turns every expiry into a latency spike, and a slow rebuild leaves thousands of requests holding threads. Serve stale where you can, and give waiters a deadline and a fallback where you cannot." },
    ],
    traps: [
      "Lock without an expiry: one crash blocks refreshes for that key forever.",
      "Deleting the old value before the new one is ready, which turns every refresh into a cold miss.",
      "Same TTL on keys written by one job, which schedules a stampede for later.",
      "Measuring only hit ratio: 99.9% hits can still hide a stampede every minute.",
    ],
  },
  followUps: [
    ["What about a write that invalidates the key?", "Deleting on write creates a miss, so a hot key that is written often stampedes on every write. Prefer overwriting with the new value, or mark the entry stale instead of deleting it so readers keep a value while one refreshes. Facebook's memcache does this: a deleted value can still be returned, marked as stale."],
    ["How do you choose the lock's expiry?", "Above the slowest normal rebuild, usually p99 plus a margin. Too short and a second caller starts the same rebuild; too long and a crashed holder blocks refreshes. A holder that is still working can extend the lock."],
    ["Does a CDN have the same problem?", "Yes. Edge caches expire together and send their misses to the origin. Request collapsing at the edge and Cache-Control: stale-while-revalidate are the same two ideas: one fetch per object, and stale content served while it runs."],
    ["What if the value cannot be stale at all?", "Then readers must wait for one rebuild behind a lock, with a deadline and a defined failure, or read from the source of truth directly. Caching values that must always be current mostly moves the consistency problem rather than solving it."],
  ],
  quiz: { title: "Cache stampede", questions: judgmentQuiz, href: "/topics/performance/prevent-cache-stampede/quiz" },
  related: ["hot-partition", "connection-pool", "retry-storm", "rate-limiting"],
};
