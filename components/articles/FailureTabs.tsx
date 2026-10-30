"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { FailureMode } from "./BlueprintSections";
import styles from "./BlueprintSections.module.css";

/**
 * Failure modes as tabs: names on one side, the selected mode's signal and response on the other.
 * Every panel is rendered (unselected ones `hidden`), so search, print, and no-JS readers still get all of them.
 */
export function FailureTabs({ failures }: { failures: FailureMode[] }) {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  function onKeyDown(event: KeyboardEvent) {
    const last = failures.length - 1;
    const next = { ArrowDown: selected + 1, ArrowRight: selected + 1, ArrowUp: selected - 1, ArrowLeft: selected - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const index = (next + failures.length) % failures.length;
    setSelected(index);
    tabs.current[index]?.focus();
  }

  return (
    <div className={styles.failureTabs}>
      <div role="tablist" aria-label="Failure modes" aria-orientation="vertical" className={styles.failureList} onKeyDown={onKeyDown}>
        {failures.map((failure, i) => (
          <button
            key={failure.title}
            ref={el => { tabs.current[i] = el; }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === selected}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === selected ? 0 : -1}
            className={styles.failureTab}
            onClick={() => setSelected(i)}
          >
            <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            {failure.title}
          </button>
        ))}
      </div>
      {failures.map((failure, i) => (
        <div key={failure.title} role="tabpanel" id={`${id}-panel-${i}`} aria-labelledby={`${id}-tab-${i}`} hidden={i !== selected} tabIndex={0} className={styles.failurePanel}>
          <h3>{failure.title}</h3>
          <p className={styles.failureLabel}>What happens</p>
          <p>{failure.explanation}</p>
          {failure.signal && <><p className={styles.failureLabel}>How you notice</p><p>{failure.signal}</p></>}
          {failure.response && <><p className={styles.failureLabel}>What to do</p><p>{failure.response}</p></>}
        </div>
      ))}
    </div>
  );
}
