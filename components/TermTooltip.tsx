"use client";

import { useState, useRef, useEffect } from "react";

export type TermDef = {
  term: string;
  definition: string;
  tools?: string[];
};

export const TERM_GLOSSARY: Record<string, TermDef> = {
  CDC: {
    term: "CDC — Change Data Capture",
    definition:
      "A pattern that tracks row-level changes in a database by reading its internal change log (e.g. WAL), then streams those changes to another system in near-real-time.",
    tools: ["Debezium", "AWS DMS", "Striim", "Maxwell", "Fivetran"],
  },
  WAL: {
    term: "WAL — Write-Ahead Log",
    definition:
      "A sequential, append-only log where a database records every mutation before applying it to the main data files. It guarantees durability and is the foundation for replication and CDC.",
    tools: ["PostgreSQL WAL", "MySQL Binlog", "MongoDB Oplog"],
  },
  "dual write": {
    term: "Dual Write",
    definition:
      "Writing to two separate data stores from the application layer in a single operation. If one write fails and the other succeeds, the systems diverge — creating a consistency problem that's hard to detect and repair.",
    tools: ["Transactional Outbox (Debezium)", "Custom reconciliation jobs"],
  },
  "replication lag": {
    term: "Replication Lag",
    definition:
      "The delay between a write being committed on the source database and that same write being applied to the replica or target. High lag means the target is serving stale data.",
    tools: ["pg_stat_replication", "SHOW SLAVE STATUS (MySQL)", "CloudWatch"],
  },
  snapshot: {
    term: "Point-in-Time Snapshot",
    definition:
      "A consistent copy of the entire dataset at a specific moment. Used as the baseline for migration — CDC then fills in the gap between the snapshot time and the present.",
    tools: ["pg_dump", "mysqldump", "mongodump", "AWS RDS Snapshots"],
  },
  "feature flag": {
    term: "Feature Flag",
    definition:
      "A runtime toggle that controls which code path is executed. In migrations, feature flags let you shift traffic between databases without deploying new code.",
    tools: ["LaunchDarkly", "Unleash", "Flipt", "AWS AppConfig"],
  },
  idempotent: {
    term: "Idempotent Operation",
    definition:
      "An operation that produces the same result whether executed once or multiple times. Essential in CDC pipelines to safely handle duplicate events without corrupting data.",
  },
  reconciliation: {
    term: "Reconciliation",
    definition:
      "The process of comparing two data stores and resolving differences. Typically runs as a background job that detects missing, extra, or divergent records between source and target.",
  },
  "rate limiting": {
    term: "Rate Limiting & Throttling",
    definition:
      "A control mechanism that limits how many requests a client or service can make in a given timeframe. Protects upstream APIs from starvation and malicious abuse.",
    tools: ["Kong", "Envoy", "Nginx", "Cloudflare WAF", "Redis token bucket"],
  },
  "hot key": {
    term: "Hot Key Problem",
    definition:
      "A condition where a disproportionately high volume of traffic hits a single cache key or database shard (e.g. 10M reads on a single product ID), creating a severe bottleneck on that specific node.",
    tools: ["Redis cluster key sharding", "Local in-process cache (caffeine/lru)", "Read replicas"],
  },
  "Lua script": {
    term: "Redis Lua Scripting (EVAL)",
    definition:
      "Executing Lua code directly inside the Redis server. Because Redis runs single-threaded, a Lua script executes as an indivisible atomic unit — no other command can interleave.",
    tools: ["Redis EVAL", "OpenResty", "Redis Functions"],
  },
  "thundering herd": {
    term: "Thundering Herd / Cache Stampede",
    definition:
      "When thousands of concurrent clients simultaneously query for a resource that is uncached or expires at the same second, overwhelming the origin server with identical requests.",
    tools: ["Probabilistic early expiration (XFetch)", "Singleflight", "Mutex locking"],
  },
  "saga pattern": {
    term: "Saga Pattern",
    definition:
      "A design pattern that manages distributed transactions across microservices as a sequence of local transactions, with compensating transactions triggered if any step fails.",
    tools: ["Temporal", "Camunda", "Event-driven choreographies"],
  },
  "reservation TTL": {
    term: "Reservation TTL (Time-To-Live)",
    definition:
      "A temporary hold placed on inventory with a strict expiration window. If the buyer does not complete checkout within the TTL, the hold expires and inventory is automatically returned to the available pool.",
    tools: ["Redis keyspace notifications", "Kafka delayed topics", "Scheduled sweepers"],
  },
};

type TermTooltipProps = {
  termKey: string;
  children: React.ReactNode;
};

export function TermTooltip({ termKey, children }: TermTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const def = TERM_GLOSSARY[termKey];
  if (!def) {
    return <code>{children}</code>;
  }

  return (
    <span className="relative inline-block" ref={ref}>
      <code
        className="term-trigger"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        role="button"
        tabIndex={0}
        aria-describedby={`tooltip-${termKey}`}
      >
        {children}
      </code>

      {open && (
        <div
          ref={tooltipRef}
          id={`tooltip-${termKey}`}
          role="tooltip"
          className="term-tooltip absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-4 bg-white border-[1.5px] border-[#171717] rounded-xl shadow-[3px_4px_0px_#171717]"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {/* Arrow */}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 -mt-[5px] bg-white border-r-[1.5px] border-b-[1.5px] border-[#171717]"
          />

          <p className="font-hand font-bold text-base text-[#171717] mb-1">
            {def.term}
          </p>
          <p className="text-xs text-[#374151] leading-relaxed mb-0 font-sans">
            {def.definition}
          </p>
          {def.tools && def.tools.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-dashed border-[#171717]/20">
              <p className="font-sans font-bold text-[0.7rem] uppercase tracking-wider text-[#6B7280] mb-1">
                Common Tools
              </p>
              <div className="flex flex-wrap gap-1.5">
                {def.tools.map((tool) => (
                  <span
                    key={tool}
                    className="text-[0.7rem] font-mono px-2 py-0.5 bg-[#FAF9F5] border border-[#171717] rounded text-[#171717] shadow-2xs"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </span>
  );
}
