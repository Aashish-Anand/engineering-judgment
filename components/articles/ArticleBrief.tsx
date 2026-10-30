import type { ReactNode } from "react";
import type { TopicId } from "@/data/topics/catalog";
import type { ArticlePresentation } from "@/data/topics/presentation";
import { articleGuides } from "@/data/article-guides";
import { PrintQuickReference } from "@/components/learning/PrintQuickReference";
import neo from "@/components/Neo.module.css";
import { BriefTabs, type BriefTab } from "./BriefTabs";

/**
 * Everything a reader needs before the first section, as one block: the three-step flow (always
 * visible), then tabs for the central idea, the production scenario, recognition signals, the
 * one-minute quick reference, and (MDX articles with a `brief` in frontmatter) the bottleneck, fix,
 * and thresholds.
 */
export function ArticleBrief({ topicId, presentation, summary }: { topicId: TopicId; presentation: ArticlePresentation; summary?: ReactNode }) {
  const { signals, quick } = articleGuides[topicId];
  const tabs: BriefTab[] = [
    { label: "Central idea", content: <p className={neo.briefIdea}>{presentation.overview}</p> },
    { label: "Scenario", content: <dl className={neo.briefFacts}>{presentation.scenario.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl> },
    { label: "Spot it", content: <><p className={neo.briefLead}>You are probably facing this when…</p><ul>{signals.map(signal => <li key={signal}>{signal}</li>)}</ul></> },
    {
      label: "One minute",
      quickReference: true,
      content: <>
        <dl className={neo.briefQuick}>
          <div><dt>Invariant</dt><dd>{quick.invariant}</dd></div>
          <div><dt>Decision</dt><dd>{quick.decision}</dd></div>
          <div><dt>Remember</dt><dd><ul>{quick.remember.map(item => <li key={item}>{item}</li>)}</ul></dd></div>
          <div><dt>Watch for</dt><dd>{quick.failure}</dd></div>
        </dl>
        <PrintQuickReference />
      </>,
    },
    ...(summary ? [{ label: "The fix", content: summary }] : []),
  ];
  return (
    <section className={neo.brief} aria-label="Article brief">
      <figure className={neo.briefFlow}>
        <ol aria-label={`The design in three steps: ${presentation.flow.nodes.join(", then ")}`}>{presentation.flow.nodes.map((node, i) => <li key={node}>{i > 0 && <b aria-hidden="true">→</b>}<span>{node}</span></li>)}</ol>
        <figcaption>{presentation.flow.note}</figcaption>
      </figure>
      <BriefTabs tabs={tabs} />
    </section>
  );
}
