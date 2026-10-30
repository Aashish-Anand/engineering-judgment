"use client";

import Link from "next/link";
import { getTopicById, topicCatalog, type TopicId } from "@/data/topics/catalog";
import { libraryDetails } from "@/data/library";
import { choosePath, learningPaths, nextUnread } from "@/data/learning-paths";
import { dueReviewKeys, setActivePath } from "@/data/progress";
import { reviewQuestionByKey } from "@/data/review";
import { updateProgress, useProgress } from "@/components/useProgress";
import styles from "./Learning.module.css";

/** Homepage tiles: resume the last article for returning readers, then each path's next step. */
export function HomeLearning() {
  const progress = useProgress();
  const isRead = (id: string) => Boolean(progress.read[id]);
  const last = topicCatalog.find(topic => topic.id === progress.lastVisited?.id);
  let resume: { id: TopicId; reason: string } | undefined;
  if (last) {
    const choice = choosePath(last.id, progress.activePath);
    const next = choice && nextUnread(choice.path, isRead);
    if (!isRead(last.id)) resume = { id: last.id, reason: "You started this one" };
    else if (next) resume = { id: next, reason: `Next in ${choice.path.title}` };
  }

  const due = dueReviewKeys(progress).filter(key => reviewQuestionByKey.has(key)).length;

  return (
    <div className={styles.continue}>
      {due > 0 && (
        <Link className={`${styles.tile} ${styles.due}`} href="/review">
          <small>Spaced review</small>
          <strong>{due} {due === 1 ? "decision" : "decisions"} to revisit</strong>
          <span>A few minutes now keeps the reasoning from fading.</span>
        </Link>
      )}
      {resume && (
        <Link className={styles.tile} href={getTopicById(resume.id).href}>
          <small>Continue where you left off</small>
          <strong>{libraryDetails[resume.id].title}</strong>
          <span>{resume.reason} · {getTopicById(resume.id).meta.readingTime}</span>
        </Link>
      )}
      {learningPaths.map(path => {
        const done = path.steps.filter(isRead).length;
        const next = nextUnread(path, isRead) ?? path.steps[0];
        return (
          <Link key={path.slug} className={styles.tile} href={getTopicById(next).href} onClick={() => updateProgress(p => setActivePath(p, path.slug))}>
            <small>Path · {done} of {path.steps.length} read</small>
            <strong>{path.title}</strong>
            <span>{done === 0 ? `Start with ${libraryDetails[next].title}` : done === path.steps.length ? "Complete · review from the start" : `Next: ${libraryDetails[next].title}`}</span>
          </Link>
        );
      })}
    </div>
  );
}
