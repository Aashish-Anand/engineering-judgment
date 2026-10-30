"use client";

import { useEffect } from "react";

/**
 * Marks <html data-hydrated> once React has hydrated the page. Rendered last in the root layout, so its effect
 * runs after every component's first client render. Browser tests wait for it before measuring or taking
 * screenshots, because some components (such as StepScrubber) render a static fallback on the server.
 */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);
  return null;
}
