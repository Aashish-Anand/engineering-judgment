import Link from "next/link";
import { LibraryCards } from "@/components/LibraryCards";
import { featuredIds, libraryCategories, libraryHref } from "@/data/library";
import styles from "@/components/Library.module.css";
import { Hero } from "@/components/Hero";
import { ArchitecturePressurePreview } from "@/components/ArchitecturePressurePreview";
import { topicCatalog } from "@/data/topics/catalog";

export default function Home() {
  return (
    <div className="editorial-home">
      <Hero />
      <section id="problems" className="page-shell home-section">
        <div className="section-intro"><div><p className="eyebrow">The library / 01</p><h2>Find your next engineering problem.</h2></div><p>Six starting points from {topicCatalog.length} blueprints. Follow a problem through its constraints, decisions, and consequences.</p></div>
        <form action="/library" className={styles.controls} role="search"><label className={styles.search}>Search by problem, failure mode, or concept<input type="search" name="q" placeholder="Try ‘charged twice’ or ‘connection pool’" /></label><button type="submit" className="editorial-button">Search library →</button></form>
        <nav className={styles.categories} aria-label="Browse by category">{libraryCategories.map(c => <Link data-category={c.label} href={libraryHref("",c.slug)} key={c.slug}>{c.label} · {c.count}</Link>)}</nav>
        <LibraryCards topics={featuredIds.map(id => topicCatalog.find(t => t.id === id)!)} />
        <div className={styles.browse}><Link className="editorial-button" href="/library">Browse all {topicCatalog.length} blueprints →</Link></div>
      </section>
      <section id="labs" className="page-shell home-section lab-section">
        <div className="lab-description"><p className="eyebrow">The workbench / 02</p><h2>Change the load.<br />Watch the consequence.</h2><p>Explore how a database migration, flash sale, or hot partition responds to pressure. Compare the steady state with a sudden traffic spike.</p><p className="quiet-note">Illustrative simulations. Open a blueprint for the assumptions and deeper controls.</p></div>
        <div className="home-workbench-surface"><ArchitecturePressurePreview /></div>
      </section>
      <section id="about" className="page-shell home-section about-section">
        <div><p className="eyebrow">The approach / 03</p><h2>Good architecture starts<br />with better questions.</h2></div>
        <div><p className="editorial-lead">What is the constraint? Where does the first failure appear? What does this decision make harder later?</p><p>Engineering Judgment is a collection of worked problems for engineers who want to understand how systems behave in production. Each blueprint combines explanation, architecture diagrams, and experiments you can control.</p><div className="reasoning-line">Constraint <span>→</span> Decision <span>→</span> Trade-off <span>→</span> Consequence</div><Link href="/topics/database/safely-migrate-production-database#career-rubric" className="text-link">Explore the engineering rubric ↗</Link></div>
      </section>
    </div>
  );
}
