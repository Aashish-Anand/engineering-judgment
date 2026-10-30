import { describe, expect, it } from "vitest";
import { emptyProgress, markRead, markUnread, parseProgress, recordQuiz, recordVisit, setActivePath } from "@/data/progress";

describe("reader progress", () => {
  it("survives missing, corrupt, and partial storage", () => {
    expect(parseProgress(null)).toBe(emptyProgress);
    expect(parseProgress("{not json")).toBe(emptyProgress);
    expect(parseProgress('"text"')).toBe(emptyProgress);
    expect(parseProgress('{"read":{"a":1},"lastVisited":{"nope":1}}')).toEqual({ read: { a: 1 }, quiz: {}, lastVisited: undefined, activePath: undefined });
  });

  it("marks reading once and can undo it", () => {
    const read = markRead(emptyProgress, "a", 10);
    expect(read.read.a).toBe(10);
    expect(markRead(read, "a", 20)).toBe(read);
    expect(markUnread(read, "a").read.a).toBeUndefined();
  });

  it("keeps the best quiz score", () => {
    const first = recordQuiz(emptyProgress, "a", 3, 5, 1);
    expect(recordQuiz(first, "a", 2, 5, 2)).toBe(first);
    expect(recordQuiz(first, "a", 5, 5, 3).quiz.a).toEqual({ score: 5, total: 5, at: 3 });
  });

  it("remembers the last visit and the chosen path", () => {
    const p = setActivePath(recordVisit(emptyProgress, "a", 5), "path-x");
    expect(p.lastVisited).toEqual({ id: "a", at: 5 });
    expect(p.activePath).toBe("path-x");
  });
});
