"use client";

import { useState } from "react";
import type { LevelData } from "@/data/types";

export type WhiteboardStep = {
  label: string;
  color?: string;
};

type CareerRubricHubProps = {
  levels: LevelData[];
  whiteboardChain?: WhiteboardStep[];
};

/** The engineering level rubric every blueprint shows in its interview corner. */
export function CareerRubricHub({ levels, whiteboardChain }: CareerRubricHubProps) {
  const [selectedLevelIdx, setSelectedLevelIdx] = useState<number>(Math.min(2, levels.length - 1));
  const currentLevel = levels[selectedLevelIdx] ?? levels[0];

  return (
    <div className="my-6 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden" aria-label="Engineering level rubric" role="group">
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <span className="font-sans font-bold text-base sm:text-lg text-slate-900 tracking-tight">
            Engineering level rubric
          </span>
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
            MID-LEVEL → STAFF
          </span>
        </div>

        <div className="flex items-center gap-1.5" role="tablist" aria-label="Engineering level">
          {levels.map((level, idx) => {
            const isSelected = selectedLevelIdx === idx;
            return (
              <button
                key={level.title}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedLevelIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {level.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5" role="tabpanel">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h4 className="font-sans font-bold text-sm sm:text-base text-slate-900 m-0">
            {currentLevel.title}: {currentLevel.description}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {currentLevel.items.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 p-2 bg-white border border-slate-200/80 rounded-lg text-xs text-slate-700 font-sans"
              >
                <span className="text-emerald-700 font-bold shrink-0" aria-hidden="true">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {whiteboardChain && whiteboardChain.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-[11px] text-slate-600 uppercase font-bold mr-1">
              Whiteboard chain:
            </span>
            {whiteboardChain.map((step, idx, arr) => (
              <span key={step.label} className="inline-flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded border text-[11px] font-mono font-semibold ${
                    step.color || "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {step.label}
                </span>
                {idx < arr.length - 1 && <span className="text-slate-600" aria-hidden="true">→</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
