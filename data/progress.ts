/* Reader progress kept only in the reader's browser. No account, no server, no tracking. */

export const PROGRESS_STORAGE_KEY = "engineering-judgment-progress-v1";

export type QuizResult = { score: number; total: number; at: number };
export type Progress = {
  read: Record<string, number>;
  quiz: Record<string, QuizResult>;
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
    return { read, quiz, lastVisited, activePath };
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
