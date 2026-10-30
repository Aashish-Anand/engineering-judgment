import type { Metadata } from "next";
import { LearningPaths } from "@/components/learning/LearningPaths";
import neo from "@/components/Neo.module.css";
import styles from "@/components/learning/Learning.module.css";

export const metadata: Metadata = {
  title: "Learning paths",
  description: "Ordered tracks through the blueprints, from core ideas to advanced production scenarios.",
  alternates: { canonical: "/paths" },
};

export default function PathsPage() {
  return (
    <div className={neo.surface}>
      <div className={styles.page}>
        <p className="eyebrow">Learning paths</p>
        <h1>Follow a path, not a pile of articles.</h1>
        <p className={styles.intro}>Each path orders blueprints from core ideas to advanced scenarios, so every article builds on the one before it. Your progress is saved in this browser only; there is no account.</p>
        <LearningPaths />
      </div>
    </div>
  );
}
