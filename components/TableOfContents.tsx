"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { topicCatalog } from "@/data/topics/catalog";
import { libraryCategories, libraryDetails, libraryHref, matchesTopic } from "@/data/library";
import styles from "./ArticleNavigator.module.css";

type TocItem = { id: string; label: string };
type Mode = "article" | "library";

function LibraryGroup({ slug, label, currentPath, close, expanded, toggle }: { slug: string; label: string; currentPath: string; close: () => void; expanded: boolean; toggle: () => void }) {
  const topics = topicCatalog.filter(t => t.meta.categorySlug === slug);
  const id = useId();
  return <div className={styles.group}>
    <button type="button" aria-expanded={expanded} aria-controls={id} onClick={toggle}>{label}<span>{topics.length} {expanded ? "−" : "+"}</span></button>
    <ul id={id} hidden={!expanded}>{topics.map(t => <li key={t.id}><Link href={t.href} onClick={close} aria-current={t.href === currentPath ? "page" : undefined}>{libraryDetails[t.id].title}</Link></li>)}</ul>
  </div>;
}

function LibraryCategories({ currentPath, close }: { currentPath: string; close: () => void }) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    topicCatalog.find(topic => topic.href === currentPath)?.meta.categorySlug ?? null,
  );
  return libraryCategories.map(category => <LibraryGroup
    key={category.slug}
    slug={category.slug}
    label={category.label}
    currentPath={currentPath}
    close={close}
    expanded={expandedCategory === category.slug}
    toggle={() => setExpandedCategory(current => current === category.slug ? null : category.slug)}
  />);
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const path = usePathname();
  const [activeId, setActiveId] = useState(items[0]?.id || "");
  const [mode, setMode] = useState<Mode>("article");
  const [query, setQuery] = useState("");
  const [isOpen, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const instance = useId();
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top);
      if (visible[0]) setActiveId(visible[0].target.id);
    }, { rootMargin: "-90px 0px -65% 0px" });
    items.forEach(item => { const el = document.getElementById(item.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [items]);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const breakpoint = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (breakpoint.matches) dialog.current?.close(); };
    breakpoint.addEventListener("change", closeOnDesktop);
    return () => { document.body.style.overflow = previous; breakpoint.removeEventListener("change", closeOnDesktop); };
  }, [isOpen]);
  function close() { dialog.current?.close(); }
  function open(next: Mode) { setMode(next); dialog.current?.showModal(); setOpen(true); }
  const results = topicCatalog.filter(topic => matchesTopic(topic, query));
  function panel(location: string) {
    const prefix = `${instance}-${location}`;
    return <>
      <div className={styles.tabs} role="tablist" aria-label="Article navigation mode">
        {(["article", "library"] as Mode[]).map(value => <button key={value} type="button" id={`${prefix}-${value}`} role="tab" aria-selected={mode === value} aria-controls={`${prefix}-panel-${value}`} tabIndex={mode === value ? 0 : -1} onClick={() => setMode(value)} onKeyDown={e => {
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
            e.preventDefault(); const next = e.key === "Home" ? "article" : e.key === "End" ? "library" : mode === "article" ? "library" : "article";
            setMode(next); document.getElementById(`${prefix}-${next}`)?.focus();
          }
        }}>{value === "article" ? "This article" : "Library"}</button>)}
      </div>
      <div role="tabpanel" id={`${prefix}-panel-article`} aria-labelledby={`${prefix}-article`} hidden={mode !== "article"} tabIndex={0}>
        <p className={styles.caption}>{items.length} sections · Your reading guide</p>
        <nav aria-label="This article’s sections"><ol className={styles.sections}>{items.map((item,i) => <li key={item.id}><a href={`#${item.id}`} aria-current={activeId===item.id?"location":undefined} onClick={() => { setActiveId(item.id); close(); }}><span>{String(i+1).padStart(2,"0")}</span>{item.label}</a></li>)}</ol></nav>
      </div>
      <div role="tabpanel" id={`${prefix}-panel-library`} aria-labelledby={`${prefix}-library`} hidden={mode !== "library"} tabIndex={0}>
        <label className={styles.search}>Find an article<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Problem or concept…" /></label>
        <nav aria-label="Browse all articles">
          {query.trim() ? <><p className={styles.caption} role="status">{results.length} matching article{results.length===1?"":"s"}</p><ul className={styles.matches}>{results.slice(0,12).map(t => <li key={t.id}><Link onClick={close} aria-current={t.href===path?"page":undefined} href={t.href}>{libraryDetails[t.id].title}<small>{t.meta.category}</small></Link></li>)}</ul>{!results.length && <p className={styles.caption}>Try “payment”, “retries”, or a broader concept.</p>}</> : <LibraryCategories key={`${location}-${path}`} currentPath={path} close={close} />}
        </nav>
        <Link className={styles.all} onClick={close} href={libraryHref(query)}>{query.trim() ? "View all search results" : `Browse all ${topicCatalog.length} blueprints`} →</Link>
      </div>
    </>;
  }
  return <>
    <aside className={styles.desktop} aria-label="Article navigator"><details open><summary>Article navigation</summary>{panel("desktop")}</details></aside>
    <div className={styles.mobileBar}><button type="button" onClick={() => open("article")} aria-haspopup="dialog">This article · {Math.max(1,items.findIndex(i=>i.id===activeId)+1)}/{items.length}</button><button type="button" onClick={() => open("library")} aria-haspopup="dialog">Browse articles ↗</button></div>
    <dialog ref={dialog} className={styles.drawer} aria-label="Article navigation" onClose={() => setOpen(false)} onKeyDown={e => { if (e.key === "Escape") { e.preventDefault(); close(); } }} onClick={e => { if(e.target === e.currentTarget) close(); }}>
      <div className={styles.drawerContent}><div className={styles.drawerHead}><strong>Explore the blueprints</strong><button type="button" onClick={close} aria-label="Close article navigation">Close ×</button></div>{panel("mobile")}</div>
    </dialog>
  </>;
}
