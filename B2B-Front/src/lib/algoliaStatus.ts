import { useSyncExternalStore } from "react";


export type AlgoliaMode = "online" | "fallback";

export type AlgoliaStatus = {
  mode: AlgoliaMode;

  reason: string | null;
  since: number | null;
};

let status: AlgoliaStatus = { mode: "online", reason: null, since: null };
const listeners = new Set<() => void>();

export function getAlgoliaStatus(): AlgoliaStatus {
  return status;
}

export function setAlgoliaStatus(mode: AlgoliaMode, reason: string | null = null): void {
  if (status.mode === mode && status.reason === reason) return;
  status = { mode, reason, since: mode === "fallback" ? Date.now() : null };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAlgoliaStatus(): AlgoliaStatus {
  return useSyncExternalStore(subscribe, getAlgoliaStatus, getAlgoliaStatus);
}

/**
 * Bandera para DEMOSTRAR la contingencia sin apagar internet:
 *   localStorage.setItem("bombocars:simulate-algolia-down", "1")  -> simula caida
 *   localStorage.removeItem("bombocars:simulate-algolia-down")    -> vuelve a normal
 */
export const SIMULATE_DOWN_KEY = "bombocars:simulate-algolia-down";

export function isAlgoliaDownSimulated(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(SIMULATE_DOWN_KEY) === "1";
  } catch {
    return false;
  }
}