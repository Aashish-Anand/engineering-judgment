"use client";

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { DiagramFigure, Sequence, type SequenceStep } from "./DiagramKit";
import { Range } from "./Range";
import styles from "./DiagramKit.module.css";

export type ScrubFrame = { rows: number[]; caption: string };

const subscribe = () => () => {};

/**
 * A sequence diagram walked one step at a time with Prev/Next buttons and a slider.
 * The server HTML (and a browser without JavaScript) shows the whole sequence with every
 * step's caption as a numbered list; the controls appear once the page hydrates.
 */
export function StepScrubber({ title, caption, actors, steps, window: hold, frames }: { title: string; caption?: ReactNode; actors: string[]; steps: SequenceStep[]; window?: { from: number; to: number; label: string }; frames: ScrubFrame[] }) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [current, setCurrent] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const last = frames.length - 1;
  const go = (to: (current: number) => number) => {
    setCurrent(c => Math.max(0, Math.min(last, to(c))));
    // On narrow screens the sequence scrolls sideways; bring the focused message into view once it renders.
    requestAnimationFrame(() => {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      root.current?.querySelector('[aria-current="step"] > div')?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "nearest", inline: "center" });
    });
  };
  const frame = frames[current];
  const position = `Step ${current + 1} of ${frames.length}`;

  if (!hydrated) {
    return (
      <DiagramFigure scroll animate={false} title={title} caption={caption}>
        <Sequence actors={actors} steps={steps} window={hold} />
        <div className={styles.walkthrough}>
          <h4>Step by step</h4>
          <ol>{frames.map(f => <li key={f.caption}>{f.caption}</li>)}</ol>
        </div>
      </DiagramFigure>
    );
  }

  // aria-disabled keeps the button focusable at either end, so keyboard focus is not dropped.
  const button = (label: string, delta: number, disabled: boolean) => (
    <button type="button" className={styles.stepButton} aria-disabled={disabled} onClick={() => !disabled && go(c => c + delta)}>{label}</button>
  );

  return (
    <div ref={root}>
      <DiagramFigure
        scroll
        animate={false}
        title={title}
        caption={caption}
        controls={<div className={styles.scrubber}>
          {button("← Prev", -1, current === 0)}
          <Range label="Step" value={current + 1} min={1} max={frames.length} valueText={`${current + 1} of ${frames.length}`} onChange={n => go(() => n - 1)} />
          {button("Next →", 1, current === last)}
          <p className={styles.stepCaption} aria-live="polite"><b>{position}</b>{frame.caption}</p>
        </div>}
      >
        <Sequence actors={actors} steps={steps} window={hold} focus={frame.rows} />
      </DiagramFigure>
    </div>
  );
}
