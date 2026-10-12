import { describe, expect, it } from "vitest";
import { topicCatalog } from "@/data/topics/catalog";
import { topicQuizzes } from "@/data/topics/quizzes";

describe("published article quizzes", () => {
  for (const topic of topicCatalog) {
    it(`${topic.id} has a complete, unambiguous question set`, () => {
      const questions = topicQuizzes[topic.id];
      expect(questions.length).toBeGreaterThanOrEqual(5);
      expect(new Set(questions.map(question => question.scenario)).size).toBe(questions.length);
      for (const question of questions) {
        expect(question.scenario.trim().length).toBeGreaterThan(0);
        expect(question.options.length).toBeGreaterThanOrEqual(3);
        expect(question.options.filter(option => option.isCorrect)).toHaveLength(1);
        expect(new Set(question.options.map(option => option.text)).size).toBe(question.options.length);
        for (const option of question.options) {
          expect(option.text.trim().length).toBeGreaterThan(0);
          expect(option.explanation.trim().length).toBeGreaterThan(0);
        }
      }
      expect(new Set(questions.map(question => question.options.findIndex(option => option.isCorrect))).size).toBe(3);
    });
  }
});
