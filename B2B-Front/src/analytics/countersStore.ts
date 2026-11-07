import { readJSON, writeJSON } from "../lib/safeStorage";
import { storageKeys } from "../lib/storageKeys";
import { ANALYTICS_EVENT_TYPES } from "./types";
import type { AnalyticsEventType } from "./types";

const METRICS_VERSION = 1;

export type EventCounters = Record<AnalyticsEventType, number>;

export function emptyCounters(): EventCounters {
  return {
    LOGIN: 0,
    LOGOUT: 0,
    SEARCH: 0,
    PRODUCT_VIEW: 0,
    ADD_TO_CART: 0,
    CHECKOUT_START: 0,
    PURCHASE_COMPLETED: 0,
  };
}

function isCounters(value: unknown): value is EventCounters {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const counters = value as Record<string, unknown>;

  return ANALYTICS_EVENT_TYPES.every((type) => {
    const count = counters[type];
    return typeof count === "number" && Number.isFinite(count) && count >= 0;
  });
}

export function loadCounters(userId: string): EventCounters {
  const stored = readJSON<unknown>(
    storageKeys.metrics(userId),
    null,
    METRICS_VERSION,
  );

  return isCounters(stored) ? stored : emptyCounters();
}

export function incrementCounter(
  userId: string,
  type: AnalyticsEventType,
): void {
  const counters = loadCounters(userId);
  const next: EventCounters = {
    ...counters,
    [type]: counters[type] + 1,
  };

  writeJSON(storageKeys.metrics(userId), next, METRICS_VERSION);
}

export function clearCounters(userId: string): void {
  writeJSON(storageKeys.metrics(userId), emptyCounters(), METRICS_VERSION);
}
