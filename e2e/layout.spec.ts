import { expect, test } from "@playwright/test";
import { pages, snapshotName } from "./pages";

for (const path of pages) {
  test.describe(path, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
    });

    test("fits the viewport without horizontal scroll", async ({ page }) => {
      const overflow = await page.evaluate(() => {
        const width = document.documentElement.clientWidth;
        // body clips overflow as a safety net, so measure the elements themselves.
        return [...document.querySelectorAll("body *")]
          .filter((el) => {
            const box = el.getBoundingClientRect();
            if (box.width === 0 || box.right <= width + 1) return false;
            // Content inside its own scroll container is fine.
            for (let p = el.parentElement; p; p = p.parentElement) {
              const { overflowX } = getComputedStyle(p);
              if (overflowX === "auto" || overflowX === "scroll" || overflowX === "hidden") return false;
            }
            return true;
          })
          .slice(0, 5)
          .map((el) => `${el.tagName.toLowerCase()}.${el.className} → ${Math.round(el.getBoundingClientRect().right)}px`);
      });
      expect(overflow, "elements wider than the viewport").toEqual([]);
    });

    test("shows all content without scrolling to it", async ({ page }) => {
      const hidden = await page.locator(".reveal").evaluateAll((els) =>
        els.filter((el) => Number(getComputedStyle(el).opacity) < 1).length,
      );
      expect(hidden, "reveal blocks still invisible").toBe(0);
    });

    test("matches the screenshot", async ({ page }) => {
      await expect(page).toHaveScreenshot(snapshotName(path), { fullPage: true });
    });
  });
}
