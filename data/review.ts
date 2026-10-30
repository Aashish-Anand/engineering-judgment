import type { QuizQuestion } from "@/components/JudgmentQuiz";
import type { TopicId } from "./topics/catalog";
import { topicQuizzes } from "./topics/quizzes";
import { reviewKey } from "./progress";

/** Every quiz question with its stable review key, so a saved key can be turned back into a question. */
export const reviewQuestions: { key: string; topicId: TopicId; question: QuizQuestion }[] = (Object.entries(topicQuizzes) as [TopicId, QuizQuestion[]][])
  .flatMap(([topicId, questions]) => questions.map(question => ({ key: reviewKey(topicId, question.scenario), topicId, question })));

export const reviewQuestionByKey = new Map(reviewQuestions.map(item => [item.key, item]));

/** Most decisions shown in one review session, so a session stays short. */
export const REVIEW_SESSION_SIZE = 8;
