"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/data/theme";
import styles from "./ThemeToggle.module.css";

function subscribe(onChange: () => void) {
  // Restore appearance if React recovers the document after a render error.
  if (!document.documentElement.dataset.theme) {
    let saved;
    try { saved = localStorage.getItem(THEME_STORAGE_KEY); } catch { /* Use the system appearance. */ }
    document.documentElement.dataset.themePreference = saved === "dark" || saved === "light" ? saved : "system";
    document.documentElement.dataset.theme = saved === "dark" || saved === "light" ? saved : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const snapshot = () => document.documentElement.dataset.theme === "dark";
const serverSnapshot = () => false;

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const label = dark ? "Switch to light mode" : "Switch to dark mode";
  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.themePreference = next;
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch { /* Keep the choice for this page if storage is blocked. */ }
  }
  return <button type="button" className={styles.toggle} aria-label={label} title={label} onClick={toggle}>
    <svg className={styles.moon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z" /></svg>
    <svg className={styles.sun} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></svg>
  </button>;
}
