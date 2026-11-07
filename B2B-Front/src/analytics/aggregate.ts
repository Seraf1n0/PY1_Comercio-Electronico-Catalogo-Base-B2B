import { listKeys } from "../lib/safeStorage";
import { storageKeys } from "../lib/storageKeys";
import { emptyCounters, loadCounters } from "./countersStore";
import type { EventCounters } from "./countersStore";
import { loadEvents } from "./eventStore";
import type { AnalyticsEvent } from "./types";
import { ANALYTICS_EVENT_TYPES } from "./types";


export interface UserCountersRow {
  userId: string;
  counters: EventCounters;
}

// De "bombocars:metrics:v1:usr-b2c-001" saca solo "usr-b2c-001"
function userIdsFrom(prefix: string): string[] {
  return listKeys(prefix).map((key) => key.slice(prefix.length));
}

/** Contadores de cada usuario que tenga datos guardados */
export function getAllUserCounters(): UserCountersRow[] {
  return userIdsFrom(storageKeys.metricsPrefix).map((userId) => ({
    userId,
    counters: loadCounters(userId),
  }));
}

/** Suma los contadores de todas las filas en un solo total */
export function sumCounters(rows: UserCountersRow[]): EventCounters {
  const total = emptyCounters();

  for (const row of rows) {
    for (const type of ANALYTICS_EVENT_TYPES) {
      total[type] += row.counters[type];
    }
  }

  return total;
}

/** Últimos eventos de todos los usuarios, mezclados y ordenados por fecha */
export function getAllRecentEvents(limit = 20): AnalyticsEvent[] {
  return userIdsFrom(storageKeys.eventsPrefix)
    .flatMap((userId) => loadEvents(userId).slice(-limit))
    .sort((a, b) => b.tsMs - a.tsMs)
    .slice(0, limit);
}

/** Productos distintos vistos entre todos los usuarios */
export function getAllUniqueProducts(): number {
  const ids = new Set<string>();

  for (const userId of userIdsFrom(storageKeys.eventsPrefix)) {
    for (const event of loadEvents(userId)) {
      if (event.type === "PRODUCT_VIEW") {
        ids.add(event.payload.productId);
      }
    }
  }

  return ids.size;
}