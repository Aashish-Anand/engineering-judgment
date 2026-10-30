import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { socialMetadata } from "@/data/site";
import { LibraryBrowser } from "@/components/LibraryBrowser";
import neo from "@/components/Neo.module.css";
import styles from "@/components/Library.module.css";

const title = "Blueprint library";
const description = "Find production architecture decisions by problem, category, or failure mode.";
export const metadata: Metadata = { title, description, ...socialMetadata({ title, description, path: "/library" }) };

export default function LibraryPage() {
  return (
    <div className={neo.surface}>
      <div className={styles.page}>
        <div className={styles.intro}>
          <div><p className="eyebrow">The library</p><h1>Find your next engineering problem.</h1></div>
          <p>Search by symptom, filter by category, or follow a <Link href="/paths">learning path</Link> for an ordered route.</p>
        </div>
        <Suspense fallback={<p>Loading the library…</p>}><LibraryBrowser /></Suspense>
      </div>
    </div>
  );
}
