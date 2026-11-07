import { useCallback, useMemo, type ReactNode } from "react";
import { useAuth } from "../auth/useAuth";
import {
  AnalyticsContext,
  type AnalyticsContextValue,
  type TrackOptions,
} from "./analyticsContextValue";
import { track as trackEvent } from "./tracker";
import type { AnalyticsEventType, EventPayloadMap } from "./types";

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user, role, sessionId } = useAuth();

  const track = useCallback(
    <K extends AnalyticsEventType,>(
      type: K,
      payload: EventPayloadMap[K],
      options?: TrackOptions,
    ) => {
      if (!user || !role || !sessionId) {
        return;
      }

      trackEvent({ userId: user.objectID, role, sessionId }, type, payload, options);
    },
    [user, role, sessionId],
  );

  const value = useMemo<AnalyticsContextValue>(() => ({ track }), [track]);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}
