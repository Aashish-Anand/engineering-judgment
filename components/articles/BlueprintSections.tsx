import type { ReactNode } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { ArticleQuizEntry } from "@/components/ArticleQuizEntry";
import { RelatedTopics } from "@/components/RelatedTopics";
import { ArticleNav } from "@/components/ArticleNav";
import { CareerRubricHub, type WhiteboardStep } from "@/components/CareerRubricHub";
import type { QuizQuestion } from "@/components/JudgmentQuiz";
import type { TopicId } from "@/data/topics/catalog";
import type { LevelData } from "@/data/types";
import { fixedSections, sectionNumber } from "@/data/topics/article-format";
import { FailureTabs } from "./FailureTabs";
import styles from "./BlueprintSections.module.css";

/*
 * Sections 06–12 of the shared blueprint format (see data/topics/article-format.ts).
 * Every article renders these components so the second half of each blueprint
 * reads, looks, and navigates the same way.
 */

export type DecisionTable = { caption: string; headers: string[]; rows: string[][] };
/** `explanation` says in plain words what goes wrong; `signal` is how you notice; `response` is what to do. */
export type FailureMode = { title: string; explanation: string; signal?: string; response?: string };
export type WrongAnswer = { question: string; explanation: string };

const cx = (...names: (string | undefined)[]) => names.filter(Boolean).join(" ");

