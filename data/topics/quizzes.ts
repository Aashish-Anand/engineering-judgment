import { judgmentQuiz as migration } from "./safely-migrate-production-database";
import { judgmentQuiz as flashSale } from "./survive-flash-sale";
import { judgmentQuiz as hotPartition } from "./fix-hot-partition";
import { judgmentQuiz as outbox } from "./transactional-outbox";
import type { TopicId } from "./catalog";
import type { QuizQuestion } from "@/components/JudgmentQuiz";

export const topicQuizzes: Record<TopicId, QuizQuestion[]> = {
  "database-migration": migration,
  "flash-sale": flashSale,
  "hot-partition": hotPartition,
  "transactional-outbox": outbox,
};
