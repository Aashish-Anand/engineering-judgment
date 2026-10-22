import { productionBlueprints } from "./production-blueprints";
import { judgmentQuiz as migration } from "./safely-migrate-production-database";
import { judgmentQuiz as flashSale } from "./survive-flash-sale";
import { judgmentQuiz as hotPartition } from "./fix-hot-partition";
import { judgmentQuiz as outbox } from "./transactional-outbox";
import type { TopicId } from "./catalog";
import type { QuizQuestion } from "@/components/JudgmentQuiz";

export const topicQuizzes: Record<TopicId, QuizQuestion[]> = {
  "idempotent-api": productionBlueprints.find(topic => topic.id === "idempotent-api")!.questions,
  "poison-messages": productionBlueprints.find(topic => topic.id === "poison-messages")!.questions,
  "retry-storm": productionBlueprints.find(topic => topic.id === "retry-storm")!.questions,
  "connection-pool": productionBlueprints.find(topic => topic.id === "connection-pool")!.questions,
  "schema-evolution": productionBlueprints.find(topic => topic.id === "schema-evolution")!.questions,
  "database-migration": migration,
  "flash-sale": flashSale,
  "hot-partition": hotPartition,
  "transactional-outbox": outbox,
};
