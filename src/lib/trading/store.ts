"use client";
import { useSyncExternalStore } from "react";
import type {
  FinancialAccountState,
  OrderStatus,
  TradeQuote,
} from "@/types/trading";
import {
  applyEvent,
  initialAccount,
  placeOrder,
  restoreAccount,
  serializeAccount,
} from "./engine";
export const ACCOUNT_KEY = "mp-financial-demo-v1";
const eventName = "mp-financial-changed";
interface Snapshot {
  state: FinancialAccountState;
  error: string | null;
  hydrated: boolean;
}
const serverSnapshot: Snapshot = { state: initialAccount(), error: null, hydrated: false };
let cachedRaw: string | null | undefined;
let cachedSnapshot = serverSnapshot;
const storageError: Snapshot = {
  state: serverSnapshot.state,
  hydrated: true,
  error:
    "No pudimos leer los datos locales. Habilitá el almacenamiento del navegador para usar la demo.",
};
export function getFinancialSnapshot(): Snapshot {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(ACCOUNT_KEY);
  } catch {
    return storageError;
  }
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  try {
    cachedSnapshot = {
      state: raw === null ? initialAccount() : restoreAccount(raw),
      hydrated: true,
      error: null,
    };
  } catch {
    cachedSnapshot = {
      state: initialAccount(),
      hydrated: true,
      error:
        "Los datos guardados de la demo están dañados o son incompatibles. Restablecé la demo para continuar.",
    };
  }
  return cachedSnapshot;
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(eventName, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(eventName, listener);
  };
}
export function useFinancialAccount() {
  return useSyncExternalStore(
    subscribe,
    getFinancialSnapshot,
    () => serverSnapshot,
  );
}
let queue: Promise<unknown> = Promise.resolve();
async function mutate(
  update: (state: FinancialAccountState) => FinancialAccountState,
  reset = false,
) {
  const commit = () => {
    const current = getFinancialSnapshot();
    if (current.error && !reset) throw new Error(current.error);
    const next = update(current.state);
    try {
      window.localStorage.setItem(ACCOUNT_KEY, serializeAccount(next));
    } catch {
      throw new Error(
        "No pudimos guardar la operación. No se aplicó ningún cambio. Revisá el almacenamiento del navegador.",
      );
    }
    cachedRaw = undefined;
    window.dispatchEvent(new window.Event(eventName));
    return next;
  };
  const run = () => {
    if (typeof window.navigator.locks?.request !== "function") throw new Error("Este navegador no permite guardar operaciones de forma segura entre pestañas. Usá un navegador actualizado con Web Locks. Tus datos no se modificaron.");
    return window.navigator.locks.request(ACCOUNT_KEY, commit);
  };
  const result = queue.then(run, run);
  queue = result.catch(() => {});
  return result;
}
export function confirmTrade(
  quote: TradeQuote,
  id: string,
  scenario: "immediate" | "sent" | "pending" | "rejected" = "immediate",
) {
  return mutate((state) =>
    placeOrder(state, quote, id, new Date().toISOString(), scenario),
  );
}
export function changeOrderStatus(
  id: string,
  status: Exclude<OrderStatus, "sent">,
) {
  return mutate((state) =>
    applyEvent(state, {
      kind: "transition",
      id,
      status,
      date: new Date().toISOString(),
    }),
  );
}
export function resetFinancialDemo() {
  return mutate(() => initialAccount(crypto.randomUUID()), true);
}
