"use client";
import { useSyncExternalStore } from "react";
import { assets } from "@/lib/mocks/assets";
export const WATCHLIST_KEY = "mp-demo-watchlist-v1";
const changeEvent = "mp-watchlist-change";
let memory = "[]";
let storageFailed = false;
export function parseWatchlist(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const validIds = new Set(assets.map((asset) => asset.id));
    return [
      ...new Set(
        value.filter(
          (id): id is string => typeof id === "string" && validIds.has(id),
        ),
      ),
    ];
  } catch {
    return [];
  }
}
function snapshot() {
  try {
    return storageFailed
      ? memory
      : (window.localStorage.getItem(WATCHLIST_KEY) ?? "[]");
  } catch {
    return memory;
  }
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(changeEvent, callback);
  };
}
export function toggleFavorite(id: string) {
  if (!assets.some((asset) => asset.id === id)) return;
  const ids = parseWatchlist(snapshot());
  memory = JSON.stringify(
    ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
  );
  try {
    window.localStorage.setItem(WATCHLIST_KEY, memory);
    storageFailed = false;
  } catch {
    storageFailed = true;
  }
  window.dispatchEvent(new window.Event(changeEvent));
}
export function useWatchlist() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const warning = useSyncExternalStore(
    subscribe,
    () => storageFailed,
    () => false,
  );
  return {
    favorites: parseWatchlist(raw),
    toggleFavorite,
    storageFailed: warning,
  };
}
