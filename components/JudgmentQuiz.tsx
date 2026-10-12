"use client";

import { useState } from "react";

export type QuizOption = {
  text: string;
  isCorrect: boolean;
  explanation: string;
};

export type QuizQuestion = {
  scenario: string;
  options: QuizOption[];
};

type JudgmentQuizProps = {
  title?: string;
  questions: QuizQuestion[];
};

export function JudgmentQuiz({
  title = "Test Your Judgment",
  questions,
}: JudgmentQuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const q = questions[currentIdx];
  const isFinished = currentIdx >= questions.length;

  function handleSelect(optionIdx: number) {
    if (hasSubmitted) return;
    setSelectedOption(optionIdx);
    setHasSubmitted(true);
    if (q.options[optionIdx].isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
  }

  function handleNext() {
    setSelectedOption(null);
    setHasSubmitted(false);
    setCurrentIdx((prev) => prev + 1);
  }

  function handleReset() {
    setCurrentIdx(0);
    setSelectedOption(null);
    setHasSubmitted(false);
    setCorrectCount(0);
  }

  if (isFinished) {
    const isPerfect = correctCount === questions.length;
    return (
      <div className="my-4 p-4 bg-white border border-slate-200 rounded-xl shadow-2xs text-center">
        <div className="text-xl mb-1" aria-hidden="true">
          {isPerfect ? "🎯" : "📝"}
        </div>
        <h4 className="font-sans text-sm sm:text-base font-bold text-slate-900 mb-1">
          Judgment Check Complete
        </h4>
        <p className="text-xs font-sans text-slate-600 mb-2.5 max-w-md mx-auto">
          Score: <strong className="text-slate-900">{correctCount} of {questions.length}</strong> correct.
          {isPerfect
            ? " Outstanding production intuition."
            : " Review the rationale above to sharpen your architectural trade-offs."}
        </p>
        <button
          onClick={handleReset}
          type="button"
          className="font-sans text-xs font-semibold py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
        >
          Try Again ↺
        </button>
      </div>
    );
  }

  return (
    <div className="my-4 p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
      {/* Compact Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="text-sm select-none" aria-hidden="true">
            🧠
          </span>
          <h4 className="font-sans text-xs sm:text-sm font-bold text-slate-900 m-0">
            {title}
          </h4>
        </div>
        <div className="flex items-center gap-1.5">
          {questions.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === currentIdx
                  ? "bg-blue-600 ring-2 ring-blue-200"
                  : i < currentIdx
                  ? "bg-emerald-500"
                  : "bg-slate-200"
              }`}
            />
          ))}
          <span className="text-[10px] font-mono text-slate-400 ml-1">
            {currentIdx + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Scenario text */}
      <p className="font-sans font-semibold text-xs sm:text-[13px] text-slate-800 mb-2.5 leading-snug">
        {q.scenario}
      </p>

      {/* Compact Options */}
      <div className="space-y-1 mb-2.5">
        {q.options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = selectedOption === idx;
          let optionStyles =
            "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300";

          if (hasSubmitted) {
            if (opt.isCorrect) {
              optionStyles =
                "bg-emerald-50 border-emerald-500 text-emerald-950 font-medium ring-1 ring-emerald-500";
            } else if (isSelected && !opt.isCorrect) {
              optionStyles =
                "bg-red-50 border-red-500 text-red-950 font-medium ring-1 ring-red-500";
            } else {
              optionStyles = "bg-white/60 border-slate-200 text-slate-400 opacity-50";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={hasSubmitted}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left py-1.5 px-2.5 rounded-lg border text-xs font-sans transition-all flex items-center gap-2 cursor-pointer ${optionStyles}`}
            >
              <span className="font-mono font-bold text-[10px] shrink-0 w-4 h-4 rounded flex items-center justify-center bg-slate-100 text-slate-700">
                {letter}
              </span>
              <span className="leading-snug flex-1">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation when submitted */}
      {hasSubmitted && selectedOption !== null && (
        <div
          className={`p-2.5 rounded-lg border mb-2.5 text-xs leading-relaxed ${
            q.options[selectedOption].isCorrect
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-amber-50 border-amber-200 text-amber-950"
          }`}
        >
          <div className="font-sans font-bold text-[11px] mb-0.5">
            {q.options[selectedOption].isCorrect
              ? "✓ Senior Engineering Verdict:"
              : "⚠️ Architectural Trap:"}
          </div>
          <p className="font-sans text-[11px] leading-snug mb-0 text-slate-800">
            {q.options[selectedOption].explanation}
          </p>
        </div>
      )}

      {/* Next button */}
      {hasSubmitted && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            type="button"
            className="font-sans text-xs font-bold py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>{currentIdx < questions.length - 1 ? "Next Scenario" : "See Final Score"}</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
