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
      <div className="my-8 p-6 bg-white border-[1.5px] border-[#171717] rounded-2xl shadow-[3px_4px_0px_#171717] text-center">
        <div className="text-3xl mb-2" aria-hidden="true">
          {isPerfect ? "🎯" : "📝"}
        </div>
        <h4 className="font-hand text-2xl font-bold text-[#171717] mb-1">
          Judgment Check Complete
        </h4>
        <p className="text-sm font-sans text-[#4B5563] mb-4">
          You scored <strong className="text-[#171717]">{correctCount} of {questions.length}</strong> correct.
          {isPerfect
            ? " Outstanding! You have crisp intuition for these production failure modes."
            : " Good practice! Review the explanations above to sharpen your edge."}
        </p>
        <button
          onClick={handleReset}
          type="button"
          className="doodle-btn text-sm py-1.5 px-4 bg-[#FFF0B8]"
        >
          Try Again ↺
        </button>
      </div>
    );
  }

  return (
    <div className="my-8 p-5 sm:p-6 bg-white border-[1.5px] border-[#171717] rounded-2xl shadow-[3px_4px_0px_#171717]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#171717]/20">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            🧠
          </span>
          <h4 className="font-hand text-xl font-bold text-[#171717] m-0">
            {title}
          </h4>
        </div>
        <span className="text-xs font-mono font-bold text-[#6B7280]">
          Scenario {currentIdx + 1} of {questions.length}
        </span>
      </div>

      {/* Scenario text */}
      <p className="font-sans font-semibold text-sm sm:text-base text-[#171717] mb-4 leading-relaxed">
        {q.scenario}
      </p>

      {/* Options */}
      <div className="space-y-2.5 mb-4">
        {q.options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = selectedOption === idx;
          let optionStyles =
            "bg-[#FAF9F5] border-[#171717]/30 hover:border-[#171717] hover:bg-white";

          if (hasSubmitted) {
            if (opt.isCorrect) {
              optionStyles =
                "bg-[#DFF3DF] border-[#16A34A] text-[#16A34A] font-semibold";
            } else if (isSelected && !opt.isCorrect) {
              optionStyles =
                "bg-[#FDE8E8] border-[#DC2626] text-[#DC2626]";
            } else {
              optionStyles = "bg-[#FAF9F5]/60 border-[#171717]/20 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={hasSubmitted}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-3 rounded-xl border-[1.5px] text-xs sm:text-sm font-sans transition-all flex items-start gap-3 ${optionStyles}`}
            >
              <span className="font-hand font-bold text-xs shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center bg-white text-[#171717]">
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
          className={`p-4 rounded-xl border-[1.5px] mb-4 text-xs sm:text-sm leading-relaxed ${
            q.options[selectedOption].isCorrect
              ? "bg-[#DFF3DF] border-[#16A34A] text-[#14532D]"
              : "bg-[#FFF0B8] border-[#171717] text-[#171717]"
          }`}
        >
          <div className="font-hand font-bold text-sm mb-1 flex items-center gap-1.5">
            {q.options[selectedOption].isCorrect ? (
              <span>✓ Correct judgment!</span>
            ) : (
              <span>💡 Architecture rationale:</span>
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
            className="doodle-btn text-xs py-1.5 px-4 bg-[#FFF0B8]"
          >
            {currentIdx + 1 === questions.length ? "Finish →" : "Next Scenario →"}
          </button>
        </div>
      )}
    </div>
  );
}
