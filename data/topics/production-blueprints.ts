import { productionCatalog } from "./production-catalog";
import type { QuizQuestion } from "@/components/JudgmentQuiz";
import type { TopicId } from "./catalog";
import type { LevelData, TopicMeta } from "@/data/types";

export type ProductionBlueprint = {
 id: TopicId; href: `/topics/${string}/${string}`; prompt: string; meta: TopicMeta; shortTitle: string; flow: string[]; diagramCaption: string;
 sections: { id: string; title: string; paragraphs: string[] }[]; runbook: string[]; tradeoffs: string[][]; extraTables?: { caption: string; headers: string[]; rows: string[][] }[]; failures: string[][]; interview: string; levels: LevelData[]; wrongAnswers: { question: string; explanation: string }[]; followups: string[][]; related: TopicId[]; conceptCheck?: QuizQuestion; sources: string[][]; questions: QuizQuestion[];
};

const blueprintContent: Omit<ProductionBlueprint, "meta" | "href" | "prompt">[] = [
  {
    "id": "idempotent-api",
    "shortTitle": "Retry a payment without charging twice",
    "flow": [
      "Client: one payment key",
      "API: durable intent + request hash",
      "Provider: same stable key",
      "Reconciler: resolve unknown result",
      "API: replay stored outcome"
    ],
    "diagramCaption": "The provider call is outside the local database transaction. A timeout leaves an unresolved intent; it does not prove the provider rejected the payment.",
    "sections": [
      {
        "id": "problem",
        "title": "One timeout, two possible realities",
        "paragraphs": [
          "An order costs ₹2,000. Your API asks the payment provider to charge it. The provider accepts the charge, but the response disappears on the way back. Your client sees a timeout and presses Pay again. From the client’s perspective this is a retry; from the provider’s perspective it could be a second payment.",
          "The requirement is one charge per payment intent, even when clients retry, requests arrive concurrently, or a worker crashes. A customer can intentionally buy twice, so deduplicating by customer and amount is wrong. We need an identity for this specific business operation, not for a similar-looking payload."
        ]
      },
      {
        "id": "naive",
        "title": "Why checking for an existing payment is insufficient",
        "paragraphs": [
          "Two API replicas can both query the database, find no payment, and call the provider. A check followed by an insert is not an atomic claim. Disabling the button only protects one browser tab. A local mutex only protects one process.",
          "Putting the provider call inside a SQL transaction does not make the remote charge roll back with the database. It also holds a connection while waiting for the network. The difficult boundary remains: a provider may commit while your process cannot record the answer."
        ]
      },
      {
        "id": "mental-model",
        "title": "Separate the identity from the outcome",
        "paragraphs": [
          "An idempotency key names one attempt to achieve a business effect. Repeating the same intent with the same key must not create another effect. Scope the key to the authenticated account and operation. Persist a canonical request fingerprint, status, provider reference, and replayable result under a unique constraint.",
          "Use explicit states such as pending, succeeded, definitively_failed, and unknown. A timeout is unknown, not definitively_failed. Return a conflict when a caller reuses the same key with a different amount or currency. Authenticate every lookup; possession of a key is not authorization to see a payment."
        ]
      },
      {
        "id": "architecture",
        "title": "Claim locally, deduplicate remotely",
        "paragraphs": [
          "First insert the payment intent in a short database transaction. The unique key selects one owner; concurrent callers find the existing intent and receive its stored result or an in-progress response. Commit before making the provider call. Send a stable provider idempotency key derived from the durable intent, so crash recovery uses the same identity.",
          "On a confirmed result, update the intent and order together. Use an outbox if another service must receive an event. When the result is ambiguous, reconciliation queries the provider by reference or safely repeats the same keyed operation under the provider’s contract. If the provider offers neither deduplication nor lookup, local records alone cannot guarantee one remote charge."
        ]
      },
      {
        "id": "worked-example",
        "title": "Walk the crash window",
        "paragraphs": [
          "At t=0, request K creates intent P. At t=1, the provider accepts K and creates charge C. At t=2, your worker crashes before saving C. At t=3, another request arrives with K. It must not create a new intent or choose a fresh provider key. A recovery worker takes responsibility for P and resolves K with the provider.",
          "If the original worker resumes after its lease expires, both workers may still contact the provider. A lease reduces duplicated work; provider deduplication protects the effect. Conditional local updates prevent a stale worker from overwriting a confirmed terminal result. A signed webhook can resolve P too, but webhook deliveries need deduplication and must agree with the expected amount and account."
        ]
      },
      {
        "id": "scale",
        "title": "What breaks at ten times the volume?",
        "paragraphs": [
          "The intent table becomes a retention and lookup workload. Index by scoped key and maintain an index for unresolved intents. Monitor unresolved age, provider lookup failures, key conflicts, and reconciliation throughput. Avoid a full-table scan every minute.",
          "Key expiry is a business decision: deleting the record can turn a late retry into a new charge. Align client retry windows, provider retention, and local retention. After the provider’s safe retry window closes, use lookup or manual reconciliation rather than blindly submitting again. Multi-region active writers also need a single authoritative claim or equivalent globally coordinated uniqueness."
        ]
      }
    ],
    "runbook": [
      "Preserve the original intent and provider key when a timeout occurs; show pending status instead of declaring failure.",
      "Inspect provider references, signed webhooks, and unresolved age. Reconcile through lookup or the same key within its supported window.",
      "Persist the confirmed result and order transition atomically. Emit downstream work through an outbox.",
      "Alert on old unknown intents and route irreducible ambiguity to an owned reconciliation workflow."
    ],
    "tradeoffs": [
      [
        "Store full responses",
        "Reliable replay costs storage and requires careful handling of sensitive payment data."
      ],
      [
        "Wait or return pending",
        "Waiting simplifies the client but consumes request time; pending responses require status polling or notifications."
      ],
      [
        "Keep records longer",
        "Longer retention protects late retries but increases data and operational costs."
      ],
      [
        "Scope keys per account",
        "Prevents one caller from colliding with or reading another caller's result, but requires an authenticated identity on every request."
      ],
      [
        "Reconcile automatically",
        "Resolves most unknown outcomes without people, but needs provider lookup APIs, rate limits, and an owned queue for the cases it cannot resolve."
      ]
    ],
    "failures": [
      [
        "Same key, different payload",
        "Reject the mismatch. Silently returning an unrelated result conceals a caller bug.",
        "A client reuses a payment key but changes the amount or currency. If you return the stored result, the client believes the new payment went through when it never ran."
      ],
      [
        "Crash after remote success",
        "Recover the persisted intent with the same provider identity. Never infer failure from silence.",
        "The provider charges the card, then your server crashes before saving the result. Your records say pending while the money has already moved."
      ],
      [
        "Provider retention expired",
        "Stop blind resubmission; resolve through durable references or manual review.",
        "The provider only remembers payment keys for a limited time. A retry after that window looks like a brand-new payment and can charge the customer again."
      ],
      [
        "Stale worker overwrites a result",
        "A worker whose lease expired reports an old timeout after recovery confirmed success. Only allow pending-to-terminal transitions with a conditional update.",
        "Two workers end up handling the same payment. The slow one finishes last and writes its old timeout over the success the other one confirmed."
      ],
      [
        "Duplicate or forged webhook",
        "Verify the signature, deduplicate by provider event ID, and check amount and account against the intent before changing its state.",
        "Providers can send the same webhook more than once, and attackers can send fake ones. Acting on every webhook can change a payment twice, or on false information."
      ]
    ],
    "interview": "I would name the business intent before calling the provider, atomically claim that key locally, and reuse the same provider key across recovery. Unknown outcomes remain pending until reconciliation. This provides an effectively single business effect only within the provider’s deduplication and retention contract.",
    "levels": [
      {
        "title": "Mid-level",
        "description": "Explain why a timeout is ambiguous and why a unique constraint beats check-then-insert.",
        "items": [
          "Treat a timeout as an unknown outcome, not a failure",
          "Use a client-supplied key for one payment intent",
          "Claim the key with a unique constraint instead of a prior read"
        ]
      },
      {
        "title": "Senior",
        "description": "Design concurrent request handling, request fingerprints, terminal-state updates, and recovery.",
        "items": [
          "Reject a reused key whose request body differs",
          "Return the stored outcome to concurrent and late retries",
          "Pass the same key to the provider and reconcile unknown results"
        ]
      },
      {
        "title": "Staff",
        "description": "Define provider contracts, retention windows, regional ownership, auditability, and reconciliation operations.",
        "items": [
          "Set key retention longer than the longest client retry window",
          "Assign one region to own each payment intent",
          "Make reconciliation and audit trails an operated, alerted process"
        ]
      }
    ],
    "wrongAnswers": [
      {"question": "Why not deduplicate by customer, amount, and a short time window?", "explanation": "That rule guesses intent from a similar-looking payload. A customer who deliberately buys the same item twice gets one order rejected, and a retry that arrives after the window closes is charged again. Identity has to come from the operation itself: one key per payment intent, sent by the caller."},
      {"question": "Why not check whether a payment exists before inserting it?", "explanation": "Two replicas can run the check at the same moment, both find nothing, and both call the provider. A read followed by a write is not a claim. The unique constraint on the scoped key is what picks one owner; the second insert fails and that caller reads the existing intent instead."},
      {"question": "Why not wrap the provider call in the database transaction so a failure rolls everything back?", "explanation": "The database can roll back its own rows, not a charge the provider has already made. The transaction also holds a connection and its locks for the length of a network call. Commit the intent first, then call the provider with a stable key, and treat a timeout as unknown until reconciliation settles it."}
    ],
    "followups": [
      ["What should a caller see while the first request is still running?", "A stable in-progress answer, such as 409 Conflict or 202 Accepted with the intent ID and a status URL. The second request must not start another provider call; the caller polls or waits for a notification."],
      ["How do refunds receive independent identities?", "A refund is its own business intent with its own key, scoped to the original payment. Reusing the payment's key would replay the charge result, and minting a fresh key on every refund retry could refund twice."],
      ["What evidence permits deleting an idempotency record?", "The intent is terminal, both the client's retry window and the provider's deduplication window have passed, and the outcome is preserved elsewhere, such as the ledger or order history. Before that, deletion turns a late retry into a new charge."]
    ],
    "related": [
      "flash-sale",
      "transactional-outbox",
      "retry-storm"
    ],
    "sources": [
      [
        "AWS: Making retries safe with idempotent APIs",
        "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/"
      ],
      [
        "Stripe API: Idempotent requests",
        "https://docs.stripe.com/api/idempotent_requests"
      ],
      [
        "IETF draft: The Idempotency-Key HTTP header field",
        "https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/"
      ]
    ],
    "conceptCheck": {
      "scenario": "Recovery confirmed charge C and marked intent P succeeded. Then the original worker, whose lease had expired, wakes up with a timeout from its earlier call and tries to set P to unknown. What should happen?",
      "options": [
        {
          "text": "The update is applied, because the most recent write reflects the latest information",
          "explanation": "The latest write to arrive is not the latest truth. Overwriting a confirmed result would reopen a settled payment and could trigger another charge.",
          "isCorrect": false
        },
        {
          "text": "The update is rejected: it only applies while P is still pending, so P stays succeeded",
          "explanation": "A conditional transition such as UPDATE ... WHERE status = 'pending' affects zero rows. Terminal states never move backwards; log the stale response for investigation.",
          "isCorrect": true
        },
        {
          "text": "The worker charges again with a fresh key to get a definitive answer",
          "explanation": "A fresh key gives the provider no way to deduplicate, so this creates the duplicate charge the design exists to prevent.",
          "isCorrect": false
        }
      ]
    },
    "questions": [
      {
        "scenario": "The provider times out after a charge request. What status should you record?",
        "options": [
          {
            "text": "Unknown, pending reconciliation",
            "explanation": "A missing response cannot distinguish rejection from committed success.",
            "isCorrect": true
          },
          {
            "text": "Failed; submit a new payment",
            "explanation": "A new identity can create a second charge.",
            "isCorrect": false
          },
          {
            "text": "Succeeded immediately",
            "explanation": "A timeout is not evidence that the provider accepted the charge.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "Two replicas receive the same payment key concurrently. What chooses the owner?",
        "options": [
          {
            "text": "A read before writing",
            "explanation": "Both reads can observe absence.",
            "isCorrect": false
          },
          {
            "text": "Disable the browser button",
            "explanation": "Other clients and concurrent network retries bypass it.",
            "isCorrect": false
          },
          {
            "text": "A database unique constraint on the scoped key",
            "explanation": "The claim is atomic across replicas.",
            "isCorrect": true
          }
        ]
      },
      {
        "scenario": "A caller reuses a key with a different currency. What should happen?",
        "options": [
          {
            "text": "Charge again with the same local key",
            "explanation": "This breaks the key’s one-intent contract.",
            "isCorrect": false
          },
          {
            "text": "Reject the payload mismatch",
            "explanation": "One key must name one intent; compare the stored fingerprint.",
            "isCorrect": true
          },
          {
            "text": "Return the previous result silently",
            "explanation": "This conceals a materially different request.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "A worker crashes after provider success but before saving it locally. How do you recover?",
        "options": [
          {
            "text": "Resolve the existing intent using its original provider key or reference",
            "explanation": "Recovery must preserve remote identity.",
            "isCorrect": true
          },
          {
            "text": "Generate a new key",
            "explanation": "A new key may authorize another charge.",
            "isCorrect": false
          },
          {
            "text": "Delete the pending row",
            "explanation": "Deleting the record loses the evidence needed for safe recovery.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "An unresolved intent is older than the provider’s deduplication window. What next?",
        "options": [
          {
            "text": "Retry because the key string is unchanged",
            "explanation": "The provider may have expired its deduplication record.",
            "isCorrect": false
          },
          {
            "text": "Assume the charge failed",
            "explanation": "Age alone does not establish the outcome.",
            "isCorrect": false
          },
          {
            "text": "Use durable lookup or manual reconciliation before another submission",
            "explanation": "The old key may no longer protect a new remote call.",
            "isCorrect": true
          }
        ]
      }
    ]
  },
  {
    "id": "poison-messages",
    "shortTitle": "Keep a poison message from blocking the queue",
    "flow": [
      "Queue: durable event ID",
      "Consumer: validate + classify",
      "Transient: bounded delayed retry",
      "Permanent: durable quarantine",
      "Replayer: repair + rate limit"
    ],
    "diagramCaption": "Retry and quarantine are alternative outcomes, not sequential processing stages. Acknowledge only after a durable effect or confirmed durable handoff.",
    "sections": [
      {
        "id": "problem",
        "title": "One malformed event holds up an order stream",
        "paragraphs": [
          "An order consumer receives event 41 containing an unsupported currency value. Its handler throws, the message becomes available again, and the same exception repeats. Healthy events accumulate behind it. Adding workers increases errors but does not make this payload valid.",
          "Your goals are to keep independent orders moving, retain the failed event for repair, and avoid applying an order transition out of sequence. These goals can conflict. A dead-letter queue, or DLQ, is a durable holding area for failures that need attention; moving a message there does not mean its business work is complete."
        ]
      },
      {
        "id": "naive",
        "title": "Why infinite retry and silent skipping both fail",
        "paragraphs": [
          "Retry helps when a database is briefly unavailable. It does not fix invalid data, missing required fields, or a handler that cannot read the event version. Immediate retries spend consumer capacity on work that cannot succeed. Logging and acknowledging the message restores throughput by losing the business operation.",
          "A broad exception handler that acknowledges every error is particularly dangerous: the queue looks healthy while orders stop advancing. A DLQ without an owner and replay procedure creates the same outcome more slowly. Queue depth alone cannot tell you whether the application completed its obligations."
        ]
      },
      {
        "id": "mental-model",
        "title": "Classify failure before choosing recovery",
        "paragraphs": [
          "Distinguish transient dependency failures from permanent payload failures and unknown application defects. Retry transient failures with delay and a bounded attempt or age budget. Quarantine invalid payloads early with the original event, event ID, schema version, error reason, attempt count, and timestamps.",
          "A consumer must also tolerate duplicates. If the effect commits and the process dies before acknowledging, the broker can deliver the event again. Store the processed event ID and business update in the same local transaction, or use an equivalent idempotent state transition. External side effects need their own durable intent and deduplication contract."
        ]
      },
      {
        "id": "architecture",
        "title": "Make every acknowledgement defensible",
        "paragraphs": [
          "The success path validates, applies the business effect durably, and then acknowledges. The transient-failure path uses broker-supported delayed redelivery or a durable retry mechanism. The permanent-failure path confirms a durable quarantine handoff before acknowledging the source. If that publish fails, leave the source unacknowledged.",
          "This handoff can duplicate messages if the process crashes after publishing to quarantine but before acknowledging. Preserve the event ID so the quarantine store and replay path can deduplicate. Broker-managed DLQ semantics vary; verify receive counts, retention, visibility timeouts, and delivery guarantees for your broker."
        ]
      },
      {
        "id": "worked-example",
        "title": "Ordering changes the answer",
        "paragraphs": [
          "Suppose event 41 reserves an order and event 42 ships it. If 41 is quarantined and 42 proceeds, the consumer may attempt to ship an unreserved order. For strict per-order transitions, pause or quarantine that order’s stream until repair, while allowing unrelated order IDs to continue.",
          "For independent email notifications, skipping the failed notification into quarantine may be acceptable. Decide ordering at the business aggregate, such as one order, rather than freezing every customer’s work. Moving an event to a DLQ preserves evidence but can break the original processing order; replay is not automatically a return to its old position."
        ]
      },
      {
        "id": "scale",
        "title": "What breaks when the queue is ten times larger?",
        "paragraphs": [
          "A dependency outage can push thousands of healthy messages past the same retry threshold. Distinguish a system-wide outage from isolated bad data before filling quarantine. Reduce intake or pause consumers when the dependency is unavailable, and watch oldest unprocessed age alongside throughput.",
          "Replay must compete fairly with live traffic. Start with a small inspected sample, retain stable event IDs, cap replay rate, and stop if errors rise. Track unresolved business work and quarantine age, not just DLQ count. Provision retention long enough for detection, repair, and replay; expired messages cannot be recovered by an excellent runbook."
        ]
      }
    ],
    "runbook": [
      "Inspect a sample and determine whether the failure is isolated data, a handler regression, or a dependency outage.",
      "Stop hot-loop retries. Apply bounded delayed retry or durable quarantine, preserving event IDs and diagnostic context.",
      "Decide whether subsequent events for the same order must pause; continue independent groups where safe.",
      "Repair the handler or data, replay a canary batch at a controlled rate, verify business state, then drain gradually."
    ],
    "tradeoffs": [
      [
        "Quarantine early",
        "Protects throughput but requires reliable diagnosis and repair ownership."
      ],
      [
        "Preserve strict order",
        "Protects state transitions but blocks the affected group until recovery."
      ],
      [
        "Retry longer",
        "Absorbs longer transient outages but delays detection of permanently broken work."
      ]
    ],
    "failures": [
      [
        "Quarantine publish fails",
        "Do not acknowledge the source until the handoff is durable.",
        "You try to move a bad message to quarantine, but that write fails. If you acknowledge the original anyway, the message is gone from both places."
      ],
      [
        "Replay duplicates an effect",
        "Preserve IDs and atomically deduplicate with the business mutation.",
        "After fixing a bad message you replay it, but part of its work already happened before it failed. Running it again repeats that work, such as sending an email twice."
      ],
      [
        "All messages fail together",
        "Treat a dependency outage or deployment regression before classifying every payload as poison.",
        "A database or downstream service goes down, so every message fails at once. It looks like a flood of bad messages, but the messages are fine and the dependency is the problem."
      ]
    ],
    "interview": "I would classify the failure, bound retry effort, and quarantine permanent failures durably before acknowledgement. I would preserve event identity, protect per-order invariants, and assign an owner to controlled replay. Moving a message to a DLQ is an operational state, not business success.",
    "levels": [
      {
        "title": "Mid-level",
        "description": "Distinguish retryable failures from invalid messages and explain acknowledgement timing.",
        "items": [
          "Separate transient errors from messages that can never succeed",
          "Acknowledge only after the effect is durable",
          "Bound retries instead of retrying forever"
        ]
      },
      {
        "title": "Senior",
        "description": "Design durable handoff, duplicate handling, group ordering, and replay limits.",
        "items": [
          "Move poison messages to a dead-letter queue with their failure reason",
          "Make the consumer idempotent so redelivery is harmless",
          "Decide what happens to later messages for the same key"
        ]
      },
      {
        "title": "Staff",
        "description": "Set ownership, retention, audit requirements, and outage policies across producer and consumer teams.",
        "items": [
          "Assign who triages and replays dead-lettered messages",
          "Set retention so replay is still possible after an incident",
          "Agree contract and schema rules with producer teams"
        ]
      }
    ],
    "wrongAnswers": [
      {"question": "Why not add consumers until the backlog clears?", "explanation": "The message that blocks the stream fails because of its content, not because capacity is short. More consumers fetch the same invalid event more often and raise the error rate. Classify the failure first: capacity helps a slow dependency, but only quarantine and repair move an invalid payload."},
      {"question": "Why not catch every exception, log it, and acknowledge the message?", "explanation": "Throughput recovers and the queue looks healthy, but the business operation is gone. Nothing records which orders stopped advancing, and the log line is not a replayable copy of the event. Acknowledge only after the effect is durable or after a confirmed handoff to quarantine."},
      {"question": "Why not move the failed event to the DLQ and let the next event for that order continue?", "explanation": "That is right for independent work such as notifications and wrong for ordered state. If event 41 reserves stock and event 42 ships, letting 42 run ships an unreserved order. Pause or quarantine that one order's stream until 41 is repaired, and keep unrelated orders moving."}
    ],
    "followups": [
      ["Can an invalid event be repaired without changing its business identity?", "Yes, if the repair keeps the original event ID and records what changed and who approved it. Consumers deduplicate the replay by that ID. Minting a new ID turns the repair into a second event."],
      ["What happens if the quarantine destination is unavailable?", "The consumer must not acknowledge the message. Pause or slow that partition and alert: quarantine is a durable write that has to succeed before the acknowledgement, or the evidence is lost."],
      ["How do you prove replay restored the missing business state?", "Reconcile against the source of truth. Count and checksum the affected business keys before and after replay, and confirm downstream state such as orders or balances matches. A replay that finished without errors only proves messages were processed."]
    ],
    "related": [
      "transactional-outbox",
      "retry-storm",
      "idempotent-api"
    ],
    "sources": [
      [
        "Amazon SQS: Dead-letter queues",
        "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html"
      ],
      [
        "Amazon SQS: FIFO delivery logic",
        "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues-understanding-logic.html"
      ]
    ],
    "questions": [
      {
        "scenario": "An event always fails validation because its required amount is missing. What next?",
        "options": [
          {
            "text": "Quarantine it durably with its failure reason",
            "explanation": "Retry cannot supply a missing field; retain evidence for repair.",
            "isCorrect": true
          },
          {
            "text": "Retry immediately forever",
            "explanation": "This consumes capacity without changing the input.",
            "isCorrect": false
          },
          {
            "text": "Acknowledge and discard it",
            "explanation": "This loses the business obligation.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "Publishing to quarantine failed. Should you acknowledge the original?",
        "options": [
          {
            "text": "Yes; the error is logged",
            "explanation": "Logs do not establish a durable recovery workflow.",
            "isCorrect": false
          },
          {
            "text": "Yes; a replay worker will find it",
            "explanation": "A replay worker cannot find an event that never reached quarantine.",
            "isCorrect": false
          },
          {
            "text": "No; retain the source until durable handoff succeeds",
            "explanation": "Acknowledging now could lose the only durable copy.",
            "isCorrect": true
          }
        ]
      },
      {
        "scenario": "Event 41 reserves stock; event 42 ships the same order. Event 41 is quarantined. What next?",
        "options": [
          {
            "text": "Stop all orders permanently",
            "explanation": "Independent order groups can continue safely.",
            "isCorrect": false
          },
          {
            "text": "Pause or guard this order’s subsequent transitions",
            "explanation": "Continuing blindly can violate the order state machine.",
            "isCorrect": true
          },
          {
            "text": "Ship anyway because a DLQ preserves ordering",
            "explanation": "Quarantine does not restore missing business state.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "A replay follows a crash after the business update committed. What prevents a duplicate effect?",
        "options": [
          {
            "text": "Deduplicate the stable event ID atomically with the business update",
            "explanation": "The acknowledgement gap can cause redelivery.",
            "isCorrect": true
          },
          {
            "text": "Assign a fresh event ID on every replay",
            "explanation": "This defeats deduplication.",
            "isCorrect": false
          },
          {
            "text": "Trust the receive count",
            "explanation": "Delivery count does not prove whether the business effect committed.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "Every event starts failing after the database becomes unavailable. What should you do first?",
        "options": [
          {
            "text": "Delete every failed message",
            "explanation": "The business work remains outstanding.",
            "isCorrect": false
          },
          {
            "text": "Double consumers without a limit",
            "explanation": "More concurrent failures can overload the recovering dependency.",
            "isCorrect": false
          },
          {
            "text": "Treat the shared outage and reduce processing pressure",
            "explanation": "A common dependency failure is not evidence that every payload is corrupt.",
            "isCorrect": true
          }
        ]
      }
    ]
  },
  {
    "id": "retry-storm",
    "shortTitle": "Stop retries from turning a slowdown into an outage",
    "flow": [
      "Caller: absolute deadline",
      "API: bounded concurrency",
      "One layer: retry budget",
      "Dependency: timed attempt",
      "Fallback or explicit rejection"
    ],
    "diagramCaption": "A failed attempt loops back only if it is safe, retryable, within deadline, and within budget. A circuit breaker can stop new attempts while a separate concurrency limit bounds work already in flight.",
    "sections": [
      {
        "id": "problem",
        "title": "A small slowdown consumes the whole service",
        "paragraphs": [
          "Your API normally makes one inventory call per request. The inventory service slows from 50 milliseconds to two seconds. Incoming traffic stays constant, but each request now occupies resources much longer. Threads, connection slots, and request memory accumulate before CPU necessarily reaches its limit.",
          "Clients retry the API, which retries inventory, whose SDK also retries. The dependency receives repeated work from the same original requests while trying to recover. The incident spreads from one slow service into unrelated API endpoints sharing the same resources."
        ]
      },
      {
        "id": "naive",
        "title": "Why more retries can reduce successful work",
        "paragraphs": [
          "Three layers allowing three total attempts each can generate up to 27 bottom-level calls per original operation in an all-fail case. That is an upper-bound teaching example; actual traffic depends on which layer fails, when attempts stop, and the available deadline.",
          "Increasing every timeout keeps more work in flight. Lowering them indiscriminately creates false failures and extra retries. Exponential backoff spreads attempts over time, but synchronized callers can still wake up together. Randomizing the delay, called jitter, reduces alignment; it does not create dependency capacity."
        ]
      },
      {
        "id": "mental-model",
        "title": "Budget time and work separately",
        "paragraphs": [
          "A deadline is the latest time a caller can use the result. Each downstream attempt must fit inside the remaining deadline, including connection setup, response time, and any delay before a retry. A retry budget caps additional work, for example through a token bucket replenished relative to successful or original traffic.",
          "A concurrency limit bounds outstanding calls. A circuit breaker temporarily rejects new calls after evidence of failure and later admits limited probes. A bulkhead isolates resources for one dependency or workload so that it cannot consume everything. These controls address different failure paths and need coordinated settings."
        ]
      },
      {
        "id": "architecture",
        "title": "Choose one retry owner",
        "paragraphs": [
          "Choose one layer with enough context to retry the operation. Disable or account for retries in lower SDKs and proxies. Retry only failures that may recover, only when the operation is safe to repeat, and only if sufficient time and retry tokens remain. A payment timeout still requires idempotency; reliability controls do not resolve an ambiguous charge.",
          "Combine bounded concurrency and bounded waiting with per-attempt timeouts. Propagate cancellation where supported and measure whether downstream work actually stops. When the limit is reached, reject promptly or use a truthful fallback: stale product details may be acceptable, but inventing a successful inventory reservation is not.",
          "SDKs often retry before your code sees an error. AWS SDKs retry by default. In standard mode they make up to three attempts in total and takes each retry from a retry quota, a token bucket that drains on retries and refills on successes. When the bucket is empty, the SDK returns the error instead of retrying. That is a retry budget built into the client. Count those attempts when you choose the retry owner, or set max attempts to 1 where another layer owns retries."
        ]
      },
      {
        "id": "worked-example",
        "title": "Calculate the pressure before changing settings",
        "paragraphs": [
          "At 200 requests per second and 50 milliseconds per call, a stable system averages roughly 10 calls in flight. At two seconds, the same arrival rate requires roughly 400. This is Little’s Law applied to a stable average, not a latency prediction for an overloaded queue. Once arrivals exceed service capacity, backlog grows instead of settling at a safe number.",
          "If inventory can support only 80 concurrent calls, admitting 400 does not help it. Enforce a limit, bound the waiting time, and reject excess requests with a clear overload response. Reserve a small probe allowance for recovery. Do not open every breaker client at once and then release all waiting requests when one probe succeeds."
        ]
      },
      {
        "id": "scale",
        "title": "What breaks at ten times the callers?",
        "paragraphs": [
          "A local retry budget or concurrency limit is multiplied by the number of replicas. Ten replicas with 80 slots can send 800 calls. Allocate a dependency-wide budget across callers, or use admission at the dependency with caller-specific fairness. Include background jobs and retries in that accounting.",
          "Observe original request rate, attempt rate, deadline expirations, rejected work, in-flight calls, and successful business operations. Recovery should ramp gradually. A low error rate after rejecting most traffic does not mean users recovered; evaluate completed work and user-visible latency together."
        ]
      }
    ],
    "runbook": [
      "Reduce retry amplification at the chosen owner; preserve safe retries for truly transient failures.",
      "Apply dependency-specific concurrency limits and short bounded queues. Shed excess work before shared resources fill.",
      "Use truthful degradation and limited probes while watching dependency latency and successful business work.",
      "Restore traffic gradually, then tune deadlines and retry budgets from measured latency and capacity."
    ],
    "tradeoffs": [
      [
        "Fail fast",
        "Protects the system but returns errors during brief recoverable disturbances."
      ],
      [
        "Serve stale data",
        "Maintains some availability but needs an explicit freshness contract."
      ],
      [
        "Isolate resources",
        "Limits blast radius but strands capacity and adds configuration work."
      ]
    ],
    "failures": [
      [
        "Retries in hidden layers",
        "Inventory SDK, proxy, API, and caller attempts multiply unless one owner accounts for them.",
        "The SDK, a proxy, your API, and the client all retry on their own. One user request quietly becomes dozens of calls to a service that is already struggling."
      ],
      [
        "Timeout without cancellation",
        "The caller may leave while the dependency continues spending resources.",
        "Your caller gives up and moves on, but the work it started keeps running downstream. The dependency spends its capacity on answers nobody will read."
      ],
      [
        "Breaker recovery surge",
        "Bound half-open probes and ramp traffic instead of releasing a synchronized flood.",
        "The circuit breaker sees the service recover and lets all the waiting traffic through at once. The sudden flood knocks the service over again."
      ]
    ],
    "interview": "I would first distinguish a slow dependency from extra original demand. I would cap concurrent work, select one retry owner, propagate deadlines, and admit retries only within a work budget and safe-operation contract. I would degrade honestly and restore traffic through limited recovery probes.",
    "levels": [
      {
        "title": "Mid-level",
        "description": "Explain how slow requests hold resources and why jitter reduces synchronization.",
        "items": [
          "Show how retries multiply load on a slow dependency",
          "Use exponential backoff with jitter",
          "Give every call a timeout shorter than the caller's"
        ]
      },
      {
        "title": "Senior",
        "description": "Combine deadlines, retry safety, budgets, concurrency limits, and recovery probes.",
        "items": [
          "Retry only idempotent operations",
          "Cap retries with a per-client retry budget",
          "Retry at one layer and propagate deadlines through the others"
        ]
      },
      {
        "title": "Staff",
        "description": "Allocate budgets across services and replicas, define degradation contracts, and test systemic recovery.",
        "items": [
          "Size budgets for the whole call graph, not one service",
          "Define what each caller gets when a dependency sheds load",
          "Rehearse recovery so a returning service is not stampeded"
        ]
      }
    ],
    "wrongAnswers": [
      {"question": "Why not raise every timeout so slow calls have time to finish?", "explanation": "Longer timeouts keep more work in flight while the dependency is already overloaded. At 200 requests per second, a two-second call holds about 400 requests at once instead of 10. Size each attempt to the remaining deadline and cap concurrency, so excess work is rejected quickly instead of piling up."},
      {"question": "Why not add exponential backoff with jitter and leave retries on at every layer?", "explanation": "Jitter spreads attempts over time but does not reduce how many there are. Three layers allowing three attempts each can still send up to 27 calls for one original request. Pick one retry owner, disable or account for retries below it, and cap extra attempts with a retry budget."},
      {"question": "Why not rely on a circuit breaker to protect the dependency?", "explanation": "A breaker stops new calls after it opens, but the slow calls already running keep holding threads and connections, and every replica has its own breaker. When probes succeed, a naive breaker releases all waiting work at once. Pair it with a concurrency limit and a gradual ramp on recovery."}
    ],
    "followups": [
      ["Who owns retries when an SDK retries internally?", "Choose one layer, usually the one closest to the failing dependency, and disable or cap retries everywhere else. Otherwise the layers multiply: three layers of three attempts can become 27 calls."],
      ["Can the dependency cancel work after the caller times out?", "Only if the deadline travels with the request, for example as a gRPC deadline or a deadline header, and the dependency checks it. Without that, the dependency keeps doing work nobody is waiting for, which is pure waste during overload."],
      ["How do you keep one tenant from consuming the recovery budget?", "Apply retry budgets and concurrency limits per tenant or tenant class, and shed load from the noisiest tenant first. A single global budget lets one tenant's retries crowd out everyone else."]
    ],
    "related": [
      "idempotent-api",
      "connection-pool",
      "poison-messages"
    ],
    "sources": [
      [
        "AWS SDKs and Tools: Retry behavior",
        "https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html"
      ],
      [
        "AWS: Timeouts, retries, and backoff with jitter",
        "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/"
      ]
    ],
    "questions": [
      {
        "scenario": "Three layers each permit three total attempts. What is the worst-case bottom-level attempt count?",
        "options": [
          {
            "text": "27 per original operation",
            "explanation": "Three nested attempt loops can multiply: 3 × 3 × 3.",
            "isCorrect": true
          },
          {
            "text": "9 per original operation",
            "explanation": "Adding or partly multiplying misses the nested third layer.",
            "isCorrect": false
          },
          {
            "text": "3 per original operation",
            "explanation": "This would require a single retry owner.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "A request has 100 ms remaining, but the next attempt needs up to 300 ms. What next?",
        "options": [
          {
            "text": "Reset the deadline for this attempt",
            "explanation": "This breaks the end-to-end time budget.",
            "isCorrect": false
          },
          {
            "text": "Queue it indefinitely",
            "explanation": "Waiting adds work whose result the caller may no longer use.",
            "isCorrect": false
          },
          {
            "text": "Stop and return the appropriate failure or fallback",
            "explanation": "The result cannot be expected within the caller’s usable deadline.",
            "isCorrect": true
          }
        ]
      },
      {
        "scenario": "Why add jitter to delayed retries?",
        "options": [
          {
            "text": "To increase dependency capacity",
            "explanation": "Randomness does not add serving resources.",
            "isCorrect": false
          },
          {
            "text": "To reduce clients retrying at the same instant",
            "explanation": "Randomized delay spreads synchronized attempt bursts.",
            "isCorrect": true
          },
          {
            "text": "To make duplicate payment effects impossible",
            "explanation": "Only an appropriate idempotency contract addresses that risk.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "A circuit breaker opens, but many slow calls are already running. What bounds those calls?",
        "options": [
          {
            "text": "Concurrency limits and effective timeouts or cancellation",
            "explanation": "A breaker stops new admissions; existing work needs separate bounds.",
            "isCorrect": true
          },
          {
            "text": "The breaker retroactively cancels everything",
            "explanation": "Opening a circuit alone does not cancel prior calls.",
            "isCorrect": false
          },
          {
            "text": "An unlimited queue",
            "explanation": "This increases resource usage and waiting.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "Ten replicas each permit 80 dependency calls. Is the shared dependency protected at 80?",
        "options": [
          {
            "text": "Yes; per-process limits are global",
            "explanation": "Independent processes do not share a counter automatically.",
            "isCorrect": false
          },
          {
            "text": "Yes, provided retries have jitter",
            "explanation": "Jitter does not enforce an aggregate concurrency limit.",
            "isCorrect": false
          },
          {
            "text": "No; the aggregate can reach 800 calls",
            "explanation": "Local limits must be allocated against the dependency-wide capacity.",
            "isCorrect": true
          }
        ]
      }
    ]
  },
  {
    "id": "connection-pool",
    "shortTitle": "Find the real cause of connection pool exhaustion",
    "flow": [
      "Request: acquisition deadline",
      "Replica: bounded local pool",
      "Database: shared connection budget",
      "Query or transaction: hold time",
      "Release: always return connection"
    ],
    "diagramCaption": "Every replica has its own pool. The database limit is shared across application replicas, workers, deployment overlap, and operational sessions.",
    "sections": [
      {
        "id": "problem",
        "title": "The application is waiting, not computing",
        "paragraphs": [
          "Requests slow down and logs show pool acquisition timeouts. CPU on the application is low, so autoscaling adds replicas. Each replica starts another connection pool. Soon the database refuses new sessions while existing requests continue waiting. More application capacity has increased competition for the same database.",
          "Separate acquiring a connection from executing a query. Acquisition time measures how long work waits for a pool slot. Query time measures database work after a slot is acquired. A connection leak, a lock wait, a slow query, and excess legitimate demand can produce similar application symptoms but require different repairs."
        ]
      },
      {
        "id": "naive",
        "title": "Why raising every pool limit is risky",
        "paragraphs": [
          "A pool protects a finite shared resource. Raising its limit may turn a short application queue into too many active database sessions, increasing memory use and contention. More sessions do not necessarily increase useful query throughput. Raising the database connection ceiling is not a substitute for measuring the resource bottleneck.",
          "An unlimited acquisition queue is also a resource problem. Requests that wait past the caller deadline retain memory and may execute after the user has retried. Keep the queue bounded, give acquisition a deadline, and reject excess work explicitly. The right limit is a measured budget, not a universal connections-per-core rule."
        ]
      },
      {
        "id": "mental-model",
        "title": "Account for every owner of a connection",
        "paragraphs": [
          "Suppose the application is allowed 160 connections after reserving capacity for administration, workers, and other services. Eight replicas with pools of 20 use that entire allowance at their maximum. Sixteen replicas with the same pool size could demand 320. Include old and new replicas during rolling deployment; steady-state counts can hide the peak.",
          "A connection is occupied from checkout until release. That interval can include idle time inside a transaction and remote calls made by the application. Always release it through structured cleanup, including error and cancellation paths. A short query inside a long transaction still holds the session and can retain locks."
        ]
      },
      {
        "id": "architecture",
        "title": "Bound demand and shorten hold time",
        "paragraphs": [
          "Allocate a database-wide session budget, then divide it across the maximum expected replicas and background workers. Add headroom for deployments and operational access. Use a pooler when appropriate, but understand whether it pools sessions or transactions; transaction pooling can affect session-local settings and application features.",
          "Instrument acquisition latency, checked-out sessions, idle-in-transaction sessions, query latency, and lock waits. Apply statement and transaction limits suited to the workload. Move remote HTTP calls outside database transactions when correctness permits. Optimize the expensive query or lock pattern before assuming another connection will make it faster."
        ]
      },
      {
        "id": "worked-example",
        "title": "Estimate occupancy, then identify the missing time",
        "paragraphs": [
          "At a stable 400 database operations per second, an average checkout duration of 40 milliseconds implies about 16 occupied connections. If the average rises to 400 milliseconds, the same work implies about 160. With a budget of 160 there is no headroom for variance, so queueing becomes a serious concern even before average demand exceeds capacity.",
          "This estimate assumes one checkout per operation and a stable workload. Multiple queries sharing one checkout count as one hold interval. Bursts, lock contention, and long-tail transactions require more careful measurement. If query execution remains 20 milliseconds while checkout duration reaches 400, inspect application-side work and idle transactions rather than only query plans."
        ]
      },
      {
        "id": "scale",
        "title": "What breaks at ten times the demand?",
        "paragraphs": [
          "At ten times the arrival rate, even a well-managed pool cannot invent database execution capacity. Use caching for safe repeated reads, batch work where semantics allow it, and rate-limit background jobs. A read replica can serve eligible reads but changes freshness and routing decisions; it does not remove write contention.",
          "Define fairness between interactive requests, exports, and batch workers. Separate their admission budgets so a report cannot consume every session. Autoscaling should respect the shared connection budget and deployment overlap. Validate capacity using representative query mixes and tail latency rather than a benchmark of trivial queries."
        ]
      }
    ],
    "runbook": [
      "Inspect database activity and pool metrics together: acquisition wait, hold duration, query time, and lock waits.",
      "Reduce nonessential work and cap application concurrency. Preserve operational access to the database.",
      "Cancel or repair the specific runaway query, lock chain, idle transaction, or connection leak under an owned incident procedure.",
      "Recalculate budgets for peak replicas and deployment overlap, then verify representative throughput before increasing limits."
    ],
    "tradeoffs": [
      [
        "Smaller pools",
        "Protect the database but require admission control to keep waiting bounded."
      ],
      [
        "Transaction pooling",
        "Reuses sessions efficiently but changes assumptions about session state."
      ],
      [
        "Separate workload budgets",
        "Protects interactive traffic but may leave some reserved capacity idle."
      ]
    ],
    "extraTables": [
      {"caption": "PgBouncer pool modes: what each one shares, and what breaks", "headers": ["Mode", "Connection returns to the pool", "What breaks"], "rows": [["Session", "When the client disconnects", "Nothing; every PostgreSQL feature works. Sharing is lowest, so it barely reduces database sessions for long-lived application pools."], ["Transaction", "When the transaction ends", "Session state: SET/RESET, LISTEN, WITH HOLD cursors, SQL PREPARE/DEALLOCATE, session-level advisory locks, LOAD, and temp tables that outlive a transaction. Protocol-level prepared statements need max_prepared_statements set above zero."], ["Statement", "After every statement", "Everything transaction mode breaks, plus multi-statement transactions, which are rejected. Meant for autocommit-only clients."]]}
    ],
    "failures": [
      [
        "Leaked checkout",
        "Use structured release on success, error, and cancellation; observe connections that never return.",
        "Code borrows a connection and never gives it back, often on an error path. The pool loses one connection each time, until requests wait for connections that never return."
      ],
      [
        "Idle transaction",
        "Remove remote waits and enforce transaction boundaries; a low query count can hide held resources.",
        "A request opens a transaction, then waits on something slow such as an HTTP call. The connection and any locks stay held the whole time while doing nothing."
      ],
      [
        "Autoscaling surge",
        "Budget for all replicas and rolling deployment overlap, not just the current pod count.",
        "Traffic rises, autoscaling adds servers, and each new server opens its own pool. Together they ask for more connections than the database allows."
      ]
    ],
    "interview": "I would separate pool acquisition time from query and checkout duration. I would inspect leaks, idle transactions, and lock waits, then allocate the shared database budget across peak replicas. Scaling the application only helps if it does not overload the database; admission control must bound waiting.",
    "levels": [
      {
        "title": "Mid-level",
        "description": "Explain pool acquisition, connection checkout, and database execution as separate intervals.",
        "items": [
          "Separate time waiting for a connection from query time",
          "Explain why a bigger pool can make the database slower",
          "Set an acquisition timeout instead of waiting forever"
        ]
      },
      {
        "title": "Senior",
        "description": "Diagnose occupancy with metrics, model replica budgets, and bound acquisition waits.",
        "items": [
          "Estimate occupancy from request rate and hold time",
          "Find work that holds a connection while it waits on something else",
          "Divide the database's connection limit across every replica"
        ]
      },
      {
        "title": "Staff",
        "description": "Coordinate budgets across teams, deployment overlap, workload fairness, and database capacity planning.",
        "items": [
          "Include deployment overlap and autoscaling in the connection budget",
          "Isolate batch jobs from latency-sensitive traffic",
          "Plan database capacity alongside the services that share it"
        ]
      }
    ],
    "wrongAnswers": [
      {"question": "Why not raise the pool size on every replica?", "explanation": "If the database is the bottleneck, more sessions add memory and lock contention without adding query throughput. Eight replicas with pools of 20 already reach a 160-session budget; raising each pool to 40 asks for 320. Find where the hold time goes before giving anyone more connections."},
      {"question": "Why not let autoscaling add replicas when requests start to queue?", "explanation": "Low application CPU with rising acquisition time means work is waiting on the database, not on compute. Every new replica brings its own pool, so scaling out increases demand on the resource that is already short. Cap the replica count against the shared session budget, including the overlap during deploys."},
      {"question": "Why not let requests wait for a connection as long as it takes?", "explanation": "A request that waits past its caller's deadline still holds memory, and it may run its query after the user has already retried. An unbounded queue turns a short slowdown into a backlog. Give acquisition a deadline, bound the queue, and return an explicit overload response."}
    ],
    "followups": [
      ["How does a rolling deployment change the connection budget?", "Old and new replicas overlap during a rollout, so peak demand is the surge replica count times pool size. Budget for maximum surge or shrink pools during deploys, so the rollout itself does not exhaust the database."],
      ["Which session features break under transaction pooling?", "Anything that expects state to stay on one server connection between transactions: session-level SET, advisory locks held across transactions, temporary tables, LISTEN/NOTIFY, and prepared statements unless the pooler explicitly supports them."],
      ["What metric distinguishes a leak from a legitimately slow transaction?", "Compare pool checkout time with database activity. A leak shows connections checked out while the database sees them idle or idle in transaction; a slow transaction shows the connection actively running a query."]
    ],
    "related": [
      "retry-storm",
      "hot-partition",
      "database-migration"
    ],
    "sources": [
      [
        "PostgreSQL: Connections and authentication",
        "https://www.postgresql.org/docs/current/runtime-config-connection.html"
      ],
      [
        "PgBouncer: Feature compatibility",
        "https://www.pgbouncer.org/features.html"
      ]
    ],
    "questions": [
      {
        "scenario": "Eight replicas have pool size 20. Autoscaling doubles the replicas. What is the new maximum application demand?",
        "options": [
          {
            "text": "320 connections",
            "explanation": "Sixteen independent pools can each request 20 sessions.",
            "isCorrect": true
          },
          {
            "text": "160 connections",
            "explanation": "That was the budget before doubling replicas.",
            "isCorrect": false
          },
          {
            "text": "20 connections",
            "explanation": "Pool limits are local unless explicitly coordinated.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "Acquisition wait rises while query duration is stable. What should you inspect?",
        "options": [
          {
            "text": "Only database CPU",
            "explanation": "Low CPU does not reveal how sessions are occupied.",
            "isCorrect": false
          },
          {
            "text": "Only HTTP response compression",
            "explanation": "This does not diagnose session ownership.",
            "isCorrect": false
          },
          {
            "text": "Checkout duration, leaks, and idle transactions",
            "explanation": "Connections may be held while no query executes.",
            "isCorrect": true
          }
        ]
      },
      {
        "scenario": "At a stable 400 checkouts/s and average hold time 0.4 seconds, what is average occupancy?",
        "options": [
          {
            "text": "10 connections",
            "explanation": "That would require a much shorter hold interval.",
            "isCorrect": false
          },
          {
            "text": "160 connections",
            "explanation": "Little’s Law gives 400 × 0.4 = 160 under the stable-workload assumptions.",
            "isCorrect": true
          },
          {
            "text": "1,000 connections",
            "explanation": "Dividing rate by time does not give occupancy.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "Pool acquisition can wait indefinitely. What is the risk?",
        "options": [
          {
            "text": "Work can outlive caller deadlines and consume unbounded resources",
            "explanation": "Bound queue size and waiting time to avoid accumulating useless work.",
            "isCorrect": true
          },
          {
            "text": "The database automatically adds capacity",
            "explanation": "A queue does not create execution capacity.",
            "isCorrect": false
          },
          {
            "text": "It prevents every timeout",
            "explanation": "Callers can still time out while the server keeps waiting.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "A database budget fits steady-state replicas exactly. What else must be counted?",
        "options": [
          {
            "text": "Only application CPU cores",
            "explanation": "CPU count alone does not enumerate session owners.",
            "isCorrect": false
          },
          {
            "text": "Only the number of tables",
            "explanation": "Tables are not connection owners.",
            "isCorrect": false
          },
          {
            "text": "Rolling deployment overlap, workers, and operational headroom",
            "explanation": "These sessions compete with the same shared budget.",
            "isCorrect": true
          }
        ]
      }
    ]
  },
  {
    "id": "schema-evolution",
    "shortTitle": "Change a schema without breaking mixed versions",
    "flow": [
      "Expand: add compatible schema",
      "Bridge: preserve both representations",
      "Backfill: bounded + resumable",
      "Switch: validate new readers",
      "Contract: remove old after rollback window"
    ],
    "diagramCaption": "Each arrow is a separately verified phase. Deploying new code does not prove old workers, reports, or rollback versions have stopped using the old column.",
    "sections": [
      {
        "id": "problem",
        "title": "A rolling deployment is a mixed-version system",
        "paragraphs": [
          "Your orders table stores delivery_instructions in an old column. You want to move that value to a new fulfillment_note column. Millions of existing rows need copying, and application replicas deploy gradually. Old code continues reading and writing delivery_instructions while new code starts using fulfillment_note.",
          "A direct rename makes one version’s queries fail. A one-time copy misses writes arriving after the copy. The real requirement is a compatibility period in which every active application version can operate correctly while data moves. Schema changes are deployment protocols, not just SQL files."
        ]
      },
      {
        "id": "naive",
        "title": "Why a rename and redeploy is not atomic",
        "paragraphs": [
          "The database migration and the application rollout do not commit together. Even if all web replicas update quickly, scheduled jobs, delayed consumers, administrative scripts, and a rollback image may still reference the old name. Dropping it turns these hidden dependencies into production errors.",
          "A giant update in one transaction can create long lock holds, large write-ahead logs, replica lag, and difficult recovery. A migration tool reporting success proves that its statements completed; it does not prove compatibility across live code, data, and rollback versions."
        ]
      },
      {
        "id": "mental-model",
        "title": "Treat schema evolution as expanding and narrowing a contract",
        "paragraphs": [
          "Expand means adding a representation without removing what current code needs. A bridge release understands both representations and preserves the old contract. Backfill copies historical state while protecting concurrent writes. Switch means moving readers after evidence supports the new path. Contract means retiring the old representation after its consumers and rollback obligations are gone.",
          "For a rename-like change, choose one authoritative representation during each phase. Avoid letting old and new writers independently choose conflicting sources of truth. Keep a compatibility matrix for schema version, reader version, writer version, workers, and the rollback image. Explicitly record which combinations are allowed."
        ]
      },
      {
        "id": "architecture",
        "title": "Bridge writes before changing reads",
        "paragraphs": [
          "Add the new nullable column using a reviewed DDL operation with a lock timeout appropriate to the database. During the initial mixed rollout, keep the old column authoritative and new readers on the old path. A bridge release writes both columns in the same row transaction. Wait for all old-only writers to drain before relying on application dual writes.",
          "If old-only writers cannot be drained, use a carefully reviewed database trigger or another synchronizing mechanism until they can. Then backfill under the chosen authority rule. Compare old and new values, verify coverage, and switch reads with an operational flag. Retain dual writes while rollback still needs the old representation. Only contract after consumers and rollback windows have moved."
        ]
      },
      {
        "id": "worked-example",
        "title": "A backfill must not overwrite fresher work",
        "paragraphs": [
          "For this exact rename, a bounded SQL update can copy delivery_instructions into fulfillment_note on rows whose new value is still null. Advance through a stable primary key in committed chunks, and keep a durable checkpoint. Avoid fetching a value into application memory and writing it later without a version condition: a concurrent writer may have changed it.",
          "If null is a legitimate new value, it cannot also reliably mean “not migrated.” Use an explicit migration marker or version instead. If the transformation changes meaning rather than just its name, define conflict resolution and prove each write preserves it. Retry-safe batches, reconciliation passes, and mismatch sampling matter more than one impressive completion percentage."
        ]
      },
      {
        "id": "scale",
        "title": "What breaks on a table ten times larger?",
        "paragraphs": [
          "Backfill throughput competes with live traffic for I/O, locks, log bandwidth, and replica capacity. Throttle by observed latency and replication lag, not only a fixed rows-per-second target. Use short transactions, stable key ranges, and resumable checkpoints. An interrupted backfill should resume without repeating harmful effects.",
          "Adding a column, validating a constraint, and building an index have different lock and scan behavior. Check your database version and operation. In PostgreSQL, some check and foreign-key constraints can be added NOT VALID and validated later, reducing interference from the historical scan; this is not a universal online-DDL guarantee. Trial the exact operation against realistic data and lock conditions."
        ]
      }
    ],
    "runbook": [
      "Inventory web, worker, reporting, and rollback consumers; define old/new compatibility and the authoritative representation.",
      "Expand the schema, deploy the bridge with old reads, and drain or synchronize old-only writers.",
      "Backfill in small resumable batches, monitor lock waits and replica lag, and verify coverage plus value agreement.",
      "Switch reads gradually. Keep rollback-compatible writes until the window closes; contract in a separate reviewed deployment."
    ],
    "tradeoffs": [
      [
        "Application dual writes",
        "Can be atomic within one database transaction, but every active writer must participate."
      ],
      [
        "Temporary trigger",
        "Covers legacy writers centrally but adds hidden behavior and requires careful cleanup."
      ],
      [
        "Long compatibility window",
        "Supports rollback and slow consumers but prolongs duplicate schema and maintenance."
      ]
    ],
    "failures": [
      [
        "Backfill races with live writes",
        "Use database-side copying or conditional version checks under a documented authority rule.",
        "The backfill reads a row, a user updates it, and then the backfill writes the old value over the new one. The user's change is lost without any error."
      ],
      [
        "Contract before old jobs drain",
        "Old queries fail; enumerate consumers and observe the rollback window before dropping columns.",
        "You drop the old column, but a nightly job or an old server still uses it. That code fails the next time it runs."
      ],
      [
        "DDL waits behind a long transaction",
        "Use a lock timeout and investigate blockers rather than allowing a deployment to queue indefinitely.",
        "A schema change needs a lock and waits behind a long-running query. While it waits, every other query on that table queues behind it, and the app stalls."
      ]
    ],
    "interview": "I would expand first, deploy a compatible bridge, drain or synchronize old writers, then run a resumable backfill under an explicit source-of-truth rule. I would validate before switching readers and preserve the old representation through rollback. Contract is a separate step with evidence that old consumers are gone.",
    "levels": [
      {
        "title": "Mid-level",
        "description": "Explain why mixed application versions require backward-compatible schema additions.",
        "items": [
          "Treat a rolling deploy as old and new code running together",
          "Add columns before code depends on them",
          "Never rename or drop in the same release that stops using a field"
        ]
      },
      {
        "title": "Senior",
        "description": "Plan writer transitions, race-safe backfills, validation, and reversible read switching.",
        "items": [
          "Make writers fill both shapes before readers switch",
          "Backfill in batches that never overwrite fresher writes",
          "Validate the new shape before moving reads"
        ]
      },
      {
        "title": "Staff",
        "description": "Inventory cross-team consumers, define rollback boundaries, and budget large-table operational costs.",
        "items": [
          "Find every consumer of the table, including other teams",
          "State which step stops being reversible",
          "Budget lock time, replication lag, and storage for large tables"
        ]
      }
    ],
    "wrongAnswers": [
      {"question": "Why not rename the column and deploy the new code right after?", "explanation": "The migration and the rollout do not commit together. Old replicas, scheduled jobs, delayed consumers, and the rollback image still query delivery_instructions, and they fail as soon as it disappears. Expand first, run a bridge release that understands both columns, and contract only when nothing still reads the old one."},
      {"question": "Why not copy all the rows in one UPDATE?", "explanation": "One large transaction holds locks for its whole run, writes a burst of WAL, lags the replicas, and must be redone from the start if it fails. Copy in bounded chunks along a stable key, keep a checkpoint, and throttle on replication lag and API latency."},
      {"question": "Why not switch reads as soon as the backfill reports 100%?", "explanation": "A completed copy says the statements finished, not that the two columns agree. Writes that arrived during the copy, or from writers that only know the old column, can leave mismatches. Compare old and new values, sample for drift, and switch reads behind a flag you can turn back."}
    ],
    "followups": [
      ["What is the last point at which the old application can safely roll back?", "Just before the contract step. While the old column is still written and read correctly, the old version works. Once you stop writing it or drop it, rolling back the application also requires a data repair."],
      ["How would the plan change for a lossy data transformation?", "Keep the original data until the new form is proven, because a lossy step cannot be undone. Backfill into a new column, validate, and keep the source column or an archive until rollback is no longer possible."],
      ["How do you detect a monthly report that still reads the old column?", "Audit column access before contracting, using query logs or pg_stat_statements and ORM query tags. Wait at least one full reporting cycle with zero reads before dropping the column."]
    ],
    "related": [
      "database-migration",
      "transactional-outbox",
      "connection-pool"
    ],
    "sources": [
      [
        "Prisma: Expand and contract",
        "https://docs.prisma.io/docs/guides/database/data-migration"
      ],
      [
        "PostgreSQL: ALTER TABLE",
        "https://www.postgresql.org/docs/current/sql-altertable.html"
      ]
    ],
    "questions": [
      {
        "scenario": "Old and new replicas are both running. What is a safe first schema change?",
        "options": [
          {
            "text": "Add the new representation while retaining the old one",
            "explanation": "Expansion preserves what active old code still requires.",
            "isCorrect": true
          },
          {
            "text": "Drop the old column immediately",
            "explanation": "Active old replicas still reference it.",
            "isCorrect": false
          },
          {
            "text": "Rename the column and hope rollout finishes quickly",
            "explanation": "Schema and application deployment are not atomic.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "The bridge writes both columns, but old-only writers remain. Can you rely on complete dual-write coverage?",
        "options": [
          {
            "text": "Yes; one new replica is enough",
            "explanation": "Its writes do not cover operations handled by old replicas.",
            "isCorrect": false
          },
          {
            "text": "Yes; backfill ran yesterday",
            "explanation": "Later writes can still invalidate yesterday’s copy.",
            "isCorrect": false
          },
          {
            "text": "No; drain old writers or synchronize them before relying on the new representation",
            "explanation": "Old-only updates can leave the new value stale.",
            "isCorrect": true
          }
        ]
      },
      {
        "scenario": "Null is a valid business value in the new column. Can it also reliably mark unmigrated rows?",
        "options": [
          {
            "text": "Yes; exclude null rows permanently",
            "explanation": "This can leave historical rows unmigrated.",
            "isCorrect": false
          },
          {
            "text": "No; use an explicit migration marker or version",
            "explanation": "Business null and missing migration state would be ambiguous.",
            "isCorrect": true
          },
          {
            "text": "Yes; every null means migration failure",
            "explanation": "Some nulls are legitimate.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "Backfill causes replication lag and rising API latency. What next?",
        "options": [
          {
            "text": "Throttle or pause resumable batches and inspect pressure",
            "explanation": "Preserve live traffic and resume from durable checkpoints.",
            "isCorrect": true
          },
          {
            "text": "Use one larger transaction",
            "explanation": "That can worsen locks, log pressure, and recovery.",
            "isCorrect": false
          },
          {
            "text": "Drop validation to finish sooner",
            "explanation": "That removes evidence of correctness without resolving contention.",
            "isCorrect": false
          }
        ]
      },
      {
        "scenario": "New readers are healthy. When can you drop the old column?",
        "options": [
          {
            "text": "As soon as one canary succeeds",
            "explanation": "One canary does not cover all consumers.",
            "isCorrect": false
          },
          {
            "text": "Whenever the backfill progress says 100%",
            "explanation": "Copied rows do not prove consumer compatibility.",
            "isCorrect": false
          },
          {
            "text": "After all consumers and required rollback versions no longer depend on it",
            "explanation": "Read rollout alone does not retire workers, reports, or rollback obligations.",
            "isCorrect": true
          }
        ]
      }
    ]
  }
];

export const productionBlueprints: ProductionBlueprint[] = blueprintContent.map(content => ({ ...content, ...productionCatalog.find(topic => topic.id === content.id)! }));
