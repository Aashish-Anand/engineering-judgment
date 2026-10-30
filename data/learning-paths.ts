import type { TopicId } from "./topics/catalog";

/*
 * Learning paths are curated, ordered tracks through the library. They are designed to grow:
 *  - Every article declares its depth and the articles it builds on (`topicLearning`). The Record type
 *    forces a new article to add an entry, and tests require it to appear in at least one path.
 *  - A path is an ordered list of article IDs. An article may sit in several paths.
 *  - Tests enforce that depth never decreases along a path, that an article's prerequisites come
 *    earlier when they share a path, and that prerequisites never form a cycle.
 * When a path grows past about six steps, split it into a follow-on path rather than lengthening it.
 */

export type Depth = 1 | 2 | 3;
export const depthLabels: Record<Depth, string> = { 1: "Core", 2: "Applied", 3: "Advanced" };

export const topicLearning: Record<TopicId, { depth: Depth; buildsOn: TopicId[] }> = {
  "idempotent-api": { depth: 1, buildsOn: [] },
  "retry-storm": { depth: 1, buildsOn: [] },
  "connection-pool": { depth: 1, buildsOn: [] },
  "schema-evolution": { depth: 1, buildsOn: [] },
  "transactional-outbox": { depth: 2, buildsOn: ["idempotent-api"] },
  "poison-messages": { depth: 2, buildsOn: ["transactional-outbox"] },
  "hot-partition": { depth: 2, buildsOn: [] },
  "flash-sale": { depth: 3, buildsOn: ["hot-partition", "idempotent-api"] },
  "database-migration": { depth: 3, buildsOn: ["schema-evolution"] },
};

export type LearningPath = { slug: string; title: string; outcome: string; steps: TopicId[] };

export const learningPaths: LearningPath[] = [
  {
    slug: "correctness-under-failure",
    title: "Correctness under failure",
    outcome: "Make every business effect happen once, even when networks time out, processes crash, and messages arrive twice.",
    steps: ["idempotent-api", "transactional-outbox", "poison-messages"],
  },
  {
    slug: "load-and-hot-spots",
    title: "Load, overload, and hot spots",
    outcome: "Keep one slow dependency, one busy key, or one sales spike from taking everything else down with it.",
    steps: ["retry-storm", "connection-pool", "hot-partition", "flash-sale"],
  },
  {
    slug: "changing-live-systems",
    title: "Changing live systems",
    outcome: "Change schemas and move data while old and new code run side by side, without downtime or lost writes.",
    steps: ["schema-evolution", "database-migration"],
  },
];

export function getPath(slug: string | undefined) {
  return learningPaths.find(path => path.slug === slug);
}

/** Every path that contains the article, with its zero-based position. */
export function pathsForTopic(id: TopicId) {
  return learningPaths.flatMap(path => {
    const index = path.steps.indexOf(id);
    return index === -1 ? [] : [{ path, index }];
  });
}

/** The reader's chosen path if it contains the article; otherwise the first path that does. */
export function choosePath(id: TopicId, preferredSlug?: string) {
  const options = pathsForTopic(id);
  return options.find(option => option.path.slug === preferredSlug) ?? options[0];
}

/** First step the reader has not finished, or undefined when the whole path is read. */
export function nextUnread(path: LearningPath, isRead: (id: TopicId) => boolean) {
  return path.steps.find(id => !isRead(id));
}
