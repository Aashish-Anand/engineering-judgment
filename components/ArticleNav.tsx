"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { getTopicById, type TopicId } from "@/data/topics/catalog";
import { libraryDetails } from "@/data/library";
import { choosePath, pathsForTopic } from "@/data/learning-paths";
import { markRead, markUnread, recordVisit, setActivePath } from "@/data/progress";
import { updateProgress, useProgress } from "@/components/useProgress";
import styles from "@/components/learning/Learning.module.css";

type ArticleNavProps = {
  currentId: TopicId;
};

/**
 * End-of-article navigation through the reader's learning path. Records the visit, marks the article
 * read once this panel scrolls into view, and offers the next step in the path the reader is following.
 */
export function ArticleNav({ currentId }: ArticleNavProps) {
  const progress = useProgress();
  const ref = useRef<HTMLElement>(null);
  const isRead = Boolean(progress.read[currentId]);
  const choice = choosePath(currentId, progress.activePath);
  const others = pathsForTopic(currentId).filter(option => option.path.slug !== choice?.path.slug);

  useEffect(() => { updateProgress(p => recordVisit(p, currentId)); }, [currentId]);

  // Reaching the end of the article counts as reading it. Once per page view, so "unmark" sticks.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { updateProgress(p => markRead(p, currentId)); observer.disconnect(); }
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [currentId]);

  if (!choice) return null;
  const { path, index } = choice;
  const previous = index > 0 ? getTopicById(path.steps[index - 1]) : null;
  const next = index < path.steps.length - 1 ? getTopicById(path.steps[index + 1]) : null;
  const follow = () => updateProgress(p => setActivePath(p, path.slug));

  return (
    <nav ref={ref} className={styles.pathNav} aria-label="Learning path">
      <div className={styles.pathHead}>
        <div><p>Learning path · step {index + 1} of {path.steps.length}</p><h2>{path.title}</h2></div>
        <Link href={`/paths#${path.slug}`}>All learning paths →</Link>
      </div>
      <ol className={styles.steps}>
        {path.steps.map((id, i) => {
          const topic = getTopicById(id);
          const state = id === currentId ? "current" : progress.read[id] ? "read" : "todo";
          return (
            <li key={id} data-state={state}>
              <Link href={topic.href} onClick={follow} aria-current={id === currentId ? "page" : undefined}>
                <b aria-hidden="true">{state === "read" ? "✓" : i + 1}</b>
                <span>{libraryDetails[id].title}</span>
                <small>{state === "read" ? "Read" : state === "current" ? "You are here" : topic.meta.readingTime}</small>
              </Link>
            </li>
          );
        })}
      </ol>
      <div className={styles.moves}>
        {previous && <Link href={previous.href} onClick={follow}><small>← Previous in path</small>{libraryDetails[previous.id].title}</Link>}
        {next
          ? <Link className={styles.primary} href={next.href} onClick={follow}><small>Next in path →</small>{libraryDetails[next.id].title}</Link>
          : <Link className={styles.primary} href="/paths"><small>Path complete</small>Choose your next path →</Link>}
      </div>
      <div className={styles.pathFoot}>
        <label><input type="checkbox" checked={isRead} onChange={e => updateProgress(p => (e.target.checked ? markRead(p, currentId) : markUnread(p, currentId)))} /> I&apos;ve read this article</label>
        {others.length > 0 && <span>Also in: {others.map(({ path: other }, i) => <span key={other.slug}>{i > 0 && ", "}<button type="button" onClick={() => updateProgress(p => setActivePath(p, other.slug))}>{other.title}</button></span>)}</span>}
      </div>
    </nav>
  );
}
