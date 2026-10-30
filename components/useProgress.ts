"use client";

import { useSyncExternalStore } from "react";
import { emptyProgress, parseProgress, PROGRESS_STORAGE_KEY, type Progress } from "@/data/progress";

/* One shared store over localStorage. Reads are cached by raw string so useSyncExternalStore gets a
   stable snapshot; writes notify this tab directly and other tabs through the storage event. */

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cached: Progress = emptyProgress;

function readRaw() {
  try { return localStorage.getItem(PROGRESS_STORAGE_KEY); } catch { return null; }
}

function snapshot() {
  const raw = readRaw();
  if (raw !== cachedRaw) { cachedRaw = raw; cached = parseProgress(raw); }
  return cached;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key === PROGRESS_STORAGE_KEY || event.key === null) listener(); };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}

/** Applies a pure update from data/progress.ts. Silently does nothing when storage is unavailable. */
export function updateProgress(update: (progress: Progress) => Progress) {
  const next = update(snapshot());
  if (next === cached) return;
  try { localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next)); } catch { return; }
  listeners.forEach(listener => listener());
}

/** Empty on the server and during hydration, then the reader's saved progress. */
export function useProgress() {
  return useSyncExternalStore(subscribe, snapshot, () => emptyProgress);
}
