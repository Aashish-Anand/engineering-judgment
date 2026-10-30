import { defineCollection, defineConfig, s } from "velite";

/*
 * Blueprint prose (sections 01–05) lives in content/blueprints/*.mdx.
 * Velite validates the frontmatter and compiles the MDX into .velite/, which
 * components/articles/BlueprintMdx.tsx renders. Sections 06–12 stay typed data
 * in data/topics/. See docs/ARTICLE_AUTHORING.md.
 */

type MdNode = { type: string; lang?: string | null; meta?: string | null; value?: string; children?: MdNode[]; [key: string]: unknown };

/** Turns ```lang filename="x.ts" fences into <CodeBlock>, the site's copyable code panel. */
function remarkCodeBlock() {
  const attribute = (name: string, value: string) => ({ type: "mdxJsxAttribute", name, value });
  const visit = (node: MdNode) => {
    node.children?.forEach((child, i) => {
      if (child.type !== "code") return visit(child);
      const filename = child.meta?.match(/filename="([^"]+)"/)?.[1];
      node.children![i] = {
        type: "mdxJsxFlowElement",
        name: "CodeBlock",
        attributes: [
          ...(child.lang ? [attribute("language", child.lang)] : []),
          ...(filename ? [attribute("filename", filename)] : []),
          attribute("code", child.value ?? ""),
        ],
        children: [],
      };
    });
  };
  return (tree: MdNode) => visit(tree);
}

const blueprints = defineCollection({
  name: "Blueprint",
  pattern: "blueprints/*.mdx",
  schema: s.object({
    /** A TopicId from data/topics/catalog.ts; tests/blueprint-mdx.test.ts checks it. */
    topic: s.string(),
    /** Headings of the six topic-specific sections; also the chapter navigation labels. */
    sections: s.object({
      problem: s.string(),
      naive: s.string(),
      "mental-model": s.string(),
      architecture: s.string(),
      "worked-example": s.string(),
      scale: s.string(),
    }),
    /** Optional "Architecture brief & key thresholds" disclosure. */
    brief: s.object({
      timeToRead: s.string().optional(),
      bottleneck: s.string(),
      solution: s.string(),
      goldenRule: s.string(),
      keyMetrics: s.array(s.object({ label: s.string(), value: s.string() })).optional(),
    }).optional(),
    /** Primary references: listed in section 12 and cited by <InPractice>. */
    sources: s.array(s.object({ label: s.string(), href: s.string().url() })).min(1),
    body: s.mdx(),
    /** The MDX source, for the build-time search index (data/search-index.ts). */
    raw: s.raw(),
  }),
});

export default defineConfig({
  root: "content",
  strict: true,
  output: { data: ".velite", assets: ".velite/static", base: "/static/", clean: true },
  collections: { blueprints },
  mdx: { remarkPlugins: [remarkCodeBlock], copyLinkedFiles: false },
});
