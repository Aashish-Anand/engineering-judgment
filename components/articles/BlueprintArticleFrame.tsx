import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TableOfContents } from "@/components/TableOfContents";
import { SectionHeader } from "@/components/SectionHeader";
import { getTopicById, type TopicId } from "@/data/topics/catalog";
import { articlePresentations, type ArticlePresentation } from "@/data/topics/presentation";
import { libraryHref } from "@/data/library";
import neo from "@/components/Neo.module.css";

export type BlueprintTocItem = { id: string; label: string };

type Props = {
  topicId: TopicId;
  toc: BlueprintTocItem[];
  children: ReactNode;
  brief?: ReactNode;
  bodyClassName?: string;
};

/** Shared published article layout. Keep topic-specific content in its article/data file. */
export function BlueprintArticleFrame({ topicId, toc, children, brief, bodyClassName = "" }: Props) {
  const topic = getTopicById(topicId);
  const presentation: ArticlePresentation = articlePresentations[topicId];
  return (
    <article data-category={topic.meta.category} className={`blueprint-article page-shell ${neo.surface} ${neo.article}`}>
      <div className="wide-width mx-auto">
        <Breadcrumb items={[{ label: "Library", href: "/library" }, { label: topic.meta.category, href: libraryHref("", topic.meta.categorySlug) }, { label: presentation.shortTitle }]} />
        <header className="blueprint-header">
          <div>
            <p className="eyebrow">Production blueprint / {presentation.number} · {topic.meta.readingTime}</p>
            <h1>{topic.meta.title}</h1>
            <p className="article-deck">{presentation.deck ?? topic.meta.subtitle}</p>
            <div className={neo.articleActions}><a href={`#${presentation.startId}`} className={neo.action}>Follow the blueprint <span aria-hidden="true">↓</span></a><a href="#workbench">Jump into the workbench ↗</a></div>
          </div>
          <aside className="scenario-context" aria-label="Scenario assumptions">
            <span className="eyebrow">Your production brief ↙</span>
            <dl>{presentation.scenario.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
          </aside>
        </header>
        <ol className={neo.journey} aria-label="The blueprint journey">{presentation.journey.map((step, index) => <li key={step}><b>{String(index + 1).padStart(2, "0")}</b>{step}</li>)}</ol>
        <div className="article-thesis"><span className="eyebrow">The central idea</span><p>{presentation.overview}</p></div>
        {brief && <details className={neo.brief}><summary>Architecture brief &amp; key thresholds</summary>{brief}</details>}
        <div className="article-layout">
          <TableOfContents items={toc.map(item => ({ ...item, label: item.label.replace(/^\d+\s*·\s*/, "") }))} />
          <div className={`article-content min-w-0 ${bodyClassName}`}>{children}</div>
        </div>
      </div>
    </article>
  );
}

/** Use for new sections so navigation anchors and numbered headings stay in sync. */
export function BlueprintSection({ id, number, title, children }: { id: string; number: string; title: string; children: ReactNode }) {
  return <section id={id}><SectionHeader number={number} id={id} title={title} />{children}</section>;
}

/** Align panels with the content column; diagrams use compact intrinsic sizing and local overflow when needed. */
export function BlueprintPanel({ children, kind = "workbench", id }: { children: ReactNode; kind?: "workbench" | "diagram" | "detail"; id?: string }) {
  const className = kind === "diagram" ? neo.diagramPanel : kind === "detail" ? neo.detailPanel : `${neo.labPanel} ${neo.standardTool}`;
  return <div id={id} className={className}>{children}</div>;
}
