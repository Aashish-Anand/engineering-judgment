"use client";

import { useId } from "react";

/** A labelled slider with its value shown beside the label. Lives in DiagramFigure's `controls` slot. */
export function Range({ label, value, min, max, step = 1, unit = "", valueText, onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; valueText?: string; onChange: (value: number) => void }) {
  const id = useId();
  return (
    <label htmlFor={id}>
      <span>{label}: <output htmlFor={id}>{valueText ?? `${value}${unit}`}</output></span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} aria-valuetext={valueText} onChange={e => onChange(Number(e.target.value))} />
    </label>
  );
}
