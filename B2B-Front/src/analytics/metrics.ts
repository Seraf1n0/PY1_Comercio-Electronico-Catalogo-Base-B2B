import { emptyCounters, loadCounters } from "./countersStore";
import type { EventCounters } from "./countersStore";
import { loadEvents } from "./eventStore";
import type { AnalyticsEvent, EventPayloadMap } from "./types";

/** Metricas de un usuario */
export interface UserMetrics {
  productsViewed: number;
  searches: number;
  addedToCart: number;
  purchases: number;
  checkoutStarts: number;
  /** Calculado desde el registro de eventos (maximo 500). */
  uniqueProductsViewed: number;
  counters: EventCounters;
}

export function metricsFromCounters(
  counters: EventCounters,
): Omit<UserMetrics, "uniqueProductsViewed"> {
  return {
    productsViewed: counters.PRODUCT_VIEW,
    searches: counters.SEARCH,
    addedToCart: counters.ADD_TO_CART,
    purchases: counters.PURCHASE_COMPLETED,
    checkoutStarts: counters.CHECKOUT_START,
    counters,
  };
}

export function countUniqueProducts(events: AnalyticsEvent[]): number {
  const ids = new Set<string>();

  for (const event of events) {
    if (event.type === "PRODUCT_VIEW") {
      ids.add((event.payload as EventPayloadMap["PRODUCT_VIEW"]).productId);
    }
  }

  return ids.size;
}

/** Lectura pura sobre el storage*/
export function getMetrics(userId: string): UserMetrics {
  return {
    ...metricsFromCounters(loadCounters(userId)),
    uniqueProductsViewed: countUniqueProducts(loadEvents(userId)),
  };
}

/** Ultimos eventos del usuario en orden descendente */
export function getRecentEvents(userId: string, limit = 20): AnalyticsEvent[] {
  return loadEvents(userId).slice(-limit).reverse();
}

export { emptyCounters };