import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TableOfContents } from "@/components/TableOfContents";
import { SectionHeader } from "@/components/SectionHeader";
import { getTopicById, type TopicId } from "@/data/topics/catalog";
import { articlePresentations, type ArticlePresentation } from "@/data/topics/presentation";
import { libraryHref } from "@/data/library";
import neo from "@/components/Neo.module.css";
import learning from "@/components/learning/Learning.module.css";
import { pathsForTopic } from "@/data/learning-paths";
import { ArticleBrief } from "./ArticleBrief";

export type BlueprintTocItem = { id: string; label: string };

type Props = {
  topicId: TopicId;
  toc: BlueprintTocItem[];
  children: ReactNode;
  /** Optional extra "The fix" tab for the article brief. */
  summary?: ReactNode;
  bodyClassName?: string;
  /** Header link text for #workbench; static-diagram articles say "diagram" instead of "workbench". */
  workbenchLabel?: string;
};

/** Shared published article layout. Keep topic-specific content in its article/data file. */
export function BlueprintArticleFrame({ topicId, toc, children, summary, bodyClassName = "", workbenchLabel = "Jump into the workbench" }: Props) {
  const topic = getTopicById(topicId);
  const presentation: ArticlePresentation = articlePresentations[topicId];
  return (
    <article data-category={topic.meta.category} className={`blueprint-article page-shell ${neo.surface} ${neo.article}`}>
      <div className="wide-width mx-auto">
        <Breadcrumb items={[{ label: "Library", href: "/library" }, { label: topic.meta.category, href: libraryHref("", topic.meta.categorySlug) }, { label: presentation.shortTitle }]} />
        <header className="blueprint-header">
          <div>
            <p className="eyebrow">Production blueprint / {presentation.number} · {topic.meta.readingTime}</p>
            <p className={learning.pathLine}>Learning path: {pathsForTopic(topicId).map(({ path, index }, i) => <span key={path.slug}>{i > 0 && " · "}<a href={`/paths#${path.slug}`}>{path.title}</a> ({index + 1} of {path.steps.length})</span>)}</p>
            <h1>{topic.meta.title}</h1>
            <p className="article-deck">{presentation.deck ?? topic.meta.subtitle}</p>
            <div className={neo.articleActions}><a href={`#${presentation.startId}`} className={neo.action}>Follow the blueprint <span aria-hidden="true">↓</span></a><a href="#workbench">{workbenchLabel} ↗</a></div>
          </div>
          <ArticleBrief topicId={topicId} presentation={presentation} summary={summary} />
        </header>
        <ol className={neo.journey} aria-label="The blueprint journey">{presentation.journey.map((step, index) => <li key={step}><b>{String(index + 1).padStart(2, "0")}</b>{step}</li>)}</ol>
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
