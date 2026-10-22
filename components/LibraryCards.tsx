import Link from "next/link";
import { libraryDetails } from "@/data/library";
import type { TopicCatalogEntry } from "@/data/topics/catalog";
import styles from "./Library.module.css";

export function LibraryCards({ topics }: { topics: readonly TopicCatalogEntry[] }) {
  return <div className={styles.cards}>{topics.map(topic => <Link data-category={topic.meta.category} className={styles.card} href={topic.href} key={topic.id}>
    <span className={`eyebrow ${styles.categoryLabel}`}>{topic.meta.category}</span>
    <h3>{libraryDetails[topic.id].title}</h3>
    <p>{topic.meta.subtitle}</p>
    <span className={styles.cardFoot}>{topic.meta.readingTime}<span aria-hidden="true">Read blueprint ↗</span></span>
  </Link>)}</div>;
}
