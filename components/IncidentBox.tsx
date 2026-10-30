import type { ReactNode } from "react";
import styles from "./InPractice.module.css";

export type Incident = { title: string; when: string; summary: string; source: [label: string, href: string] };

/** A short, sourced account of a public production incident that shows the failure the article explains.
 *  MDX articles pass the account as Markdown in `children` instead of `summary`. */
export function IncidentBox({ title, when, summary, source: [label, href], children }: Omit<Incident, "summary"> & { summary?: string; children?: ReactNode }) {
  return (
    <aside className={`${styles.practice} ${styles.incident}`} aria-label={`This happened for real: ${title}`}>
      <p className={styles.label}>This happened for real · {when}</p>
      <h3>{title}</h3>
      {children ?? <p>{summary}</p>}
      <p className={styles.sources}>Source: <a href={href} target="_blank" rel="noreferrer">{label}</a></p>
    </aside>
  );
}
