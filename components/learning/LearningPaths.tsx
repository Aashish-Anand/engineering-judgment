"use client";

import Link from "next/link";
import { getTopicById } from "@/data/topics/catalog";
import { libraryDetails } from "@/data/library";
import { depthLabels, learningPaths, nextUnread, topicLearning } from "@/data/learning-paths";
import { setActivePath } from "@/data/progress";
import { updateProgress, useProgress } from "@/components/useProgress";
import styles from "./Learning.module.css";

/** Every learning path with the reader's progress. Renders complete without JavaScript (no progress). */
export function LearningPaths() {
  const progress = useProgress();
  const isRead = (id: string) => Boolean(progress.read[id]);
  return (
    <div className={styles.pathList}>
      {learningPaths.map(path => {
        const done = path.steps.filter(isRead).length;
        const nextId = nextUnread(path, isRead);
        const target = getTopicById(nextId ?? path.steps[0]);
        const label = done === 0 ? "Start this path" : nextId ? "Continue" : "Review from the start";
        return (
          <section key={path.slug} id={path.slug} className={styles.pathCard} aria-labelledby={`${path.slug}-title`}>
            <header>
              <div><h2 id={`${path.slug}-title`}>{path.title}</h2><p>{path.outcome}</p></div>
              <div className={styles.meter} aria-label={`${done} of ${path.steps.length} articles read`}>
                {done} / {path.steps.length} read
                <span aria-hidden="true"><i style={{ width: `${(done / path.steps.length) * 100}%` }} /></span>
              </div>
            </header>
            <ol>
              {path.steps.map((id, i) => {
                const topic = getTopicById(id);
                const outside = topicLearning[id].buildsOn.filter(prerequisite => !path.steps.includes(prerequisite));
                return (
                  <li key={id} data-read={isRead(id)}>
                    <b aria-hidden="true">{isRead(id) ? "✓" : i + 1}</b>
                    <div>
                      <Link href={topic.href} onClick={() => updateProgress(p => setActivePath(p, path.slug))}>{libraryDetails[id].title}</Link>
                      <small>{topic.meta.subtitle}{outside.length > 0 && <> Builds on {outside.map((prerequisite, j) => <span key={prerequisite}>{j > 0 && ", "}<Link href={getTopicById(prerequisite).href}>{libraryDetails[prerequisite].title}</Link></span>)}.</>}</small>
                    </div>
                    <span className={styles.depth}>{depthLabels[topicLearning[id].depth]} · {topic.meta.readingTime}</span>
                  </li>
                );
              })}
            </ol>
            <footer>
              <span>{nextId && done > 0 ? <>Next up: <strong>{libraryDetails[nextId].title}</strong></> : nextId ? `${path.steps.length} articles, ordered from core to advanced` : "Path complete"}</span>
              <Link className={styles.start} href={target.href} onClick={() => updateProgress(p => setActivePath(p, path.slug))}>{label} →</Link>
            </footer>
          </section>
        );
      })}
    </div>
  );
}
