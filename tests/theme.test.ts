import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { themeInitScript, THEME_STORAGE_KEY } from "@/data/theme";

function bootstrap(saved: string | null, systemDark: boolean, storageBlocked = false) {
  const root = { dataset: {} as Record<string,string> };
  const media = { matches: systemDark, addEventListener: (_: string, fn: () => void) => { systemChange = fn; } };
  let systemChange = () => {};
  let storageChange: (event: {key: string | null; newValue: string | null}) => void = () => {};
  runInNewContext(themeInitScript, {
    document: { documentElement: root },
    localStorage: { getItem: () => { if (storageBlocked) throw new Error("blocked"); return saved; } },
    window: { matchMedia: () => media, addEventListener: (_: string, fn: typeof storageChange) => { storageChange = fn; } },
  });
  return { root, media, changeSystem: () => systemChange(), changeStorage: (value: string | null, key: string | null = THEME_STORAGE_KEY) => storageChange({key, newValue:value}) };
}

describe("theme bootstrap before hydration", () => {
  it("uses system appearance until an explicit choice is stored", () => {
    const env=bootstrap(null,true);
    expect(env.root.dataset.theme).toBe("dark");
    env.media.matches=false; env.changeSystem();
    expect(env.root.dataset.theme).toBe("light");
  });
  it("preserves explicit light and dark choices regardless of system changes", () => {
    for (const theme of ["light", "dark"]) {
      const env=bootstrap(theme,theme !== "dark");
      env.media.matches=!env.media.matches; env.changeSystem();
      expect(env.root.dataset.theme).toBe(theme);
    }
  });
  it("falls back to the system for blocked or invalid storage", () => {
    expect(bootstrap(null,true,true).root.dataset.theme).toBe("dark");
    expect(bootstrap("unexpected",false).root.dataset.theme).toBe("light");
  });
  it("synchronizes choices across tabs and resumes system appearance when cleared", () => {
    const env=bootstrap("light",true);
    env.changeStorage("dark"); expect(env.root.dataset.theme).toBe("dark");
    env.changeStorage("light", "unrelated"); expect(env.root.dataset.theme).toBe("dark");
    env.changeStorage(null); expect(env.root.dataset.themePreference).toBe("system");
    expect(env.root.dataset.theme).toBe("dark");
  });
});
