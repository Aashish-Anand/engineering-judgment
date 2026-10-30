import { describe, expect, it } from "vitest";
import { topicCatalog, type TopicId } from "@/data/topics/catalog";
import { choosePath, learningPaths, nextUnread, pathsForTopic, topicLearning } from "@/data/learning-paths";
import { articleGuides } from "@/data/article-guides";

// Guards that keep paths coherent as the library grows.
describe("learning paths", () => {
  it("places every published article in at least one path", () => {
    for (const topic of topicCatalog) expect(pathsForTopic(topic.id).length, topic.id).toBeGreaterThan(0);
  });

  it("uses unique slugs and never repeats an article within a path", () => {
    expect(new Set(learningPaths.map(path => path.slug)).size).toBe(learningPaths.length);
    for (const path of learningPaths) expect(new Set(path.steps).size, path.slug).toBe(path.steps.length);
  });

  it("never goes back to a shallower depth along a path", () => {
    for (const path of learningPaths) {
      const depths = path.steps.map(id => topicLearning[id].depth);
      expect(depths, path.slug).toEqual([...depths].sort((a, b) => a - b));
    }
  });

  it("puts prerequisites earlier when they share a path", () => {
    for (const path of learningPaths) {
      path.steps.forEach((id, index) => {
        for (const prerequisite of topicLearning[id].buildsOn) {
          const at = path.steps.indexOf(prerequisite);
          if (at !== -1) expect(at, `${prerequisite} before ${id} in ${path.slug}`).toBeLessThan(index);
        }
      });
    }
  });

  it("keeps prerequisites published and acyclic", () => {
    const published = new Set<TopicId>(topicCatalog.map(topic => topic.id));
    const visiting = new Set<TopicId>();
    const done = new Set<TopicId>();
    const visit = (id: TopicId) => {
      expect(visiting.has(id), `cycle through ${id}`).toBe(false);
      if (done.has(id)) return;
      visiting.add(id);
      for (const prerequisite of topicLearning[id].buildsOn) {
        expect(published.has(prerequisite)).toBe(true);
        expect(prerequisite).not.toBe(id);
        visit(prerequisite);
      }
      visiting.delete(id);
      done.add(id);
    };
    for (const id of published) visit(id);
  });

  it("prefers the reader's path and finds the next unread step", () => {
    expect(choosePath("idempotent-api")?.path.slug).toBe("correctness-under-failure");
    expect(choosePath("hot-partition", "load-and-hot-spots")?.index).toBe(2);
    const path = learningPaths[0];
    expect(nextUnread(path, id => id === path.steps[0])).toBe(path.steps[1]);
    expect(nextUnread(path, () => true)).toBeUndefined();
  });

  it("gives every article recognition signals and a complete quick reference", () => {
    for (const topic of topicCatalog) {
      const guide = articleGuides[topic.id];
      expect(guide.signals.length, topic.id).toBeGreaterThanOrEqual(3);
      expect(guide.quick.remember.length, topic.id).toBeGreaterThanOrEqual(3);
      for (const text of [...guide.signals, ...guide.quick.remember, guide.quick.invariant, guide.quick.decision, guide.quick.failure]) expect(text.trim().length).toBeGreaterThan(0);
    }
  });
});
