import Link from "next/link";
import { DepthLink } from "./DepthLink";

export function Hero() {
  return (
    <section className="home-hero page-shell">
      <div>
        <p className="eyebrow">Architecture under pressure</p>
        <h1>Understand the system.<br /><span>Make the call.</span></h1>
        <p className="hero-description">A field guide to the decisions that matter when systems reach their limits. Real constraints, considered trade-offs, and room to experiment.</p>
        <Link href="#problems" className="editorial-button">Explore the blueprints <span aria-hidden="true">↗</span></Link>
      </div>
      <DepthLink className="hero-feature" href="/topics/database/safely-migrate-production-database">
        <span className="eyebrow">Start here · Database migration</span>
        <h2>Keep the writes.<br />Move the database.</h2>
        <p>How to synchronize two systems, validate the result, and switch traffic with a way back.</p>
        <div className="migration-preview" aria-label="Source database streams changes to target database">
          <span>Source<br /><small>Serving traffic</small></span><span className="migration-connection">CDC →</span><span>Target<br /><small>Catching up</small></span>
        </div>
        <span className="feature-link">Read the blueprint <span aria-hidden="true">↗</span></span>
      </DepthLink>
    </section>
  );
}
