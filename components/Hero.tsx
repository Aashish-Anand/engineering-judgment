"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Home.module.css";

export function Hero() {
  const [pressure, setPressure] = useState(false);
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}><span className={styles.statusDot} /> A field guide to architecture under pressure</p>
        <h1>Understand<br />the system.<br /><span>Make the call.</span></h1>
        <p className={styles.heroDescription}>Production gets messy. Build the judgment to handle it. Explore real constraints, break a few assumptions, and see what your decisions cost.</p>
        <div className={styles.actions}><Link className={styles.button} href="#problems">Find your next problem <span aria-hidden="true">↗</span></Link><Link className={styles.secondaryLink} href="#labs">Try the workbench ↓</Link></div>
        <p className={styles.heroNote}>Read the problem. Challenge the design. Own the trade-off.</p>
      </div>
      <div className={styles.heroVisual}>
        <div className={styles.console}>
          <div className={styles.consoleBar}><span><span className={styles.statusDot} /> SYSTEM IN THE MAKING</span><span>LAB / 001</span></div>
          <div className={styles.consoleBody}>
            <h2>Move the database.<br />Keep every write.</h2>
            <div className={styles.flow} aria-label="Source database streams changes through CDC to target database">
              <div className={styles.database}><strong>Source / A</strong><small>Serving production</small></div>
              <div className={styles.connector}><span>CDC</span><b aria-hidden="true">→</b></div>
              <div className={`${styles.database} ${styles.target}`}><strong>Target / B</strong><small>Catching up</small></div>
            </div>
            <div className={styles.liveReadout} aria-live="polite"><span>REPLICATION LAG</span><strong>{pressure ? "680" : "14"}<small> ms</small></strong><div className={styles.meter}><span style={{ width: pressure ? "84%" : "12%" }} /></div><p>{pressure ? "Writes surge. The target falls behind." : "Writes keep flowing. The target keeps up."}</p></div>
            <button className={styles.spikeButton} type="button" aria-pressed={pressure} onClick={() => setPressure(value => !value)}>{pressure ? "↺ Reset the load" : "↗ Turn up the pressure"}<span>{pressure ? "2,400" : "250"} writes/s</span></button>
            <p className={styles.simulationNote}>Illustrative states · Assumptions in the blueprint.</p>
          </div>
          <Link className={styles.consoleLink} href="/topics/database/safely-migrate-production-database">Start with database migration <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </section>
  );
}
