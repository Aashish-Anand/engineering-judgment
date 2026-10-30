"use client";

import Link from "next/link";
import { useState } from "react";
import { ArchitectureQuiz } from "@/components/ArchitectureQuiz";
import { getTopicById } from "@/data/topics/catalog";
import { libraryDetails } from "@/data/library";
import { dueReviewKeys, nextReviewAt } from "@/data/progress";
import { REVIEW_SESSION_SIZE, reviewQuestionByKey } from "@/data/review";
import { useProgress } from "@/components/useProgress";
import styles from "./Learning.module.css";

/**
 * One review session of due decisions across all articles. The list is frozen when the session starts,
 * because answering re-schedules items and would otherwise reshuffle the questions mid-session.
 */
export function ReviewSession() {
  const progress = useProgress();
  const [session, setSession] = useState<string[] | null>(null);
  const due = dueReviewKeys(progress).filter(key => reviewQuestionByKey.has(key));

  // Freeze the first non-empty due list (progress loads after hydration). Adjusting state during render
  // is React's documented pattern for deriving state once from changing input.
  if (session === null && due.length) setSession(due.slice(0, REVIEW_SESSION_SIZE));

  if (!session) {
    const next = nextReviewAt(progress);
    const on = next ? new Date(next).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) : undefined;
    return (
      <div className={styles.reviewEmpty}>
        <h2>Nothing to review right now.</h2>
        <p>{on ? `Your next decision comes back on ${on}.` : "Take any article's quiz. Decisions you miss come back here after 3 days; ones you get right return after 7 and then 21 days."}</p>
        <Link className={styles.start} href="/paths">Pick a learning path →</Link>
      </div>
    );
  }

  const items = session.map(key => reviewQuestionByKey.get(key)!);
  return (
    <>
      <p className={styles.reviewCount}>{items.length} {items.length === 1 ? "decision" : "decisions"} due{due.length > session.length ? ` · ${due.length - session.length} more after this session` : ""}</p>
      <ArchitectureQuiz
        title="Spaced review"
        questions={items.map(item => item.question)}
        reviewKeys={session}
        sources={items.map(item => ({ title: libraryDetails[item.topicId].title, href: getTopicById(item.topicId).href }))}
      />
    </>
  );
}
