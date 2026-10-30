import { Fragment, type ComponentType, type ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import { blueprints, type Blueprint } from "#site/content";
import { BlueprintArticleFrame, BlueprintPanel } from "./BlueprintArticleFrame";
import { BlueprintTailSections, type BlueprintTail } from "./BlueprintSections";
import neo from "@/components/Neo.module.css";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SectionHeader } from "@/components/SectionHeader";
import { MetricTable } from "@/components/MetricTable";
import { InsightCard } from "@/components/InsightCard";
import { ProblemStatement } from "@/components/ProblemStatement";
import { CodeBlock } from "@/components/CodeBlock";
import { InPractice } from "@/components/InPractice";
import { IncidentBox } from "@/components/IncidentBox";
import { ExecutiveBlueprint } from "@/components/ExecutiveBlueprint";
import { InlineCheck, type InlineCheckOption } from "@/components/InlineCheck";
import { FailureCallout } from "@/components/doodle/FailureCallout";
import { HotPartitionLab } from "@/components/HotPartitionLab";
import { OutboxLab } from "@/components/OutboxLab";
import { FlashSaleLab } from "@/components/FlashSaleLab";
import { CapacitySizingLab } from "@/components/CapacitySizingLab";
import { CutoverWorkbench } from "@/components/CutoverWorkbench";
import { HotPartitionDiagram } from "@/components/diagrams/HotPartitionDiagram";
import { HotPartitionFlow } from "@/components/diagrams/HotPartitionFlow";
import { CommentReadExample, DatabaseRequestGate, ReactionKeyExample, ReactionMigrationExample, ReactionRetryExample } from "@/components/diagrams/HotPartitionWorkedExamples";
import { OutboxDiagram, OutboxRelayFlow } from "@/components/diagrams/OutboxDiagram";
import { DualWriteCrashTimeline, IdempotentConsumerExample, OutboxRowLifecycle, OutboxSchemaExample } from "@/components/diagrams/OutboxWorkedExamples";
import { NaiveFlashSaleDiagram } from "@/components/diagrams/NaiveFlashSaleDiagram";
import { FlashSaleArchitectureDiagram } from "@/components/diagrams/FlashSaleArchitectureDiagram";
import { InventoryRaceDiagram } from "@/components/diagrams/InventoryRaceDiagram";
import { ReservationFlowDiagram } from "@/components/diagrams/ReservationFlowDiagram";
import { FlashSaleFunnelMotion, MigrationLsnTimeline } from "@/components/diagrams/MotionDiagrams";
import { NaiveMigrationDiagram } from "@/components/diagrams/NaiveMigrationDiagram";
import { FencedCutoverSequence, MigrationOwnershipLanes } from "@/components/diagrams/MigrationPhaseDiagrams";
import { articleToc, sectionNumber, type TopicSectionId } from "@/data/topics/article-format";
import type { TopicId } from "@/data/topics/catalog";
import * as hotPartition from "@/data/topics/fix-hot-partition";
import * as outbox from "@/data/topics/transactional-outbox";
import * as flashSale from "@/data/topics/survive-flash-sale";
import * as migration from "@/data/topics/safely-migrate-production-database";

/*
 * Renders a blueprint whose sections 01–05 are MDX (content/blueprints/*.mdx,
 * compiled by Velite) and whose sections 06–12 are typed data in data/topics/.
 * docs/ARTICLE_AUTHORING.md lists every component an MDX article can use.
 */

type BlueprintData = {
  tail: BlueprintTail;
  /** Rows for <ScenarioMetrics />. */
  scenarioMetrics?: { label: string; value: string }[];
  /** Cards for <StrategyCards />. */
  strategies?: { name: string; description: string }[];
};

/** Typed data for each MDX blueprint. Add a new MDX topic here and to the registry. */
export const mdxBlueprintData = {
  "hot-partition": { tail: hotPartition.blueprint, scenarioMetrics: hotPartition.scenarioMetrics },
  "transactional-outbox": { tail: outbox.blueprint, scenarioMetrics: outbox.scenarioMetrics },
  "flash-sale": { tail: flashSale.blueprint, scenarioMetrics: flashSale.scenarioMetrics, strategies: flashSale.saleStrategies },
  "database-migration": { tail: migration.blueprint },
} satisfies Partial<Record<TopicId, BlueprintData>>;

export type MdxTopicId = keyof typeof mdxBlueprintData;

/** Topic-specific diagrams and labs, available in every MDX article by name. */
const diagrams = {
  HotPartitionLab, OutboxLab, FlashSaleLab, CapacitySizingLab, CutoverWorkbench,
  HotPartitionDiagram, HotPartitionFlow, CommentReadExample, DatabaseRequestGate, ReactionKeyExample, ReactionMigrationExample, ReactionRetryExample,
  OutboxDiagram, OutboxRelayFlow, DualWriteCrashTimeline, IdempotentConsumerExample, OutboxRowLifecycle, OutboxSchemaExample,
  NaiveFlashSaleDiagram, FlashSaleArchitectureDiagram, InventoryRaceDiagram, ReservationFlowDiagram, FlashSaleFunnelMotion,
  MigrationLsnTimeline, NaiveMigrationDiagram, FencedCutoverSequence, MigrationOwnershipLanes,
};

