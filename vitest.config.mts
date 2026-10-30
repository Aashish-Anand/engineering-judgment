import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      "#site/content": fileURLToPath(new URL("./.velite", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globalSetup: ["./tests/setup/velite.ts"],
    // Browser tests in e2e/ run under Playwright, not Vitest.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
