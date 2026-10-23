import Link from "next/link";
import { featuredIds, libraryCategories, libraryDetails, libraryHref } from "@/data/library";
import { Hero } from "@/components/Hero";
import { ArchitecturePressurePreview } from "@/components/ArchitecturePressurePreview";
import { topicCatalog } from "@/data/topics/catalog";
import styles from "@/components/Home.module.css";
import neo from "@/components/Neo.module.css";

const previews = [
  { nodes: ["SOURCE", "CDC", "TARGET"], note: "Keep the writes. Change the owner." },
  { nodes: ["REQUEST", "KEY", "ONCE"], note: "Same request. One effect." },
  { nodes: ["HOT KEY", "SALT", "SHARDS"], note: "Spread the heat." },
  { nodes: ["QUEUE", "RETRY", "DLQ"], note: "Give bad messages a way out." },
  { nodes: ["TIMEOUT", "BACKOFF", "RETRY"], note: "Give the system room to recover." },
  { nodes: ["EXPAND", "MOVE", "CONTRACT"], note: "Let old and new coexist." },
];

export default function Home() {
  return (
    <div className={`${neo.surface} ${styles.home}`}>
      <Hero />
      <div className={styles.principles} aria-label="The learning approach"><span>REAL PROBLEMS</span><b aria-hidden="true">✳</b><span>VISIBLE TRADE-OFFS</span><b aria-hidden="true">✳</b><span>HANDS-ON EXPERIMENTS</span><b aria-hidden="true">✳</b><span>BETTER ENGINEERING JUDGMENT</span></div>
      <section id="problems" className={styles.library}>
        <div className={styles.sectionIntro}><div><p className={styles.eyebrow}>01 / The problem library</p><h2>Good decisions start<br />with a hard problem.</h2></div><p>Go beyond the architecture diagram. Follow the constraints, find the failure, and understand what happens next.</p></div>
        <form action="/library" className={styles.search} role="search"><label htmlFor="home-search">What are you trying to solve?</label><div><input id="home-search" type="search" name="q" placeholder="Try ‘charged twice’ or ‘connection pool’" /><button type="submit">Find a blueprint <span aria-hidden="true">↗</span></button></div></form>
        <nav className={styles.categories} aria-label="Browse by category">{libraryCategories.map(c => <Link href={libraryHref("", c.slug)} key={c.slug}>{c.label}<span>{c.count}</span></Link>)}</nav>
        <div className={styles.cards}>{featuredIds.map((id, index) => {
          const topic = topicCatalog.find(t => t.id === id)!;
          const preview = previews[index];
          return <Link className={styles.card} href={topic.href} key={id}>
            <div className={styles.cardArt}><div className={styles.cardArtLabel}><span>{topic.meta.category}</span><span>0{index + 1} ↗</span></div><div className={styles.miniFlow}>{preview.nodes.map((node, i) => <span key={node}>{i > 0 && <b aria-hidden="true">→</b>}<strong>{node}</strong></span>)}</div><p>{preview.note}</p></div>
            <div className={styles.cardBody}><h3>{libraryDetails[id].title}</h3><p>{topic.meta.subtitle}</p><div className={styles.cardFoot}><span>{topic.meta.readingTime}</span><span>Open blueprint ↗</span></div></div>
          </Link>;
        })}</div>
        <div className={styles.browse}><Link className={styles.button} href="/library">Explore all {topicCatalog.length} blueprints <span aria-hidden="true">↗</span></Link><span>Follow your curiosity. Bring your skepticism.</span></div>
      </section>
      <section id="labs" className={styles.labBand}><div className={styles.labs}>
        <div className={styles.labCopy}><p className={styles.eyebrow}>02 / Less theory. More “what if?”</p><h2>Turn a knob.<br />Break an <span>assumption.</span></h2><p>What happens when traffic spikes? When replication falls behind? Change the load and watch the consequence.</p><div className={styles.labSteps}><span>01 &nbsp; Pick a system</span><span>02 &nbsp; Add some pressure</span><span>03 &nbsp; Follow the failure</span></div><p className={styles.simulationNote}>Illustrative simulations. Each blueprint explains the assumptions and gives you deeper controls.</p></div>
        <div className={styles.workbench}><div className={styles.workbenchLabel}>YOUR EXPERIMENT STARTS HERE <span aria-hidden="true">↘</span></div><ArchitecturePressurePreview /></div>
      </div></section>
      <section id="about" className={styles.about}><div><p className={styles.eyebrow}>03 / The engineering mindset</p><h2>The diagram is<br />just the beginning.</h2></div><div><p>What is the constraint? Where does the first failure appear? What does this decision make harder later?</p><p>Engineering Judgment is a collection of worked problems for engineers who want to understand how systems behave in production. Build intuition through explanations, architecture diagrams, and experiments you control.</p><div className={styles.reasoning}><span>Constraint</span><b>→</b><span>Decision</span><b>→</b><span>Trade-off</span><b>→</b><span>Consequence</span></div><Link className={styles.secondaryLink} href="/topics/database/safely-migrate-production-database#career-rubric">Learn to explain the decision ↗</Link></div></section>
    </div>
  );
}
