import { IdempotentApiArticle, PoisonMessagesArticle, RetryStormArticle, ConnectionPoolArticle, SchemaEvolutionArticle } from "./ProductionBlueprintArticle";
import type { ComponentType } from "react";
import type { TopicId } from "@/data/topics/catalog";
import { DatabaseMigrationArticle } from "@/components/articles/DatabaseMigrationArticle";
import { FlashSaleArticle } from "@/components/articles/FlashSaleArticle";
import { HotPartitionArticle } from "@/components/articles/HotPartitionArticle";
import { TransactionalOutboxArticle } from "@/components/articles/TransactionalOutboxArticle";

export const articleComponents: Record<TopicId, ComponentType> = {
  "idempotent-api": IdempotentApiArticle,
  "poison-messages": PoisonMessagesArticle,
  "retry-storm": RetryStormArticle,
  "connection-pool": ConnectionPoolArticle,
  "schema-evolution": SchemaEvolutionArticle,
  "hot-partition": HotPartitionArticle,
  "database-migration": DatabaseMigrationArticle,
  "flash-sale": FlashSaleArticle,
  "transactional-outbox": TransactionalOutboxArticle,
};
