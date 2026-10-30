import { BlueprintArticleFrame } from "./BlueprintArticleFrame";
import neo from "@/components/Neo.module.css";
import { CodeBlock } from "@/components/CodeBlock";
import { blueprintExamples, type DataBlueprintId } from "@/data/topics/blueprint-examples";
import { SectionHeader } from "@/components/SectionHeader";
import { InlineCheck } from "@/components/InlineCheck";
import { productionBlueprints } from "@/data/topics/production-blueprints";
import { blueprintConceptDiagrams } from "@/components/diagrams/BlueprintConceptDiagrams";
import { InPractice } from "@/components/InPractice";
import { IncidentBox } from "@/components/IncidentBox";
import { blueprintPractice } from "@/data/topics/blueprint-practice";
import { articleToc, sectionNumber, type ArticleSectionId } from "@/data/topics/article-format";
import { FailuresSection, FollowUpsSection, InterviewSection, RunbookSection, ScaleSection, SourcesSection, TradeoffsSection } from "./BlueprintSections";
import styles from "./BlueprintSections.module.css";

export function ProductionBlueprintArticle({ id }: { id: DataBlueprintId }) {
  const topic = productionBlueprints.find(topic => topic.id === id)!;
  const example = blueprintExamples[id];
  const title = (sectionId: string) => topic.sections.find(section => section.id === sectionId)!.title;
  const toc = articleToc({ problem: title("problem"), naive: title("naive"), "mental-model": title("mental-model"), architecture: title("architecture"), "worked-example": title("worked-example"), scale: title("scale") });
  const check = topic.conceptCheck ?? topic.questions[0];
  const concept = blueprintConceptDiagrams[id];
  const practice = blueprintPractice[id];
  const scale = topic.sections.find(section => section.id === "scale")!;
  const renderSection = (section: typeof topic.sections[number]) => <section id={section.id} key={section.id}>
    <SectionHeader number={sectionNumber(section.id as ArticleSectionId)} id={section.id} title={section.title} />
    {section.paragraphs.map(p => <p key={p}>{p}</p>)}
    {topic.incident?.sectionId === section.id && <IncidentBox {...topic.incident} />}
    {practice?.sectionId === section.id && <InPractice {...practice} />}
    {concept?.sectionId === section.id && <concept.Diagram />}
    {concept?.more?.filter(extra => extra.sectionId === section.id).map(({ Diagram }, i) => <Diagram key={i} />)}
    {section.id === "architecture" && <figure className={styles.diagram} aria-label={`${topic.shortTitle}: architecture flow`}>
      <ol>{topic.flow.map((step, i) => <li key={step}><span aria-hidden="true">{i + 1}</span>{step}</li>)}</ol>
      <figcaption>{topic.diagramCaption}</figcaption>
    </figure>}
    {section.id === "worked-example" && <><CodeBlock language={example.language} code={example.code} /><p className={styles.exampleNote}>{example.note}</p></>}
    {section.id === "worked-example" && <InlineCheck className={neo.conceptCheck} question={check.scenario} options={check.options.map(option => ({ label: option.text, isCorrect: option.isCorrect, explanation: option.explanation }))} />}
  </section>;
  return <BlueprintArticleFrame topicId={id} toc={toc} bodyClassName={styles.body} workbenchLabel={concept?.interactive ? "Jump into the workbench" : "Jump to the diagram"}>
          {topic.sections.filter(section => section.id !== "scale").map(renderSection)}
          <RunbookSection steps={topic.runbook} />
          <TradeoffsSection tables={[{ caption: "Decisions and their operational costs", headers: ["Decision", "Trade-off"], rows: topic.tradeoffs }, ...(topic.extraTables ?? [])]} />
          <FailuresSection failures={topic.failures.map(([title, response, explanation]) => ({ title, response, explanation }))} />
          <ScaleSection title={scale.title} paragraphs={scale.paragraphs} />
          <InterviewSection answer={topic.interview} levels={topic.levels} wrongAnswers={topic.wrongAnswers} traps={example.avoid} />
          <FollowUpsSection items={topic.followups as [string, string][]} />
          <SourcesSection topicId={id} sources={[...topic.sources, ...(practice?.sources ?? []), ...(topic.incident ? [topic.incident.source] : [])]} quiz={{ title: topic.shortTitle, questions: topic.questions, href: `${topic.href}/quiz` }} related={topic.related} />
  </BlueprintArticleFrame>;
}

export function IdempotentApiArticle() { return <ProductionBlueprintArticle id="idempotent-api" />; }
export function PoisonMessagesArticle() { return <ProductionBlueprintArticle id="poison-messages" />; }
export function RetryStormArticle() { return <ProductionBlueprintArticle id="retry-storm" />; }
export function ConnectionPoolArticle() { return <ProductionBlueprintArticle id="connection-pool" />; }
export function SchemaEvolutionArticle() { return <ProductionBlueprintArticle id="schema-evolution" />; }
