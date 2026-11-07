import { createContext } from "react";
import type { AnalyticsEventType, EventPayloadMap } from "./types";

export interface TrackOptions {
  dedupeMs?: number;
}

export interface AnalyticsContextValue {
  track: <K extends AnalyticsEventType>(
    type: K,
    payload: EventPayloadMap[K],
    options?: TrackOptions,
  ) => void;
}

export const AnalyticsContext = createContext<AnalyticsContextValue | null>(
  null,
);
