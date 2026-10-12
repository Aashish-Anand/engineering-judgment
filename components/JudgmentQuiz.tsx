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
      <div className="my-8 p-6 bg-white border border-slate-200 rounded-xl shadow-xs text-center">
        <div className="text-3xl mb-2" aria-hidden="true">
          {isPerfect ? "🎯" : "📝"}
        </div>
        <h4 className="font-sans text-xl font-bold text-slate-900 mb-1">
          Judgment Check Complete
        </h4>
        <p className="text-sm font-sans text-slate-600 mb-4">
          You scored <strong className="text-slate-900">{correctCount} of {questions.length}</strong> correct.
          {isPerfect
            ? " Outstanding! You have crisp intuition for these production failure modes."
            : " Good practice! Review the explanations above to sharpen your edge."}
        </p>
        <button
          onClick={handleReset}
          type="button"
          className="font-sans text-xs font-semibold py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
        >
          Try Again ↺
        </button>
      </div>
    );
  }

  return (
    <div className="my-8 p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            🧠
          </span>
          <h4 className="font-sans text-base sm:text-lg font-bold text-slate-900 m-0">
            {title}
          </h4>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400">
          Scenario {currentIdx + 1} of {questions.length}
        </span>
      </div>

      {/* Scenario text */}
      <p className="font-sans font-semibold text-sm sm:text-base text-slate-800 mb-4 leading-relaxed">
        {q.scenario}
      </p>

      {/* Options */}
      <div className="space-y-2.5 mb-4">
        {q.options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = selectedOption === idx;
          let optionStyles =
            "bg-white border-slate-200 text-slate-700 hover:bg-slate-50";

          if (hasSubmitted) {
            if (opt.isCorrect) {
              optionStyles =
                "bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500";
            } else if (isSelected && !opt.isCorrect) {
              optionStyles =
                "bg-red-50 border-red-500 text-red-950 ring-1 ring-red-500";
            } else {
              optionStyles = "bg-slate-50/60 border-slate-200 text-slate-400 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={hasSubmitted}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm font-sans transition-all flex items-start gap-3 cursor-pointer ${optionStyles}`}
            >
              <span className="font-mono font-bold text-xs shrink-0 w-5 h-5 rounded flex items-center justify-center bg-slate-100 text-slate-700">
                {letter}
              </span>
              <span className="leading-snug pt-0.5">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation when submitted */}
      {hasSubmitted && selectedOption !== null && (
        <div
          className={`p-4 rounded-lg border mb-4 text-xs sm:text-sm leading-relaxed ${
            q.options[selectedOption].isCorrect
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-amber-50 border-amber-200 text-amber-950"
          }`}
        >
          <div className="font-sans font-bold text-xs sm:text-sm mb-1 flex items-center gap-1.5">
            {q.options[selectedOption].isCorrect ? (
              <span className="text-emerald-700">✓ Correct judgment!</span>
            ) : (
              <span className="text-amber-800">💡 Architecture rationale:</span>
            )}
          </div>
          <p className="m-0 font-sans">
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
            className="font-sans text-xs font-semibold py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            {currentIdx + 1 === questions.length ? "Finish →" : "Next Scenario →"}
          </button>
        </div>
      )}
    </div>
  );
}
