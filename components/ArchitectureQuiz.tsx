"use client";

import { useRef, useState } from "react";

export type QuizOption = { text: string; isCorrect: boolean; explanation: string };
export type QuizQuestion = { scenario: string; options: QuizOption[] };
type Props = { title?: string; questions: QuizQuestion[] };

export function ArchitectureQuiz({ title = "Test your judgment", questions }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const finished = currentIdx >= questions.length;
  const submitted = answers.length > currentIdx;
  const score = answers.filter((answer, index) => questions[index].options[answer].isCorrect).length;

  function moveTo(index: number) {
    setCurrentIdx(index);
    setSelectedOption(null);
    requestAnimationFrame(() => { headingRef.current?.focus(); });
  }

  if (!questions.length) return <p>No scenarios are available yet.</p>;

  if (finished) {
    return (
      <section className="judgment-quiz" aria-label="Quiz results">
        <span className="eyebrow">Practice complete</span>
        <h2 ref={headingRef} tabIndex={-1}>You got {score} of {questions.length} decisions right.</h2>
        <p className="quiz-summary">{score === questions.length ? "You identified the key trade-offs in every scenario. Review the reasoning below to reinforce the model." : "Use the review below to revisit the trade-offs behind each decision."}</p>
        <div className="quiz-review">
          {questions.map((question, index) => {
            const chosen = question.options[answers[index]];
            const correct = question.options.find(option => option.isCorrect)!;
            return <div key={index} className="quiz-review-item"><span className="eyebrow">Scenario {index + 1} · {chosen.isCorrect ? "Correct" : "Revisit"}</span><h3>{question.scenario}</h3><p><strong>Your answer:</strong> {chosen.text}</p>{!chosen.isCorrect && <p><strong>Best answer:</strong> {correct.text}</p>}<p>{correct.explanation}</p></div>;
          })}
        </div>
        <button type="button" className="editorial-button" onClick={() => { setAnswers([]); moveTo(0); }}>Try again ↻</button>
      </section>
    );
  }

  const question = questions[currentIdx];
  const selected = selectedOption === null ? null : question.options[selectedOption];
  const correct = question.options.find(option => option.isCorrect)!;

  return (
    <section className="judgment-quiz" aria-label={title}>
      <div className="quiz-progress-label"><span className="eyebrow">{title}</span><span>Scenario {currentIdx + 1} of {questions.length}</span></div>
      <div className="quiz-progress-track" role="progressbar" aria-label="Answered scenarios" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answers.length}><span style={{ width: `${answers.length / questions.length * 100}%` }} /></div>
      <h2 ref={headingRef} tabIndex={-1} id="quiz-scenario">{question.scenario}</h2>
      <fieldset aria-labelledby="quiz-scenario" disabled={submitted} className="quiz-options">
        <legend className="sr-only">Choose the best response</legend>
        {question.options.map((option, index) => (
          <label key={index} className={`quiz-option ${selectedOption === index ? "quiz-option-selected" : ""} ${submitted && option.isCorrect ? "quiz-option-correct" : ""} ${submitted && selectedOption === index && !option.isCorrect ? "quiz-option-incorrect" : ""}`}>
            <input type="radio" name={`scenario-${currentIdx}`} value={index} checked={selectedOption === index} onChange={() => setSelectedOption(index)} />
            <span className="quiz-option-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{option.text}</span>
          </label>
        ))}
      </fieldset>
      {submitted && selected && (
        <div className="quiz-feedback" role="status">
          <strong>{selected.isCorrect ? "Correct — here’s why." : "There’s a safer choice."}</strong>
          <p>{selected.explanation}</p>
          {!selected.isCorrect && <p><strong>Best answer:</strong> {correct.text}<br />{correct.explanation}</p>}
        </div>
      )}
      <div className="quiz-actions">
        <span>{submitted ? "Take a moment to consider the reasoning." : "Choose an answer before checking it."}</span>
        {submitted ? <button type="button" className="editorial-button" onClick={() => moveTo(currentIdx + 1)}>{currentIdx === questions.length - 1 ? "See your results" : "Next scenario"} →</button> : <button type="button" className="editorial-button" disabled={selectedOption === null} onClick={() => { if (selectedOption !== null) setAnswers([...answers, selectedOption]); }}>Check answer →</button>}
      </div>
    </section>
  );
}
