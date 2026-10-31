import type { BlueprintTail } from "@/components/articles/BlueprintSections";
import type { QuizQuestion } from "@/components/JudgmentQuiz";

export const scenarioMetrics = [
  { label: "API", value: "Public REST API, 2,000 tenants" },
  { label: "Gateways", value: "30 instances behind a load balancer" },
  { label: "Standard plan", value: "600 requests/minute per API key, burst 100" },
  { label: "Incident", value: "One tenant's retry loop sends 5,000 requests/second" },
  { label: "Limiter store", value: "Redis, shared by every gateway" },
  { label: "Requirement", value: "No tenant can spend another's capacity; a limiter failure must not take the API down" },
];

export const judgmentQuiz: QuizQuestion[] = [
  {
    scenario: "A limit of 600 requests per minute is enforced with a fixed window counter in Redis. What is the most a client can send in the two seconds around 12:08:00?",
    options: [
      { text: "About 20, because 600 per minute is 10 per second.", isCorrect: false, explanation: "That is the average the limit implies, but a fixed window does not enforce averages within the minute." },
      { text: "600, because the counter is shared.", isCorrect: false, explanation: "Sharing the counter fixes per-gateway multiplication, but not the reset at :00." },
      { text: "1,200: the old minute's 600 at 12:07:59 and the new minute's 600 at 12:08:00.", isCorrect: true, explanation: "The window resets at the boundary, so both allowances can be spent back to back." },
    ],
  },
  {
    scenario: "Each of 30 gateways keeps an in-memory token bucket at the plan's full limit of 600 per minute. The load balancer spreads requests evenly. What limit does one client actually get?",
    options: [
      { text: "About 18,000 per minute, and it changes whenever the fleet scales.", isCorrect: true, explanation: "Each gateway grants the full allowance. Local buckets are useful as a fallback only when each gets the limit divided by the gateway count." },
      { text: "600 per minute, because each bucket enforces 600.", isCorrect: false, explanation: "Each bucket only sees one-thirtieth of the client's traffic, so each lets through up to 600 of it." },
      { text: "20 per minute, because 600 is divided across 30 gateways.", isCorrect: false, explanation: "That would require configuring each gateway with 600 ÷ 30; the scenario gives each the full 600." },
    ],
  },
  {
    scenario: "Redis becomes unreachable for two minutes. The limiter protects tenant fairness, not the backend's survival. What should the gateway do?",
    options: [
      { text: "Reject every request until Redis returns, so no tenant exceeds its plan.", isCorrect: false, explanation: "Failing closed turns a limiter outage into a full API outage for every customer." },
      { text: "Switch to a local bucket per gateway with the limit divided by the gateway count, and alert.", isCorrect: true, explanation: "Fail open but bounded: the API stays up, and a runaway client is still held to roughly its plan. Stripe likewise designs its limiters to fail open." },
      { text: "Wait for Redis on every request with a 30-second timeout.", isCorrect: false, explanation: "Every request would hang. The limiter call needs a timeout of a few milliseconds." },
    ],
  },
  {
    scenario: "A client is over its limit. Which response helps both the client and your backend most?",
    options: [
      { text: "500 Internal Server Error, so the client retries later.", isCorrect: false, explanation: "A 500 says the server failed and invites immediate retries. It also hides that the client could fix this." },
      { text: "Hold the request open until a token is available.", isCorrect: false, explanation: "Queueing over-limit requests ties up gateway connections, which turns one client's excess into everyone's latency." },
      { text: "429 Too Many Requests with Retry-After set to the time until the next token.", isCorrect: true, explanation: "429 (RFC 6585) names the cause, and Retry-After tells the client exactly when to come back, which stops tight retry loops." },
    ],
  },
  {
    scenario: "Requests to a search endpoint are within every tenant's limit, but the search cluster is overloaded. Which tool addresses that?",
    options: [
      { text: "Lower every tenant's rate limit until search recovers.", isCorrect: false, explanation: "Per-tenant limits protect fairness. They cannot react to the backend's actual health and punish tenants who did nothing wrong." },
      { text: "Load shedding or a concurrency limit based on the service's own health.", isCorrect: true, explanation: "Overload protection is a separate mechanism: shed low-priority work when the service is saturated, whoever sends it. Stripe runs load shedders alongside its rate limiters." },
      { text: "A larger token bucket burst so requests finish sooner.", isCorrect: false, explanation: "A larger burst admits more requests at once, which makes an overloaded service worse." },
    ],
  },
];

