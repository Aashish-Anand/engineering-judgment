import type { TopicId } from "@/data/topics/catalog";
import { articleGuides } from "@/data/article-guides";
import { PrintQuickReference } from "./PrintQuickReference";
import styles from "./Learning.module.css";

/** "Recognize it" signals, plus a collapsible quick-reference card that prints on its own. */
export function ArticleGuide({ topicId }: { topicId: TopicId }) {
  const { signals, quick } = articleGuides[topicId];
  return (
    <div className={styles.guide}>
      <section className={styles.signals} aria-labelledby={`${topicId}-signals`}>
        <h2 id={`${topicId}-signals`}>You are probably facing this when…</h2>
        <ul>{signals.map(signal => <li key={signal}>{signal}</li>)}</ul>
      </section>
      <details className={styles.quickRef} data-quick-reference>
        <summary>Quick reference · the one-minute version</summary>
        <dl>
          <div><dt>Invariant</dt><dd>{quick.invariant}</dd></div>
          <div><dt>Decision</dt><dd>{quick.decision}</dd></div>
          <div><dt>Remember</dt><dd><ul>{quick.remember.map(item => <li key={item}>{item}</li>)}</ul></dd></div>
          <div><dt>Watch for</dt><dd>{quick.failure}</dd></div>
        </dl>
        <PrintQuickReference />
      </details>
    </div>
  );
}
