import type { TopicId } from "./catalog";
import type { PracticeNote } from "@/components/InPractice";

/* Sourced industry practice for each data-driven blueprint, shown after the named section.
   Every point must be traceable to the listed primary source. */
export const blueprintPractice: Partial<Record<TopicId, PracticeNote & { sectionId: string }>> = {
  "idempotent-api": {
    sectionId: "architecture",
    title: "Stripe's published idempotency contract (API v1)",
    points: [
      "Keys are up to 255 characters. Stripe suggests V4 UUIDs or another high-entropy random string, and never personal data such as an email address.",
      "The status code and body of the first request are saved once the endpoint starts executing. A retry with the same key returns that saved result, including a 500 error.",
      "Reusing a key with different parameters returns an error instead of a stored result.",
      "A request that fails validation or collides with one still executing is not saved, so it can be retried.",
      "Keys can be pruned once they are at least 24 hours old. A key reused after pruning creates a new request, so your own retry window must end before that.",
    ],
    sources: [["Stripe API: Idempotent requests", "https://docs.stripe.com/api/idempotent_requests"]],
  },
  "poison-messages": {
    sectionId: "architecture",
    title: "How brokers and teams build the quarantine path",
    points: [
      "Amazon SQS: a redrive policy moves a message to a dead-letter queue after it has been received `maxReceiveCount` times.",
      "RabbitMQ: a rejected message (requeue false), an expired TTL, an overflowed queue, or a quorum-queue delivery limit sends it to a dead-letter exchange, configured preferably by policy.",
      "Kafka consumers have no built-in dead-letter queue. Uber's published design chains retry topics with growing delays, ends in a dead-letter topic, and can merge dead letters back into the first retry topic after a fix.",
      "Kafka Connect sink connectors can route bad records to a dead-letter topic with `errors.tolerance=all` and `errors.deadletterqueue.topic.name`. Source connectors have no dead-letter queue.",
    ],
    sources: [
      ["Uber Engineering: Reliable reprocessing", "https://www.uber.com/US/en/blog/reliable-reprocessing/"],
      ["RabbitMQ: Dead letter exchanges", "https://www.rabbitmq.com/docs/dlx"],
      ["Confluent: Kafka Connect error handling", "https://www.confluent.io/blog/kafka-connect-deep-dive-error-handling-dead-letter-queues/"],
    ],
  },
  "retry-storm": {
    sectionId: "mental-model",
    title: "Google SRE's retry defaults",
    points: [
      "Per request: at most three attempts. After the third failure, the error goes back to the caller.",
      "Per client: retry only while retries stay below 10% of that client's requests, so retries cannot multiply the load on a struggling backend.",
      "Client-side adaptive throttling: each client counts requests and accepted requests over two minutes. Once requests exceed K × accepts (K = 2 is the usual choice), the client starts rejecting some requests locally, without sending them.",
    ],
    sources: [["Google SRE book: Handling Overload", "https://sre.google/sre-book/handling-overload/"]],
  },
  "connection-pool": {
    sectionId: "naive",
    title: "A starting number, not a rule",
    points: [
      "HikariCP's pool-sizing guide quotes a formula from the PostgreSQL project: `connections = (core_count × 2) + effective_spindle_count`.",
      "It counts the database server's physical cores, not hyperthreads. The spindle count is zero when the active data set is fully cached.",
      "The guide's example is a 4-core server with one disk: (4 × 2) + 1 = 9, rounded to 10. That is the total the database can usefully run at once, shared by every replica's pool.",
      "Treat the result as a starting point and load-test around it. The guide itself says sizing is specific to each deployment.",
    ],
    sources: [["HikariCP wiki: About Pool Sizing", "https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing"]],
  },
  "schema-evolution": {
    sectionId: "architecture",
    title: "Where the pattern comes from, and the locks to watch",
    points: [
      "Expand, migrate, contract is the Parallel Change pattern, described by Danilo Sato on martinfowler.com in 2014.",
      "Set `lock_timeout` to a few seconds before each DDL statement. An `ALTER TABLE` waiting for its lock blocks every later query on that table; failing fast and retrying is safer than queueing.",
      "In PostgreSQL, add foreign-key, check, and not-null constraints as `NOT VALID`, then run `VALIDATE CONSTRAINT` separately. Validation takes only a `SHARE UPDATE EXCLUSIVE` lock, so writes continue.",
      "MySQL teams often run large table changes with online schema-change tools such as GitHub's gh-ost, which copy the table in the background and swap it in.",
    ],
    sources: [
      ["Danilo Sato: Parallel Change", "https://martinfowler.com/bliki/ParallelChange.html"],
      ["PostgreSQL: ALTER TABLE", "https://www.postgresql.org/docs/current/sql-altertable.html"],
      ["GitHub: gh-ost", "https://github.com/github/gh-ost"],
    ],
  },
};
