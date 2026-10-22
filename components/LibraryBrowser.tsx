"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getLibraryResults, libraryCategories, libraryHref } from "@/data/library";
import { LibraryCards } from "./LibraryCards";
import styles from "./Library.module.css";

export function LibraryBrowser() {
  const params = useSearchParams();
  const query = params.get("q") || "";
  const category = params.get("category") || "";
  const sort = ["recommended", "newest", "title"].includes(params.get("sort") || "") ? params.get("sort")! : "recommended";
  const results = getLibraryResults(query, category, sort, Number(params.get("page") || 1));
  function update(q: string, c: string, s: string, replace = false) {
    window.history[replace ? "replaceState" : "pushState"](null, "", libraryHref(q, c, s));
  }
  const pageNumbers = Array.from(new Set([1, results.currentPage - 1, results.currentPage, results.currentPage + 1, results.totalPages])).filter(n => n > 0 && n <= results.totalPages).sort((a,b) => a-b);
  return <>
    <div className={styles.controls}>
      <label className={styles.search}>Search the library<input type="search" placeholder="Try ‘charged twice’ or ‘connection pool’" value={query} onChange={e => update(e.target.value, category, sort, true)} /></label>
      <label>Category<select value={category} onChange={e => update(query, e.target.value, sort)}><option value="">All categories</option>{!libraryCategories.some(c=>c.slug===category) && category && <option value={category}>Unknown category</option>}{libraryCategories.map(c => <option key={c.slug} value={c.slug}>{c.label} ({c.count})</option>)}</select></label>
      <label>Sort by<select value={sort} onChange={e => update(query, category, e.target.value)}><option value="recommended">Recommended</option><option value="newest">Newest additions</option><option value="title">Title A–Z</option></select></label>
    </div>
    <div className={styles.results}><p role="status">{results.total ? `${(results.currentPage-1)*12+1}–${Math.min(results.currentPage*12,results.total)} of ${results.total} blueprints` : "No matching blueprints"}</p>{(query || category || sort !== "recommended") && <button type="button" onClick={() => update("", "", "recommended")}>Clear filters</button>}</div>
    {results.total ? <><h2 className="sr-only">Blueprints</h2><LibraryCards topics={results.topics} /></> : <div className={styles.empty}><h2>No articles found.</h2><p>Try a broader problem, a related concept, or clear the category filter.</p></div>}
    {results.totalPages > 1 && <nav className={styles.pagination} aria-label="Library pages">
      {results.currentPage > 1 && <Link href={libraryHref(query,category,sort,results.currentPage-1)}>← Previous</Link>}
      {pageNumbers.map((n,i) => <span key={n}>{i > 0 && n-pageNumbers[i-1]>1 && <span aria-hidden="true"> … </span>}<Link aria-label={`Page ${n}`} aria-current={n===results.currentPage?"page":undefined} href={libraryHref(query,category,sort,n)}>{n}</Link></span>)}
      {results.currentPage < results.totalPages && <Link href={libraryHref(query,category,sort,results.currentPage+1)}>Next →</Link>}
    </nav>}
  </>;
}
