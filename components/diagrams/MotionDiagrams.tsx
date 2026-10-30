"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DiagramFigure } from "./kit/DiagramKit";
import styles from "./MotionDiagrams.module.css";

const vars = (values: Record<string, number | string>) => values as CSSProperties;

/**
 * Counts up to `target` when the surrounding DiagramMotion starts playing.
 * Server HTML and reduced-motion readers see the final value; replay remounts it and counts again.
 */
function CountUp({ target, duration = 3200 }: { target: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(target);

  useEffect(() => {
    const motion = ref.current?.closest("[data-motion]");
    if (!motion) return;
    let frame = 0;
    const start = () => {
      const began = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - began) / duration);
        setValue(Math.round(target * (1 - (1 - t) ** 3)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    if (motion.getAttribute("data-motion") === "play") { start(); return () => cancelAnimationFrame(frame); }
    const observer = new MutationObserver(() => {
      const state = motion.getAttribute("data-motion");
      if (state === "armed") setValue(0);
      if (state === "play") { observer.disconnect(); start(); }
    });
    observer.observe(motion, { attributes: true, attributeFilter: ["data-motion"] });
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [target, duration]);

  return <span ref={ref} aria-hidden="true">{value.toLocaleString("en-US")}</span>;
}

const FUNNEL = [
  { label: "Buyers", rate: "~2M req/s", note: "Everyone arrives at once", flow: 8 },
  { label: "Edge + WAF", rate: "~600k req/s", note: "Bots and cached pages stop here", flow: 6 },
  { label: "Waiting room", rate: "10k req/s out", note: "The rest wait in line", flow: 4 },
  { label: "Stock gate", rate: "10,000 wins", note: "Late buyers see sold out", flow: 3 },
  { label: "Order buffer", rate: "~13 orders/s", note: "Queued at a safe rate", flow: 2 },
  { label: "Database", rate: "10,000 orders", note: "Settles reserved orders", flow: 1 },
];

/** Requests thin out at every layer; only reserved orders reach the database. */
export function FlashSaleFunnelMotion() {
  return (
    <DiagramFigure
      title="Watch the funnel shed load"
      caption="Each layer passes on less than it receives: the edge drops bots and serves cached pages, the waiting room meters the rest, and the stock gate admits exactly 10,000 reservations. Rates are illustrative."
    >
      <div className={styles.funnelWrap}><ol className={styles.funnel} aria-label="Requests per layer, left to right">
        {FUNNEL.map((lane, i) => {
          const shed = i === 0 ? 0 : FUNNEL[i - 1].flow - lane.flow;
          return (
            <li key={lane.label} className={styles.lane} style={vars({ "--lane": i })}>
              <strong>{lane.label}</strong>
              <span className={styles.pipe} aria-hidden="true">
                {Array.from({ length: lane.flow }, (_, d) => <i key={d} className={styles.flowDot} style={vars({ "--d": d, "--n": lane.flow })} />)}
                {Array.from({ length: shed }, (_, d) => <i key={`shed-${d}`} className={styles.shedDot} style={vars({ "--d": d })} />)}
              </span>
              <b>{lane.rate}</b>
              <small>{lane.note}</small>
            </li>
          );
        })}
      </ol></div>
      <p className={styles.counter}>
        <span className={styles.counterValue}><CountUp target={10000} /> / 10,000</span>
        <span>units reserved at the stock gate</span>
        <span className="sr-only">10,000 of 10,000 units reserved</span>
      </p>
    </DiagramFigure>
  );
}

const PHASES = [
  { step: "1", title: "Snapshot", detail: "B loads a copy taken at one WAL position. A keeps writing; its replication slot holds every change since." },
  { step: "2", title: "Catch up", detail: "CDC replays the held changes faster than A creates new ones, so the gap between the markers shrinks." },
  { step: "3", title: "Fence", detail: "Writes on A pause. B applies A's final position, the gap reaches zero, and writes move to B." },
];

/** WAL positions over time: the snapshot point, B catching up, and the fenced pause before the switch. */
export function MigrationLsnTimeline() {
  return (
    <DiagramFigure
      title="Copied, caught up, then switched"
      caption="Positions are illustrative. The gap between A's newest write and B's applied position is the replication lag; the switch waits until a fence stops A from adding to it."
    >
      <div className={styles.timeline}>
        <div className={styles.track} aria-hidden="true">
          <span className={styles.axis}>WAL position →</span>
          <span className={styles.snapshot}><em>Snapshot</em></span>
          <span className={styles.fence}><em>Fence</em></span>
          <span className={`${styles.marker} ${styles.source}`}><em>A: newest write</em></span>
          <span className={`${styles.marker} ${styles.target}`}><em>B: applied</em></span>
        </div>
        <ol className={styles.phases}>
          {PHASES.map((phase, i) => (
            <li key={phase.step} style={vars({ "--phase": i })}>
              <span aria-hidden="true">{phase.step}</span>
              <div><strong>{phase.title}</strong><p>{phase.detail}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </DiagramFigure>
  );
}
