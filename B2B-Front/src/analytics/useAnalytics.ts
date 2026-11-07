import { useContext } from "react";
import { AnalyticsContext } from "./analyticsContextValue";

export function useAnalytics() {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error("useAnalytics debe usarse dentro de AnalyticsProvider");
  }

  return context;
}
