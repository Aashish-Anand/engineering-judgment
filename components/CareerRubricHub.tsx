"use client";

import { useState } from "react";
import {
  interviewAnswer,
  levelExpectations,
  followUpQuestions,
} from "@/data/topics/safely-migrate-production-database";
import { ExpandableQuestion } from "@/components/ExpandableQuestion";

export function CareerRubricHub() {
  const [selectedLevelIdx, setSelectedLevelIdx] = useState<number>(2); // Default to Staff level
  const [showSynthesis, setShowSynthesis] = useState<boolean>(true);

  const currentLevel = levelExpectations[selectedLevelIdx] ?? levelExpectations[0];

  return (
    <div className="my-8 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm select-none" aria-hidden="true">
              🎯
            </span>
            <span className="font-sans font-bold text-base sm:text-lg text-slate-900 tracking-tight">
              Engineering Level Expectations &amp; Interview Synthesis
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
            STAFF+ EVALUATION
          </span>
        </div>

        {/* Level selector tabs */}
        <div className="flex items-center gap-1.5">
          {levelExpectations.map((level, idx) => {
            const isSelected = selectedLevelIdx === idx;
            return (
              <button
                key={level.title}
                type="button"
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

      <div className="p-5 sm:p-6 space-y-6">
        {/* Level rubric card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <h4 className="font-sans font-bold text-sm sm:text-base text-slate-900 m-0">
              {currentLevel.title} Bar: {currentLevel.description}
            </h4>
            <span className="font-mono text-[11px] text-slate-500">Evaluation Rubric</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {currentLevel.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 bg-white border border-slate-200/80 rounded-lg text-xs text-slate-700"
              >
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate 60-Second Verbal Synthesis (Collapsible) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSynthesis((prev) => !prev)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🎙️</span>
              <span className="font-sans font-bold text-sm text-slate-900">
                Candidate 60-Second Architecture Synthesis
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono font-bold">
              {showSynthesis ? "Hide ▲" : "Show ▼"}
            </span>
          </button>

          {showSynthesis && (
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-4">
              <p className="font-sans text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-0">
                {interviewAnswer}
              </p>

              {/* Whiteboard reasoning chain */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-[11px] text-slate-400 uppercase font-bold mr-1">
                  Whiteboard Chain:
                </span>
                {[
                  { label: "1. Constraint", color: "bg-blue-50 text-blue-700 border-blue-200" },
                  { label: "2. Synchronize (CDC)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  { label: "3. Backfill (Keyset)", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
                  { label: "4. Validate (Shadow)", color: "bg-purple-50 text-purple-700 border-purple-200" },
                  { label: "5. Cutover (Reverse CDC)", color: "bg-amber-50 text-amber-800 border-amber-200" },
                ].map((step, idx, arr) => (
                  <span key={step.label} className="inline-flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded border text-[11px] font-mono font-semibold ${step.color}`}>
                      {step.label}
                    </span>
                    {idx < arr.length - 1 && <span className="text-slate-300">→</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interviewer Follow-ups Accordion */}
        <div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Interviewer Follow-ups &amp; Deep-Dive Probes
          </span>
          <div className="bg-white border border-slate-200 rounded-xl px-4 divide-y divide-slate-100">
            {followUpQuestions.map((qa) => (
              <ExpandableQuestion key={qa.question} question={qa.question} answer={qa.answer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
