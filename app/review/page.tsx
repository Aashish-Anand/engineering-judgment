import type { Metadata } from "next";
import { ReviewSession } from "@/components/learning/ReviewSession";
import neo from "@/components/Neo.module.css";

export const metadata: Metadata = {
  title: "Review your decisions",
  description: "Quiz decisions you missed come back at spaced intervals so the reasoning sticks.",
  robots: { index: false },
};

export default function ReviewPage() {
  return (
    <div className={`quiz-page page-shell ${neo.surface} ${neo.quizPage}`}>
      <header className="quiz-page-header"><p className="eyebrow">Spaced review</p><h1>Revisit the decisions that matter.</h1><p>Missed decisions return after 3 days; correct ones after 7 and then 21 days, until they stick. Everything stays in this browser.</p></header>
      <ReviewSession />
    </div>
  );
}
