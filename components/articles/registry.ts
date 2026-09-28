import type { ComponentType } from "react";
import type { TopicId } from "@/data/topics/catalog";
import { DatabaseMigrationArticle } from "@/components/articles/DatabaseMigrationArticle";
import { FlashSaleArticle } from "@/components/articles/FlashSaleArticle";
import { HotPartitionArticle } from "@/components/articles/HotPartitionArticle";
import { TransactionalOutboxArticle } from "@/components/articles/TransactionalOutboxArticle";

export const articleComponents: Record<TopicId, ComponentType> = {
  "hot-partition": HotPartitionArticle,
  "database-migration": DatabaseMigrationArticle,
  "flash-sale": FlashSaleArticle,
  "transactional-outbox": TransactionalOutboxArticle,
};
