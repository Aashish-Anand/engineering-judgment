import styles from "./FlashSaleArchitectureDiagram.module.css";

const stages = [
  { title: "Concurrent buyers", detail: "10M buyers enter the admission funnel.", throughput: "~2,000,000 peak RPS", tone: "paper" },
  { title: "CDN edge + WAF", detail: "Static caching and bot filtering absorb most traffic (illustrative).", throughput: "~600,000 RPS continue", tone: "blue" },
  { title: "Virtual waiting room", detail: "Randomized places for early arrivals, signed tokens, metered release.", throughput: "Controlled 10,000 req/s", tone: "yellow" },
  { title: "Redis stock gate", detail: "Atomic Lua reservation: DECRBY in < 0.5ms.", throughput: "Exactly 10,000 wins", tone: "mint" },
  { title: "Kafka order buffer", detail: "Partitioned by user ID; decouples the database spike.", throughput: "~13 orders/s (cap 500/s)", tone: "lilac" },
  { title: "Database settlement", detail: "Conditional updates never take stock below zero.", throughput: "10,000 database orders", tone: "paper" },
];

export function FlashSaleArchitectureDiagram() {
  return (
    <figure className={styles.funnel} aria-label="Flash sale layered funnel architecture">
      <figcaption className={styles.caption}>
        <strong>Admission funnel</strong>
        <span>Follow stages 01 → 06</span>
      </figcaption>
      <p className={styles.scrollHint}>Scroll across to follow all six stages →</p>
      <ol className={styles.stages} tabIndex={0} aria-label="Six stages, read left to right across each row">
        {stages.map((stage, index) => (
          <li key={stage.title} className={styles.stage} data-tone={stage.tone}>
            <div className={styles.stageHeading}>
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <h3>{stage.title}</h3>
            </div>
            <p>{stage.detail}</p>
            <div className={styles.throughput}>{stage.throughput}</div>
          </li>
        ))}
      </ol>
      <p className={styles.note}>Traffic is shed progressively; only reserved orders reach settlement.</p>
    </figure>
  );
}
