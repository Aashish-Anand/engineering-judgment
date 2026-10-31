import { IdempotentApiArticle, PoisonMessagesArticle, RetryStormArticle, ConnectionPoolArticle, SchemaEvolutionArticle } from "./ProductionBlueprintArticle";
import type { ComponentType } from "react";
import type { TopicId } from "@/data/topics/catalog";
import { createElement } from "react";
import { MdxBlueprintArticle } from "@/components/articles/BlueprintMdx";

export const articleComponents: Record<TopicId, ComponentType> = {
  "idempotent-api": IdempotentApiArticle,
  "poison-messages": PoisonMessagesArticle,
  "retry-storm": RetryStormArticle,
  "connection-pool": ConnectionPoolArticle,
  "schema-evolution": SchemaEvolutionArticle,
  "hot-partition": () => createElement(MdxBlueprintArticle, { topicId: "hot-partition" }),
  "database-migration": () => createElement(MdxBlueprintArticle, { topicId: "database-migration" }),
  "flash-sale": () => createElement(MdxBlueprintArticle, { topicId: "flash-sale" }),
  "transactional-outbox": () => createElement(MdxBlueprintArticle, { topicId: "transactional-outbox" }),
  "cache-stampede": () => createElement(MdxBlueprintArticle, { topicId: "cache-stampede" }),
  "rate-limiting": () => createElement(MdxBlueprintArticle, { topicId: "rate-limiting" }),
};
