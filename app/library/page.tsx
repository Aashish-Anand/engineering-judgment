import { Suspense } from "react";
import type { Metadata } from "next";
import { LibraryBrowser } from "@/components/LibraryBrowser";
export const metadata: Metadata = { title: "Blueprint library", description: "Find production architecture decisions by problem, category, or failure mode.", alternates: { canonical: "/library" } };
export default function LibraryPage() {
  return <div className="page-shell home-section"><div className="section-intro"><div><p className="eyebrow">The library</p><h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Find your next engineering problem.</h1></div><p>Search by symptom, explore a category, or follow your curiosity.</p></div><Suspense fallback={<p>Loading the library…</p>}><LibraryBrowser /></Suspense></div>;
}
