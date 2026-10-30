import { build } from "velite";

// Tests render the MDX articles, so compile content/ first, as `next build` does.
export default async function setup() {
  await build({ clean: true, logLevel: "warn" });
}
