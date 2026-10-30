import { describe, expect, it } from "vitest";
import { dueReviewKeys, emptyProgress, markRead, markUnread, nextReviewAt, parseProgress, recordAnswer, recordQuiz, recordVisit, reviewKey, setActivePath } from "@/data/progress";

describe("reader progress", () => {
  it("survives missing, corrupt, and partial storage", () => {
    expect(parseProgress(null)).toBe(emptyProgress);
    expect(parseProgress("{not json")).toBe(emptyProgress);
    expect(parseProgress('"text"')).toBe(emptyProgress);
    expect(parseProgress('{"read":{"a":1},"lastVisited":{"nope":1}}')).toEqual({ read: { a: 1 }, quiz: {}, lastVisited: undefined, activePath: undefined, reviews: undefined });
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

  it("schedules wrong answers in 3 days and walks right answers through 7 and 21 days", () => {
    const day = 24 * 60 * 60 * 1000;
    const key = reviewKey("a", "Scenario text");
    expect(reviewKey("a", "Scenario text")).toBe(key);
    expect(reviewKey("a", "Edited text")).not.toBe(key);

    const wrong = recordAnswer(emptyProgress, key, false, 0);
    expect(wrong.reviews![key]).toEqual({ step: 0, due: 3 * day });
    expect(dueReviewKeys(wrong, 2 * day)).toEqual([]);
    expect(dueReviewKeys(wrong, 3 * day)).toEqual([key]);

    const right1 = recordAnswer(wrong, key, true, 3 * day);
    expect(right1.reviews![key]).toEqual({ step: 1, due: 10 * day });
    const right2 = recordAnswer(right1, key, true, 10 * day);
    expect(right2.reviews![key]).toEqual({ step: 2, due: 31 * day });
    expect(recordAnswer(right2, key, true, 31 * day).reviews![key]).toBeUndefined();
    expect(recordAnswer(right2, key, false, 31 * day).reviews![key].step).toBe(0);
  });

  it("orders due reviews oldest first and reports the next due time", () => {
    let p = recordAnswer(emptyProgress, "a:1", false, 10);
    p = recordAnswer(p, "a:2", false, 0);
    expect(dueReviewKeys(p, 10 ** 12)).toEqual(["a:2", "a:1"]);
    expect(nextReviewAt(p)).toBe(3 * 24 * 60 * 60 * 1000);
    expect(nextReviewAt(emptyProgress)).toBeUndefined();
  });
});
