import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchitectureQuiz } from "@/components/ArchitectureQuiz";
import { socialMetadata } from "@/data/site";
import { getTopicByRoute, getTopicStaticParams } from "@/data/topics/catalog";
import { topicQuizzes } from "@/data/topics/quizzes";
import neo from "@/components/Neo.module.css";

type Props = { params: Promise<{ category: string; slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return getTopicStaticParams(); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const topic = getTopicByRoute(category, slug);
  if (!topic) return {};
  const title = `Quiz: ${topic.meta.title}`;
  const description = `Practice the decisions in ${topic.meta.title}.`;
  return { title, description, ...socialMetadata({ title, description, path: `${topic.href}/quiz` }) };
}
export default async function QuizPage({ params }: Props) {
  const { category, slug } = await params;
  const topic = getTopicByRoute(category, slug);
  if (!topic) notFound();
  return (
    <div className={`quiz-page page-shell ${neo.surface} ${neo.quizPage}`}>
      <Link href={`${topic.href}#judgment-quiz`} className="text-link">← Back to the blueprint</Link>
      <header className="quiz-page-header"><p className="eyebrow">{topic.meta.category} / Judgment practice</p><h1>{topic.meta.title}</h1><p>{topicQuizzes[topic.id].length} production scenarios · Self-paced<br />Read the scenario, make a decision, and examine the reasoning. You can return to the article whenever you need it.</p></header>
      <ArchitectureQuiz title="Practice your judgment" questions={topicQuizzes[topic.id]} topicId={topic.id} />
    </div>
  );
}
