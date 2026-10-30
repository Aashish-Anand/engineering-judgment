import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
};

// Compile content/ with Velite before Next reads .velite/ (and watch it in dev).
// Next loads this config in more than one process; build only once.
export default async function config(phase: string): Promise<NextConfig> {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  if ((dev || phase === PHASE_PRODUCTION_BUILD) && !process.env.VELITE_STARTED) {
    process.env.VELITE_STARTED = "1";
    const { build } = await import("velite");
    await build({ watch: dev, clean: !dev });
  }
  return nextConfig;
}
