import { describe, expect, it } from "vitest";
import { productionBlueprints } from "@/data/topics/production-blueprints";
import { topicCatalog } from "@/data/topics/catalog";
import { blueprintConceptDiagrams } from "@/components/diagrams/BlueprintConceptDiagrams";
import { blueprintPractice } from "@/data/topics/blueprint-practice";

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
      const diagram = blueprintConceptDiagrams[blueprint.id];
      expect(diagram, "every data-driven blueprint has a concept diagram").toBeDefined();
      expect(blueprint.sections.map(section => section.id)).toContain(diagram!.sectionId);
      const practice = blueprintPractice[blueprint.id];
      expect(practice, "every data-driven blueprint has a sourced practice note").toBeDefined();
      expect(blueprint.sections.map(section => section.id)).toContain(practice!.sectionId);
      expect(practice!.sources.length).toBeGreaterThan(0);
      for (const [, href] of practice!.sources) expect(href).toMatch(/^https:\/\//);
      if (blueprint.incident) {
        expect(blueprint.sections.map(section => section.id)).toContain(blueprint.incident.sectionId);
        expect(blueprint.incident.source[1]).toMatch(/^https:\/\//);
      }
      if (blueprint.conceptCheck) {
        expect(blueprint.conceptCheck.options.filter(option => option.isCorrect)).toHaveLength(1);
        expect(blueprint.questions.map(question => question.scenario)).not.toContain(blueprint.conceptCheck.scenario);
      }
    });
  }
});
