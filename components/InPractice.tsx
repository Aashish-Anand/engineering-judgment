import styles from "./InPractice.module.css";

export type PracticeNote = { title: string; points: string[]; sources: [label: string, href: string][] };

/** Renders `code` spans written with backticks inside plain data strings. */
function withCode(text: string) {
  return text.split("`").map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
}

/** A sourced note on how named production systems and teams implement the idea just explained. */
export function InPractice({ title, points, sources }: PracticeNote) {
  return (
    <aside className={styles.practice} aria-label={`In practice: ${title}`}>
      <p className={styles.label}>In practice</p>
      <h3>{title}</h3>
      <ul>{points.map(point => <li key={point}>{withCode(point)}</li>)}</ul>
      <p className={styles.sources}>
        Source{sources.length > 1 ? "s" : ""}:{" "}
        {sources.map(([label, href], i) => <span key={href}>{i > 0 && " · "}<a href={href} target="_blank" rel="noreferrer">{label}</a></span>)}
      </p>
    </aside>
  );
}