/** A captioned table whose first cell in each row is the row header. */
export function DecisionTableView({ caption, headers, rows }: DecisionTable) {
  return <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={caption}>
    <table>
      <caption>{caption}</caption>
      <thead><tr>{headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
      <tbody>{rows.map(([label, ...cells]) => <tr key={label}><th scope="row">{label}</th>{cells.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

/** `tables` holds decision criteria that belong next to the steps, such as when to roll back. */
export function RunbookSection({ steps, intro, tables = [] }: { steps: string[]; intro?: string; tables?: DecisionTable[] }) {
  return <section id="runbook" className={cx(styles.body, styles.runbook)}>
    <SectionHeader number={sectionNumber("runbook")} id="runbook" title={fixedSections.runbook.title} />
    {intro && <p>{intro}</p>}
    <ol>{steps.map(step => <li key={step}>{step}</li>)}</ol>
    {tables.map(table => <DecisionTableView key={table.caption} {...table} />)}
  </section>;
}

export function TradeoffsSection({ tables }: { tables: DecisionTable[] }) {
  return <section id="tradeoffs" className={styles.body}>
    <SectionHeader number={sectionNumber("tradeoffs")} id="tradeoffs" title={fixedSections.tradeoffs.title} />
    {tables.map(table => <DecisionTableView key={table.caption} {...table} />)}
  </section>;
}

export function FailuresSection({ failures }: { failures: FailureMode[] }) {
  return <section id="failures" className={styles.body}>
    <SectionHeader number={sectionNumber("failures")} id="failures" title={fixedSections.failures.title} />
    <FailureTabs failures={failures} />
  </section>;
}

/** Section 09 keeps a topic-specific question as its title, such as "What breaks at ten times the volume?". */
export function ScaleSection({ title, paragraphs = [], items = [], children }: { title: string; paragraphs?: string[]; items?: string[]; children?: ReactNode }) {
  return <section id="scale" className={styles.body}>
    <SectionHeader number={sectionNumber("scale")} id="scale" title={title} />
    {paragraphs.map(p => <p key={p}>{p}</p>)}
    {items.length > 0 && <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>}
    {children}
  </section>;
}

type InterviewProps = {
  answer: string;
  levels: LevelData[];
  traps: string[];
  wrongAnswers: WrongAnswer[];
  whiteboardChain?: WhiteboardStep[];
};

export function InterviewSection({ answer, levels, traps, wrongAnswers, whiteboardChain }: InterviewProps) {
  return <section id="interview" className={cx(styles.body, styles.interviewCorner)}>
    <SectionHeader number={sectionNumber("interview")} id="interview" title={fixedSections.interview.title} />
    <h3>Explain the decision in a minute</h3>
    <blockquote>{answer.split(/\n\s*\n/).map(p => <p key={p}>{p}</p>)}</blockquote>
    <p>Start with the business invariant, walk one failure boundary, and explain what the recovery mechanism costs. State the assumption that would make you choose a different design.</p>
    <h3>What each level adds</h3>
    <CareerRubricHub levels={levels} whiteboardChain={whiteboardChain} />
    {wrongAnswers.length > 0 && <>
      <h3>Common wrong answers</h3>
      {wrongAnswers.map(wrong => <div key={wrong.question} className={styles.failure}><span className={styles.wrongTag}><span aria-hidden="true">✗ </span>Wrong answer</span><h4>{wrong.question}</h4><p>{wrong.explanation}</p></div>)}
    </>}
    <h3>Traps to call out</h3>
    <ul className={styles.traps}>{traps.map(item => <li key={item}>{item}</li>)}</ul>
    <p className={styles.exampleNote}>Verify the contracts, workload, and crash recovery boundaries in your own environment. The diagrams’ fixed assumptions explain a mechanism; they are not production sizing advice.</p>
  </section>;
}

export function FollowUpsSection({ items }: { items: [question: string, answer: string][] }) {
  return <section id="follow-ups" className={cx(styles.body, styles.followups)}>
    <SectionHeader number={sectionNumber("follow-ups")} id="follow-ups" title={fixedSections["follow-ups"].title} />
    <p>Try answering each question before you open it.</p>
    {items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
  </section>;
}

type SourcesProps = {
  topicId: TopicId;
  sources: string[][];
  quiz: { title: string; questions: QuizQuestion[]; href: string };
  related: readonly TopicId[];
};

/**
 * Typed data for sections 06–12 of an MDX blueprint (see content/blueprints/).
 * The scale heading and the sources come from the article's frontmatter.
 */
export type BlueprintTail = {
  runbook: { steps: string[]; intro?: string; tables?: DecisionTable[] };
  tradeoffs: DecisionTable[];
  failures: FailureMode[];
  scale: { paragraphs?: string[]; items?: string[] };
  interview: InterviewProps;
  followUps: [question: string, answer: string][];
  quiz: SourcesProps["quiz"];
  related: readonly TopicId[];
};

export function BlueprintTailSections({ topicId, tail, scaleTitle, sources }: { topicId: TopicId; tail: BlueprintTail; scaleTitle: string; sources: string[][] }) {
  return <>
    <RunbookSection {...tail.runbook} />
    <TradeoffsSection tables={tail.tradeoffs} />
    <FailuresSection failures={tail.failures} />
    <ScaleSection title={scaleTitle} {...tail.scale} />
    <InterviewSection {...tail.interview} />
    <FollowUpsSection items={tail.followUps} />
    <SourcesSection topicId={topicId} sources={sources} quiz={tail.quiz} related={tail.related} />
  </>;
}

export function SourcesSection({ topicId, sources, quiz, related }: SourcesProps) {
  // The same reference can back several "In practice" notes; list it once.
  const unique = sources.filter(([, href], i, all) => all.findIndex(([, h]) => h === href) === i);
  return <section id="sources" className={styles.body}>
    <SectionHeader number={sectionNumber("sources")} id="sources" title={fixedSections.sources.title} />
    <p>The walkthrough is an illustrative design. Consult these primary references for the underlying mechanisms and product-specific contracts.</p>
    <ul>{unique.map(([label, href]) => <li key={href}><a href={href}>{label}</a></li>)}</ul>
    <div id="judgment-quiz"><ArticleQuizEntry title={quiz.title} questions={quiz.questions} quizHref={quiz.href} /></div>
    <RelatedTopics ids={related} />
    <ArticleNav currentId={topicId} />
  </section>;
}
