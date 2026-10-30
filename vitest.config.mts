import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // Browser tests in e2e/ run under Playwright, not Vitest.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
