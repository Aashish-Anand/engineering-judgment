import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// The ⌘K palette finds sections and key terms inside articles and jumps to the section anchor.
async function search(page: Page, query: string) {
  const input = page.getByRole("combobox", { name: "Search" });
  // The shortcut listener attaches on hydration; retry until the palette opens.
  await expect(async () => {
    if (!(await input.isVisible())) await page.keyboard.press("Control+k");
    await expect(input).toBeFocused({ timeout: 1_000 });
  }).toPass();
  await input.fill(query);
  return input;
}

for (const [query, result, href] of [
  ["stampede", "Cache stampede", "/topics/traffic/fix-hot-partition#failures"],
  ["rollback", "Rollback itself creates divergence", "/topics/database/safely-migrate-production-database#failures"],
  ["wrong answers", "Common wrong answers", "/topics/traffic/fix-hot-partition#interview"],
] as const) {
  test(`searching for "${query}" lands on its section`, async ({ page }) => {
    await page.goto("/");
    const input = await search(page, query);
    const first = page.getByRole("option").first();
    await expect(first).toContainText(result);
    await expect(first).toHaveAttribute("aria-selected", "true");
    await expect(input).toHaveAttribute("aria-activedescendant", (await first.getAttribute("id"))!);
    await input.press("Enter");
    await expect(page).toHaveURL(href);
    await expect(page.locator(`section#${href.split("#")[1]}`)).toBeInViewport();
  });
}

test("arrow keys move through results across article groups", async ({ page }) => {
  await page.goto("/");
  const input = await search(page, "wrong answers");
  const options = page.getByRole("option");
  await expect(options.nth(1)).toBeVisible();
  await input.press("ArrowDown");
  await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
  await input.press("ArrowUp");
  await input.press("ArrowUp");
  await expect(options.last()).toHaveAttribute("aria-selected", "true");
  await input.press("Escape");
  await expect(input).toBeHidden();
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`open palette has no serious accessibility violations (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/");
    await search(page, "rollback");
    await expect(page.getByRole("option").first()).toContainText("Rollback itself creates divergence");
    const { violations } = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(violations.filter(v => v.impact === "serious" || v.impact === "critical").map(v => `${v.id}: ${v.nodes.map(n => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}
