"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./DiagramKit.module.css";

type MotionState = "static" | "armed" | "play";

/**
 * Plays a diagram's entrance animation once it scrolls into view.
 * Server HTML stays fully visible ("static"); motion is only armed in the browser,
 * only for diagrams still below the fold, and never under prefers-reduced-motion.
 */
export function DiagramMotion({ title, children }: { title: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<MotionState>("static");
  const [run, setRun] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    // Arming hides the elements for the entrance; it must happen after hydration, so the effect sets state once.
    setState("armed");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setState("play"); observer.disconnect(); }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function replay() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setRun(n => n + 1);
    setState("play");
  }

  return (
    <div ref={ref} className={styles.motion} data-motion={state}>
      <div className={styles.title}>
        <span>{title}</span>
        {state === "play" && <button type="button" className={styles.replay} onClick={replay}>↺ Replay</button>}
      </div>
      <div key={run}>{children}</div>
    </div>
  );
}
