import Link from "next/link";
import { DepthLink } from "@/components/DepthLink";
import { Hero } from "@/components/Hero";
import { ArchitecturePressurePreview } from "@/components/ArchitecturePressurePreview";
import { topicCatalog } from "@/data/topics/catalog";

const titles: Record<string, string> = {
  "database-migration": "Migrate without losing writes",
  "hot-partition": "When one partition takes the heat",
  "flash-sale": "Ten million buyers. Ten thousand items.",
  "transactional-outbox": "Commit the write. Deliver the event.",
};

export default function Home() {
  return (
    <div className="editorial-home">
      <Hero />
      <section id="problems" className="page-shell home-section">
        <div className="section-intro"><div><p className="eyebrow">The library / 01</p><h2>Start with a real problem.</h2></div><p>Four blueprints. Each follows a constraint through the decision, the trade-off, and what breaks next.</p></div>
        <div className="blueprint-list">
          {topicCatalog.map((topic, index) => (
            <DepthLink key={topic.id} href={topic.href} className="blueprint-row" tilt={1.5}>
              <span className="row-number">0{index + 1}</span>
              <div><span className="eyebrow">{topic.meta.category}</span><h3>{titles[topic.id]}</h3><p>{topic.meta.subtitle}</p></div>
              <span className="row-meta">{topic.meta.readingTime}<br />{topic.meta.difficulty}</span><span className="row-arrow" aria-hidden="true">↗</span>
            </DepthLink>
          ))}
        </div>
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
