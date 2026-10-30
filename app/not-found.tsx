import Link from "next/link";
import neo from "@/components/Neo.module.css";
import styles from "@/components/learning/Learning.module.css";

export default function NotFound() {
  return (
    <div className={neo.surface}>
      <section className={styles.page} aria-labelledby="not-found-title">
        <p className="eyebrow">404 · Page not found</p>
        <h1 id="not-found-title">This scenario hasn&apos;t been published yet.</h1>
        <p className={styles.intro}>The address doesn&apos;t match a published blueprint. Search the library by symptom, or follow a learning path.</p>
        <div className={styles.notFoundActions}>
          <Link className={styles.start} href="/library">Search the library →</Link>
          <Link href="/paths">Browse learning paths</Link>
          <Link href="/">Back to the homepage</Link>
        </div>
      </section>
    </div>
  );
}