type MdxComponents = Record<string, ComponentType<never>>;

/** The components an MDX article can use; `doc` and `data` bind the article's own titles, sources, and data. */
function mdxComponents(doc: Blueprint, data: BlueprintData): MdxComponents {
  const sources = doc.sources.map(({ label, href }) => [label, href] as [string, string]);
  return {
    ...diagrams,
    ScrollReveal, ProblemStatement, InsightCard, FailureCallout, CodeBlock,
    /** A topic-specific section, 01–05. Its number and heading come from the frontmatter. */
    Section: ({ id, children }: { id: Exclude<TopicSectionId, "scale">; children: ReactNode }) => (
      <section id={id}><SectionHeader number={sectionNumber(id)} id={id} title={doc.sections[id]} />{children}</section>
    ),
    /** The bold closing quote inside a <ProblemStatement>. */
    Pullquote: ({ children }: { children: ReactNode }) => <p className="font-sans text-base text-slate-900 font-semibold mb-0">“{children}”</p>,
    ScenarioMetrics: ({ sideNote }: { sideNote?: string }) => <div className="my-5"><MetricTable rows={data.scenarioMetrics ?? []} sideNote={sideNote} /></div>,
    /** A diagram in the shared compact panel. */
    Diagram: ({ children }: { children: ReactNode }) => <div className="my-6"><ScrollReveal><BlueprintPanel kind="diagram">{children}</BlueprintPanel></ScrollReveal></div>,
    /** A full-width illustration without the diagram panel's border. */
    Figure: ({ children }: { children: ReactNode }) => <div className={neo.articleFigure}><ScrollReveal>{children}</ScrollReveal></div>,
    /** The section-05 experiment; carries the header's #workbench target. */
    Workbench: ({ children }: { children: ReactNode }) => <BlueprintPanel id="workbench">{children}</BlueprintPanel>,
    /** A lab without the standard tool sizing (calculators, wide workbenches). */
    LabPanel: ({ id, children }: { id?: string; children: ReactNode }) => <div id={id} className={neo.labPanel}>{children}</div>,
    InlineCheck: ({ question, options }: { question: string; options: InlineCheckOption[] }) => <InlineCheck className={neo.conceptCheck} question={question} options={options} />,
    /** Cites the article's frontmatter sources: all of them, or the listed labels. */
    InPractice: ({ title, sources: labels, children }: { title: string; sources?: string[]; children: ReactNode }) => (
      <InPractice title={title} sources={labels ? sources.filter(([label]) => labels.includes(label)) : sources}>{children}</InPractice>
    ),
    /** A public incident that shows this article's failure; `source` names one frontmatter source by label. */
    Incident: ({ title, when, source: label, children }: { title: string; when: string; source: string; children: ReactNode }) => {
      const source = sources.find(([sourceLabel]) => sourceLabel === label);
      if (!source) throw new Error(`<Incident> cites "${label}", which is not in ${doc.topic}'s frontmatter sources`);
      return <IncidentBox title={title} when={when} source={source}>{children}</IncidentBox>;
    },
    DecisionNote: ({ eyebrow, lines, children }: { eyebrow: string; lines: string[]; children: ReactNode }) => (
      <div className={neo.decisionNote}><span className="eyebrow">{eyebrow}</span><h3>{lines.map((line, i) => <Fragment key={line}>{i > 0 && <br />}{line}</Fragment>)}</h3><p>{children}</p></div>
    ),
    StrategyCards: () => <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
      {(data.strategies ?? []).map(s => <div key={s.name} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
          <h4 className="font-sans text-sm sm:text-base font-bold text-slate-900 m-0">{s.name}</h4>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-0 font-sans">{s.description}</p>
      </div>)}
    </div>,
  };
}

type RenderMdx = (props: { components: MdxComponents }) => ReactNode;

// Velite emits each body as an MDX function body; evaluate each once at module load.
// The result has no hooks, so it is called as a function rather than mounted as a component.
const compiled = new Map(blueprints.map(doc => [doc.topic, new Function(doc.body)({ ...runtime }).default as RenderMdx]));

export function MdxBlueprintArticle({ topicId }: { topicId: MdxTopicId }) {
  const doc = blueprints.find(entry => entry.topic === topicId);
  const renderContent = compiled.get(topicId);
  if (!doc || !renderContent) throw new Error(`No content/blueprints/*.mdx has topic: ${topicId}`);
  const data: BlueprintData = mdxBlueprintData[topicId];
  return (
    <BlueprintArticleFrame topicId={topicId} toc={articleToc(doc.sections)} summary={doc.brief && <ExecutiveBlueprint {...doc.brief} />}>
      {renderContent({ components: mdxComponents(doc, data) })}
      <BlueprintTailSections topicId={topicId} tail={data.tail} scaleTitle={doc.sections.scale} sources={doc.sources.map(({ label, href }) => [label, href])} />
    </BlueprintArticleFrame>
  );
}
