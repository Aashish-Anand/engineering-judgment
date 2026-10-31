import { topicCatalog } from "@/data/topics/catalog";

/** Every public page, derived from the catalog so new blueprints are covered automatically. */
export const pages = [
  "/",
  "/library",
  "/paths",
  "/review",
  ...topicCatalog.flatMap((topic) => [topic.href, `${topic.href}/quiz`]),
];
