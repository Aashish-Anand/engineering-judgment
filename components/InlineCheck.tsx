"use client";

import { useId, useState } from "react";
import styles from "./InlineCheck.module.css";

export type InlineCheckOption = {
  label: string;
  isCorrect: boolean;
  explanation: string;
};

type InlineCheckProps = {
  question: string;
  badge?: string;
  options: InlineCheckOption[];
  className?: string;
};

export function InlineCheck({ question, badge = "Concept check", options, className = "" }: InlineCheckProps) {
  const id = useId();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const selected = selectedIdx === null ? null : options[selectedIdx];
  const correct = options.find(option => option.isCorrect);
  const prompt = question.replace(/^Architectural Gut Check(?:\s*·\s*[^:]+)?:\s*/i, "");

  return (
    <section className={`${styles.check} ${className}`} aria-label={prompt}>
      <div className={styles.header}>
        <span className={styles.kicker}>{badge}</span>
        <button type="button" className={styles.toggle} aria-expanded={!collapsed} aria-controls={`${id}-content`} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "Show question +" : "Hide −"}
        </button>
      </div>
      <div id={`${id}-content`} hidden={collapsed}>
        <h3 id={`${id}-question`} className={styles.question}>{prompt}</h3>
        <p className={styles.hint}>Pause here. Choose the response you would use in production.</p>
        <fieldset className={styles.options} aria-labelledby={`${id}-question`} disabled={submitted}>
          <legend className="sr-only">Choose the best response</legend>
          {options.map((option, index) => (
            <label key={index} className={`${styles.option} ${selectedIdx === index ? styles.selected : ""} ${submitted && option.isCorrect ? styles.correct : ""} ${submitted && selectedIdx === index && !option.isCorrect ? styles.incorrect : ""}`}>
              <input type="radio" name={id} checked={selectedIdx === index} onChange={() => setSelectedIdx(index)} />
              <span className={styles.letter} aria-hidden="true">{String.fromCharCode(65 + index)}</span>
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
        {submitted && selected && (
          <div className={styles.feedback} role="status">
            <strong>{selected.isCorrect ? "Correct — here’s the reasoning." : "Reconsider this trade-off."}</strong>
            <p>{selected.explanation}</p>
            {!selected.isCorrect && correct && <p><strong>Best response:</strong> {correct.label}<br />{correct.explanation}</p>}
          </div>
        )}
        <div className={styles.actions}>
          <span>{submitted ? "A checkpoint for this section · No score" : "One question · No score"}</span>
          {submitted ? (
            <button type="button" className={styles.retry} onClick={() => { setSelectedIdx(null); setSubmitted(false); }}>Try again ↻</button>
          ) : (
            <button type="button" className={styles.submit} disabled={selectedIdx === null} onClick={() => setSubmitted(true)}>Check answer →</button>
          )}
        </div>
      </div>
    </section>
  );
}
