"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { QuizQuestion } from "@/components/JudgmentQuiz";

type Props = { title?: string; questions: QuizQuestion[]; quizHref: string };

export function ArticleQuizEntry({ title = "Test your judgment", questions, quizHref }: Props) {
  const entryRef = useRef<HTMLDivElement>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    let previouslyDismissed = false;
    const storageKey = `quiz-prompt:${quizHref}`;
    try { previouslyDismissed = sessionStorage.getItem(storageKey) === "dismissed"; } catch { /* Storage is optional. */ }
    const update = () => {
      const article = entryRef.current?.closest("article");
      if (!article || previouslyDismissed) return;
      const start = article.getBoundingClientRect().top + window.scrollY;
      const distance = Math.max(1, article.scrollHeight - window.innerHeight);
      const progress = (window.scrollY - start) / distance;
      const entry = entryRef.current!.getBoundingClientRect();
      setShowPrompt(progress >= 0.65 && entry.top > window.innerHeight);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [quizHref, dismissed]);

  function dismiss() {
    setDismissed(true);
    setShowPrompt(false);
    try { sessionStorage.setItem(`quiz-prompt:${quizHref}`, "dismissed"); } catch { /* Storage is optional. */ }
  }

  return (
    <>
      <div ref={entryRef} className="quiz-entry">
        <span className="eyebrow">Put the reasoning into practice</span>
        <h3>{title}</h3>
        <p>Work through {questions.length} scenarios from this blueprint. Choose a response, then unpack the trade-off behind it.</p>
        <Link href={quizHref} aria-label={`Take the quiz: ${title}`} className="editorial-button">Take the quiz <span aria-hidden="true">↗</span></Link>
        <span className="quiz-entry-note">Self-paced · Explanations for every answer</span>
      </div>
      {showPrompt && !dismissed && (
        <aside className="quiz-reading-prompt" aria-label="Quiz invitation">
          <button type="button" className="quiz-prompt-dismiss" onClick={dismiss} aria-label="Dismiss quiz invitation">×</button>
          <span className="eyebrow">Ready to test your judgment?</span>
          <p>Apply what you’ve read to {questions.length} production scenarios.</p>
          <Link href={quizHref} onClick={dismiss} className="text-link">Open this article’s quiz ↗</Link>
        </aside>
      )}
    </>
  );
}
