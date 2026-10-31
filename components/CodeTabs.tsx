"use client";

import { useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { CodeBlock } from "@/components/CodeBlock";

export type CodeSample = { code: string; language?: string; filename?: string };

const labels: Record<string, string> = { typescript: "TypeScript", cpp: "C++", java: "Java", python: "Python", go: "Go", lua: "Lua" };
const label = (language = "") => labels[language] ?? language;

/* The reader's preferred language, shared by every CodeTabs on every page through localStorage.
   Same store pattern as components/useProgress.ts: this tab is notified directly, others by the storage event. */

const STORAGE_KEY = "aup:code-language";
const listeners = new Set<() => void>();

function readPreferred() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) listener(); };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}

function choose(language: string) {
  try { localStorage.setItem(STORAGE_KEY, language); } catch { /* still switch this block */ }
  listeners.forEach(listener => listener());
}

/**
 * One example in several languages, as tabs (the ARIA tab pattern, as in BriefTabs). Every panel is rendered and
 * unselected ones are `hidden`, so search and readers without JavaScript still get all of them.
 */
export function CodeTabs({ samples }: { samples: CodeSample[] }) {
  const preferred = useSyncExternalStore(subscribe, readPreferred, () => null);
  const [fallback, setFallback] = useState(0);
  const index = samples.findIndex(sample => sample.language === preferred);
  const selected = index === -1 ? fallback : index;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  function select(i: number) {
    setFallback(i);
    choose(samples[i].language ?? "");
  }

  function onKeyDown(event: KeyboardEvent) {
    const last = samples.length - 1;
    const next = { ArrowRight: selected + 1, ArrowLeft: selected - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const i = (next + samples.length) % samples.length;
    select(i);
    buttons.current[i]?.focus();
  }

  return (
    <div className="code-tabs my-5 rounded-xl border border-slate-800 bg-slate-950 shadow-xs overflow-hidden">
      <div role="tablist" aria-label="Code language" className="flex flex-wrap gap-1 px-2 pt-2 bg-slate-900/90 border-b border-slate-800" onKeyDown={onKeyDown}>
        {samples.map((sample, i) => (
          <button
            key={sample.language}
            ref={el => { buttons.current[i] = el; }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === selected}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === selected ? 0 : -1}
            onClick={() => select(i)}
            className={`px-3 py-1.5 -mb-px border-b-2 font-mono text-xs font-bold cursor-pointer transition-colors ${i === selected ? "border-amber-400 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            {label(sample.language)}
          </button>
        ))}
      </div>
      {samples.map((sample, i) => (
        <div key={sample.language} role="tabpanel" id={`${id}-panel-${i}`} aria-labelledby={`${id}-tab-${i}`} hidden={i !== selected}>
          <CodeBlock {...sample} embedded />
        </div>
      ))}
    </div>
  );
}
