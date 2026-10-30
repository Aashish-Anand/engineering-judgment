import { describe, expect, it } from "vitest";
import { productionBlueprints } from "@/data/topics/production-blueprints";
import { topicCatalog } from "@/data/topics/catalog";

const publishedIds = new Set(topicCatalog.map(topic => topic.id));

describe("data-driven blueprint content", () => {
  for (const blueprint of productionBlueprints) {
    it(`${blueprint.id} answers every follow-up and links only to published topics`, () => {
      expect(blueprint.followups.length).toBeGreaterThan(0);
      for (const [question, answer] of blueprint.followups) {
        expect(question.trim().length).toBeGreaterThan(0);
        expect(answer?.trim().length).toBeGreaterThan(0);
      }
      for (const id of blueprint.related) {
        expect(publishedIds.has(id)).toBe(true);
        expect(id).not.toBe(blueprint.id);
      }
      if (blueprint.conceptCheck) {
        expect(blueprint.conceptCheck.options.filter(option => option.isCorrect)).toHaveLength(1);
        expect(blueprint.questions.map(question => question.scenario)).not.toContain(blueprint.conceptCheck.scenario);
      }
    });
  }
});
