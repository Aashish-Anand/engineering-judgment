import { buildSearchIndex } from "@/data/search-index";

// Prerendered at build time into a static file; the ⌘K palette fetches it on first open.
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchIndex());
}
