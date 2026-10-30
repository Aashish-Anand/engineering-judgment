import { topicCatalog } from "@/data/topics/catalog";

/** Every public page, derived from the catalog so new blueprints are covered automatically. */
export const pages = [
  "/",
  "/library",
  "/paths",
  "/review",
  ...topicCatalog.flatMap((topic) => [topic.href, `${topic.href}/quiz`]),
];

/** A stable, filesystem-safe name for a page's screenshot. */
export function snapshotName(path: string) {
  return `${path === "/" ? "home" : path.slice(1).replaceAll("/", "__")}.png`;
}
