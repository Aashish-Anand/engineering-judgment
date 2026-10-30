import type { Metadata } from "next";
import { socialMetadata } from "@/data/site";
import { ReviewSession } from "@/components/learning/ReviewSession";
import neo from "@/components/Neo.module.css";

const title = "Review your decisions";
const description = "Quiz decisions you missed come back at spaced intervals so the reasoning sticks.";
export const metadata: Metadata = { title, description, robots: { index: false }, ...socialMetadata({ title, description, path: "/review" }) };

export default function ReviewPage() {
  return (
    <div className={`quiz-page page-shell ${neo.surface} ${neo.quizPage}`}>
      <header className="quiz-page-header"><p className="eyebrow">Spaced review</p><h1>Revisit the decisions that matter.</h1><p>Missed decisions return after 3 days; correct ones after 7 and then 21 days, until they stick. Everything stays in this browser.</p></header>
      <ReviewSession />
    </div>
  );
}
