import { readJSON, writeJSON } from "../lib/safeStorage";
import { storageKeys } from "../lib/storageKeys";
import { ANALYTICS_EVENT_TYPES } from "./types";
import type { AnalyticsEvent, AnalyticsEventType } from "./types";

const EVENTS_VERSION = 1;

export const MAX_EVENTS = 500;

function isEventType(value: unknown): value is AnalyticsEventType {
  return (
    typeof value === "string" &&
    (ANALYTICS_EVENT_TYPES as readonly string[]).includes(value)
  );
}

function isAnalyticsEvent(value: unknown): value is AnalyticsEvent {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const event = value as Record<string, unknown>;

  return (
    typeof event.id === "string" &&
    isEventType(event.type) &&
    typeof event.ts === "string" &&
    typeof event.tsMs === "number" &&
    typeof event.userId === "string" &&
    typeof event.role === "string" &&
    typeof event.sessionId === "string" &&
    "payload" in event
  );
}

export function loadEvents(userId: string): AnalyticsEvent[] {
  const stored = readJSON<unknown>(
    storageKeys.events(userId),
    [],
    EVENTS_VERSION,
  );

  if (!Array.isArray(stored)) {
    return [];
  }

  return stored.filter(isAnalyticsEvent);
}

// Agrega el evento y descarta los mas antiguos cuando se supera el tope.
export function appendEvent(userId: string, event: AnalyticsEvent): void {
  const events = [...loadEvents(userId), event].slice(-MAX_EVENTS);
  writeJSON(storageKeys.events(userId), events, EVENTS_VERSION);
}

export function clearEvents(userId: string): void {
  writeJSON(storageKeys.events(userId), [], EVENTS_VERSION);
}
