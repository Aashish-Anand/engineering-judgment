"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import neo from "@/components/Neo.module.css";

export type BriefTab = { label: string; content: ReactNode; quickReference?: boolean };

/**
 * The article's opening brief as horizontal tabs (same pattern as FailureTabs).
 * Every panel is rendered (unselected ones `hidden`), so search, print, and no-JS readers still get all of them.
 */
export function BriefTabs({ tabs }: { tabs: BriefTab[] }) {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  function onKeyDown(event: KeyboardEvent) {
    const last = tabs.length - 1;
    const next = { ArrowRight: selected + 1, ArrowLeft: selected - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const index = (next + tabs.length) % tabs.length;
    setSelected(index);
    buttons.current[index]?.focus();
  }

  return (
    <>
      <div role="tablist" aria-label="Brief sections" className={neo.briefTabList} onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            ref={el => { buttons.current[i] = el; }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === selected}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === selected ? 0 : -1}
            className={neo.briefTab}
            onClick={() => setSelected(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== selected}
          tabIndex={0}
          className={neo.briefPanel}
          data-quick-reference={tab.quickReference || undefined}
        >
          <p className={neo.briefPrintLabel} aria-hidden="true">{tab.label}</p>
          {tab.content}
        </div>
      ))}
    </>
  );
}
