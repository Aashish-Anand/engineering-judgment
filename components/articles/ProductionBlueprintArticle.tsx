import { BlueprintArticleFrame } from "./BlueprintArticleFrame";
import neo from "@/components/Neo.module.css";
import { ArticleNav } from "@/components/ArticleNav";
import { CodeBlock } from "@/components/CodeBlock";
import { blueprintExamples, type DataBlueprintId } from "@/data/topics/blueprint-examples";
import { SectionHeader } from "@/components/SectionHeader";
import { RelatedTopics } from "@/components/RelatedTopics";
import { ArticleQuizEntry } from "@/components/ArticleQuizEntry";
import { InlineCheck } from "@/components/InlineCheck";
import { productionBlueprints } from "@/data/topics/production-blueprints";
import { blueprintConceptDiagrams } from "@/components/diagrams/BlueprintConceptDiagrams";
import { InPractice } from "@/components/InPractice";
import { blueprintPractice } from "@/data/topics/blueprint-practice";
import styles from "./ProductionBlueprintArticle.module.css";

export function ProductionBlueprintArticle({ id }: { id: DataBlueprintId }) {
  const topic = productionBlueprints.find(topic => topic.id === id)!;
  const example = blueprintExamples[id];
  const toc = [
    ...topic.sections.slice(0, 5).map(({ id, title }) => ({ id, label: title })),
    { id: "runbook", label: "Respond in production" },
    { id: "tradeoffs", label: "Trade-offs" },
    { id: "failures", label: "Failure modes" },
    { id: "scale", label: topic.sections[5].title },
    { id: "avoid", label: "What to avoid" },
    { id: "interview", label: "Explain the decision" },
    { id: "career-rubric", label: "Expectations by level" },
    { id: "follow-ups", label: "What breaks next?" },
    { id: "sources", label: "Sources and practice" },
  ];
  const check = topic.conceptCheck ?? topic.questions[0];
  const concept = blueprintConceptDiagrams[id];
  const practice = blueprintPractice[id];
  // Practice sources join the section 14 reference list without repeating a link.
  const sources = [...topic.sources, ...(practice?.sources ?? [])].filter(([, href], i, all) => all.findIndex(([, h]) => h === href) === i);
  const renderSection = (section: typeof topic.sections[number], index: number) => <section id={section.id} key={section.id}>
    <SectionHeader number={String(index + 1).padStart(2, "0")} id={section.id} title={section.title} />
    {section.paragraphs.map(p => <p key={p}>{p}</p>)}
    {practice?.sectionId === section.id && <InPractice {...practice} />}
    {concept?.sectionId === section.id && <concept.Diagram />}
    {section.id === "architecture" && <figure className={styles.diagram} aria-label={`${topic.shortTitle}: architecture flow`}>
      <ol>{topic.flow.map((step, i) => <li key={step}><span aria-hidden="true">{i + 1}</span>{step}</li>)}</ol>
      <figcaption>{topic.diagramCaption}</figcaption>
    </figure>}
    {section.id === "worked-example" && <><CodeBlock language={example.language} code={example.code} /><p className={styles.exampleNote}>{example.note}</p></>}
    {section.id === "worked-example" && <InlineCheck className={neo.conceptCheck} question={check.scenario} options={check.options.map(option => ({ label: option.text, isCorrect: option.isCorrect, explanation: option.explanation }))} />}
  </section>;
  return <BlueprintArticleFrame topicId={id} toc={toc} bodyClassName={styles.body} workbenchLabel={concept?.interactive ? "Jump into the workbench" : "Jump to the diagram"}>
          {topic.sections.slice(0, 5).map(renderSection)}
          <section id="runbook" className={styles.runbook}><SectionHeader number="06" id="runbook" title="Respond in production" /><ol>{topic.runbook.map(item => <li key={item}>{item}</li>)}</ol></section>
          <section id="tradeoffs"><SectionHeader number="07" id="tradeoffs" title="Every safeguard has a cost" /><div className={styles.tableWrap}><table><caption>Decisions and their operational costs</caption><thead><tr><th scope="col">Decision</th><th scope="col">Trade-off</th></tr></thead><tbody>{topic.tradeoffs.map(([label, detail]) => <tr key={label}><th scope="row">{label}</th><td>{detail}</td></tr>)}</tbody></table></div></section>
          <section id="failures"><SectionHeader number="08" id="failures" title="Failure modes to rehearse" />{topic.failures.map(([title, detail]) => <div key={title} className={styles.failure}><h3>{title}</h3><p>{detail}</p></div>)}</section>
          {renderSection(topic.sections[5], 8)}
          <section id="avoid" className={styles.avoid}><SectionHeader number="10" id="avoid" title="What to avoid" /><ul>{example.avoid.map(item => <li key={item}>{item}</li>)}</ul><p>Verify the contracts, workload, and crash recovery boundaries in your own environment. The diagrams’ fixed assumptions explain a mechanism; they are not production sizing advice.</p></section>
          <section id="interview"><SectionHeader number="11" id="interview" title="Explain the decision" /><blockquote>{topic.interview}</blockquote><p>Start with the business invariant, walk one failure boundary, and explain what the recovery mechanism costs. State the assumption that would make you choose a different design.</p></section>
          <section id="career-rubric" className={styles.rubric}><SectionHeader number="12" id="career-rubric" title="Expectations by engineering level" />{topic.levels.map((text, i) => <div key={text}><h3>{["Mid-level", "Senior", "Staff"][i]}</h3><p>{text}</p></div>)}</section>
          <section id="follow-ups" className={styles.followups}><SectionHeader number="13" id="follow-ups" title="What breaks next?" /><p>Try answering each question before you open it.</p>{topic.followups.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
          <section id="sources"><SectionHeader number="14" id="sources" title="Sources and practice" /><p>The walkthrough is an illustrative design. Consult these primary references for the underlying mechanisms and product-specific contracts.</p><ul>{sources.map(([label, href]) => <li key={href}><a href={href}>{label}</a></li>)}</ul><div id="judgment-quiz"><ArticleQuizEntry title={topic.shortTitle} questions={topic.questions} quizHref={`${topic.href}/quiz`} /></div><RelatedTopics ids={topic.related} /><ArticleNav currentId={id} /></section>
  </BlueprintArticleFrame>;
}

export function IdempotentApiArticle() { return <ProductionBlueprintArticle id="idempotent-api" />; }
export function PoisonMessagesArticle() { return <ProductionBlueprintArticle id="poison-messages" />; }
export function RetryStormArticle() { return <ProductionBlueprintArticle id="retry-storm" />; }
export function ConnectionPoolArticle() { return <ProductionBlueprintArticle id="connection-pool" />; }
export function SchemaEvolutionArticle() { return <ProductionBlueprintArticle id="schema-evolution" />; }