/** Sections 06–12 of the blueprint; sections 01–05 are content/blueprints/rate-limiting.mdx. */
export const blueprint: BlueprintTail = {
  runbook: {
    steps: [
      "Find the caller: group requests and 429s by API key. One key with a huge request rate and a high rejection rate is a runaway client; many keys at once is a traffic event or a limiter bug.",
      "Check that rejections are cheap: 429 latency should be a few milliseconds and should not reach backend services.",
      "If a client is overwhelming the gateway itself, block or lower that key's limit temporarily and contact the customer; a tight retry loop ignores Retry-After.",
      "If the limiter store is slow or down, confirm gateways switched to the bounded local fallback rather than failing closed, and watch its alert.",
      "If backends are overloaded while every tenant is within limits, this is not a rate limiting problem: shed load or cap concurrency at the service.",
      "Afterwards, check the plan: was the burst sized for real client behaviour, and does the documented limit match what clients see?",
    ],
  },
  tradeoffs: [
    {
      caption: "Choosing a limiting algorithm",
      headers: ["Algorithm", "Benefit", "Cost"],
      rows: [
        ["Fixed window", "One atomic INCR; easy to explain", "Up to 2× the limit around each reset"],
        ["Sliding window log", "Exact", "Stores every timestamp; memory grows with the limit"],
        ["Sliding window counter", "Near-exact with two counters", "Approximate; assumes even traffic in the previous window"],
        ["Token bucket", "Explicit rate and burst; cheap state", "Needs an atomic refill-and-spend (script)"],
      ],
    },
    {
      caption: "Where and how to enforce",
      headers: ["Decision", "Benefit", "Cost"],
      rows: [
        ["Central store (Redis)", "One correct count across the fleet", "A network round trip and a dependency on every request"],
        ["Local buckets per gateway", "No network, no dependency", "Approximate; must be divided by the fleet size"],
        ["Fail open", "Limiter trouble never becomes an outage", "No protection while it lasts"],
        ["Fail closed", "Limits always hold", "Limiter trouble becomes a full outage"],
      ],
    },
  ],
  failures: [
    { title: "Limiter store becomes the bottleneck", explanation: "Every request now calls Redis. If Redis slows down, every API call slows down with it, even for clients far below their limit.", signal: "Gateway latency tracks Redis latency; limiter timeouts", response: "Tight timeout and local fallback; shard buckets across Redis nodes by key" },
    { title: "Hot key in the limiter", explanation: "The runaway client's bucket gets thousands of calls per second, all on one Redis node, which slows that node for every other tenant stored on it.", signal: "One Redis shard much busier than the rest", response: "Put a local pre-check in front for keys already far over limit; block abusive keys at the edge" },
    { title: "Clients retry 429s immediately", explanation: "A client ignores Retry-After and retries in a loop, so rejections multiply instead of slowing it down. The gateway spends its capacity saying no.", signal: "Rejections per key far above the limit; cost of 429s rising", response: "Keep 429s cheap; escalate to a temporary block; publish client guidance with backoff and jitter" },
    { title: "Clock skew between gateways", explanation: "If each gateway passes its own clock into the bucket, one running ahead refills tokens early and one running behind can make elapsed time negative.", signal: "Clients allowed slightly more or less than the plan, varying by gateway", response: "Use the store's clock (Redis TIME) or clamp elapsed time to zero or more" },
    { title: "Limit keyed by the wrong identity", explanation: "Limiting by IP address lumps everyone behind one corporate proxy together, while one attacker with many addresses escapes it. The limit then punishes the wrong people.", signal: "Many legitimate users rejected from a few IPs; abuse spread across many IPs", response: "Key by API key or account; use IP only for unauthenticated traffic, with higher limits" },
  ],
  scale: {
    paragraphs: ["With ten times the tenants and traffic, the limiter itself needs capacity planning:"],
    items: [
      "One Redis node cannot take every decision; shard buckets by API key across a cluster, which keeps each bucket on one node and its script atomic.",
      "Round trips add up: layer a local bucket in front for coarse limits and send only the remaining decisions to the shared store, the split Envoy's docs describe.",
      "Plans multiply: per-endpoint, per-tenant, and per-organisation limits need a policy service rather than constants in gateway config.",
      "Multiple regions each have their own store; either give each region a share of the limit or accept that a client spread across regions gets slightly more.",
    ],
  },
  interview: {
    answer: `A rate limit is a fairness policy: it stops one client from spending capacity that belongs to others. I would express each limit as a rate and a burst and enforce it with a token bucket per API key.

The bucket lives in Redis, and a Lua script refills it from the elapsed time, checks it, and spends a token in one atomic step, so 30 gateways cannot race. That avoids the fixed window's double burst at every boundary and the per-gateway multiplication you get from local counters.

Over-limit requests get a cheap 429 with Retry-After and remaining-quota headers. The Redis call has a timeout of a few milliseconds, and if Redis is unavailable each gateway falls back to a local bucket with the limit divided by the gateway count, so a limiter outage never becomes an API outage. Overload of the backend itself is a separate problem, handled by load shedding.`,
    levels: [
      { title: "Mid-level", description: "Implement a correct limit and explain the common algorithms.", items: ["Explain the fixed window boundary burst", "Implement a token bucket and explain rate versus burst", "Return 429 with Retry-After"] },
      { title: "Senior", description: "Enforce one limit across a fleet and decide failure behaviour.", items: ["Make check-and-spend atomic across gateways", "Choose fail-open with a bounded local fallback, with timeouts", "Separate rate limiting from load shedding and concurrency limits"] },
      { title: "Staff", description: "Treat limits as product policy and the limiter as infrastructure.", items: ["Design plan tiers, per-endpoint costs, and how limits are communicated", "Plan the limiter's own capacity, sharding, and multi-region behaviour", "Align client SDK retry behaviour with server limits"] },
    ],
    wrongAnswers: [
      { question: "Why not count requests per minute with INCR?", explanation: "INCR is atomic, which fixes races, but the window resets at :00. A client can spend two minutes' allowance in two seconds around every boundary." },
      { question: "Why not keep counters in each gateway's memory?", explanation: "The load balancer spreads a client across every gateway and each grants the full limit, so the real limit is the plan times the fleet size, and it changes on every scale event." },
      { question: "Why not reject everything when the limiter is unavailable?", explanation: "Failing closed makes the limiter a single point of failure for the whole API. For fairness limits, fail open with a bounded local fallback instead." },
    ],
    traps: [
      "Calling rate limiting 'protecting the backend' and stopping there; overload needs load shedding as well.",
      "A read-then-write counter that loses updates under concurrency.",
      "429s that still run authentication, logging, and database work, so rejecting is as expensive as serving.",
      "A burst sized at the full minute's limit, which defeats the point of a rate.",
    ],
  },
  followUps: [
    ["How do you rate limit expensive endpoints differently?", "Give requests a cost: a search might spend 5 tokens and a lookup 1, from the same bucket. The plan then limits work rather than calls, and one bucket per key still covers every endpoint."],
    ["How does a client SDK cooperate?", "Read RateLimit headers and slow down before hitting zero, honour Retry-After exactly, and use exponential backoff with jitter when no header is present. Without that, rejected clients retry in a loop."],
    ["Should a request over the limit wait instead of being rejected?", "Only with a short, bounded queue. Holding requests ties up connections at the gateway, so for a public API a fast 429 is usually kinder to everyone, including the client that can schedule its retry."],
    ["How is a concurrency limit different from a rate limit?", "A rate limit counts requests started per second; a concurrency limit counts requests in progress. One slow endpoint can exhaust capacity at a low rate, which only a concurrency limit catches. Stripe runs both."],
  ],
  quiz: { title: "Rate limiting", questions: judgmentQuiz, href: "/topics/traffic/rate-limit-api/quiz" },
  related: ["retry-storm", "flash-sale", "cache-stampede", "connection-pool"],
};
