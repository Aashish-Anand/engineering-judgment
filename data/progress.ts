/* Reader progress kept only in the reader's browser. No account, no server, no tracking. */

export const PROGRESS_STORAGE_KEY = "engineering-judgment-progress-v1";

export type QuizResult = { score: number; total: number; at: number };
/** A quiz decision scheduled for review. `step` indexes REVIEW_INTERVAL_DAYS. */
export type ReviewItem = { due: number; step: number };
export type Progress = {
  read: Record<string, number>;
  quiz: Record<string, QuizResult>;
  reviews?: Record<string, ReviewItem>;
  lastVisited?: { id: string; at: number };
  activePath?: string;
};

export const emptyProgress: Progress = Object.freeze({ read: {}, quiz: {} }) as Progress;

/** Accepts anything from storage; returns a well-formed object or the empty state. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress;
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object") return emptyProgress;
    const read = value.read && typeof value.read === "object" ? value.read : {};
    const quiz = value.quiz && typeof value.quiz === "object" ? value.quiz : {};
    const lastVisited = value.lastVisited && typeof value.lastVisited.id === "string" ? value.lastVisited : undefined;
    const activePath = typeof value.activePath === "string" ? value.activePath : undefined;
    const reviews = value.reviews && typeof value.reviews === "object" ? value.reviews : undefined;
    return { read, quiz, lastVisited, activePath, reviews };
  } catch {
    return emptyProgress;
  }
}

export const markRead = (p: Progress, id: string, at = Date.now()): Progress => (p.read[id] ? p : { ...p, read: { ...p.read, [id]: at } });
export const markUnread = (p: Progress, id: string): Progress => {
  const read = { ...p.read };
  delete read[id];
  return { ...p, read };
};
export const recordVisit = (p: Progress, id: string, at = Date.now()): Progress => ({ ...p, lastVisited: { id, at } });
export const setActivePath = (p: Progress, slug: string): Progress => ({ ...p, activePath: slug });
/** Keeps the best score, so retrying a quiz never lowers it. */
export const recordQuiz = (p: Progress, id: string, score: number, total: number, at = Date.now()): Progress => {
  const previous = p.quiz[id];
  if (previous && previous.score / previous.total > score / total) return p;
  return { ...p, quiz: { ...p.quiz, [id]: { score, total, at } } };
};

/* ── Spaced review (Leitner-style) ──
   A wrong answer returns in 3 days. Each right answer moves the decision to the next interval;
   a right answer at the last interval retires it from the queue. */
export const REVIEW_INTERVAL_DAYS = [3, 7, 21];
const DAY = 24 * 60 * 60 * 1000;

/** Stable key for one quiz question: article ID plus a short hash of the scenario text. Editing the
    question text simply retires the old entry, because its key no longer matches any question. */
export function reviewKey(topicId: string, scenario: string) {
  let hash = 5381;
  for (let i = 0; i < scenario.length; i++) hash = ((hash << 5) + hash + scenario.charCodeAt(i)) | 0;
  return `${topicId}:${(hash >>> 0).toString(36)}`;
}

export function recordAnswer(p: Progress, key: string, correct: boolean, now = Date.now()): Progress {
  const reviews = { ...(p.reviews ?? {}) };
  if (!correct) {
    reviews[key] = { step: 0, due: now + REVIEW_INTERVAL_DAYS[0] * DAY };
  } else {
    const step = (reviews[key]?.step ?? 0) + 1;
    if (step >= REVIEW_INTERVAL_DAYS.length) delete reviews[key];
    else reviews[key] = { step, due: now + REVIEW_INTERVAL_DAYS[step] * DAY };
  }
  return { ...p, reviews };
}

/** Keys due now, oldest first. Only keys the caller still recognises should be shown. */
export function dueReviewKeys(p: Progress, now = Date.now()) {
  return Object.entries(p.reviews ?? {})
    .filter(([, item]) => item.due <= now)
    .sort(([, a], [, b]) => a.due - b.due)
    .map(([key]) => key);
}

/** Earliest upcoming due time, for "next review in N days". */
export function nextReviewAt(p: Progress) {
  const dues = Object.values(p.reviews ?? {}).map(item => item.due);
  return dues.length ? Math.min(...dues) : undefined;
}
