import type { Role } from "../auth/types";
import { buildAffinityProfile } from "./affinityEngine";
import { incrementCounter } from "./countersStore";
import { appendEvent, loadEvents } from "./eventStore";
import { recordProductView, recordSearch } from "./historyStore";
import type { AnalyticsEvent, AnalyticsEventType, EventPayloadMap } from "./types";

export interface TrackerContext {
  userId: string;
  role: Role;
  sessionId: string;
}

export interface TrackOptions {
  dedupeMs?: number;
}

const PRODUCT_VIEW_DEDUPE_MS = 3000;
const lastTracked = new Map<string, { signature: string; tsMs: number }>();

function createEventId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `event-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isDuplicate(
  context: TrackerContext,
  type: AnalyticsEventType,
  signature: string,
  dedupeMs: number,
  tsMs: number,
): boolean {
  if (dedupeMs <= 0) {
    return false;
  }

  const key = `${context.userId}:${type}`;
  const last = lastTracked.get(key);

  if (last && last.signature === signature && tsMs - last.tsMs < dedupeMs) {
    return true;
  }

  lastTracked.set(key, { signature, tsMs });
  return false;
}

// Revisa el ultimo evento guardado para cubrir tambien una recarga de pagina.
function hasRecentProductView(
  userId: string,
  productId: string,
  tsMs: number,
  dedupeMs: number,
): boolean {
  const events = loadEvents(userId);

  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event.type !== "PRODUCT_VIEW") {
      continue;
    }

    const view = event.payload as EventPayloadMap["PRODUCT_VIEW"];
    if (view.productId !== productId) {
      continue;
    }

    return tsMs - event.tsMs < dedupeMs;
  }

  return false;
}

// Evita duplicar la compra si se reintenta el pago o se recarga la confirmacion.
function hasCompletedPurchase(userId: string, orderNumber: number): boolean {
  return loadEvents(userId).some(
    (event) =>
      event.type === "PURCHASE_COMPLETED" &&
      (event.payload as EventPayloadMap["PURCHASE_COMPLETED"]).orderNumber ===
        orderNumber,
  );
}

function updateHistory<K extends AnalyticsEventType>(
  userId: string,
  type: K,
  payload: EventPayloadMap[K],
): void {
  if (type === "PRODUCT_VIEW") {
    const view = payload as EventPayloadMap["PRODUCT_VIEW"];
    recordProductView(userId, {
      id: view.productId,
      title: view.title,
      img: view.img ?? "",
      category: view.category,
      brand: view.brand,
      price: view.price,
    });
  }

  if (type === "SEARCH") {
    const search = payload as EventPayloadMap["SEARCH"];
    recordSearch(userId, search.query);
  }
}

// Punto unico de registro: evento, contador e historial en una sola llamada.
export function track<K extends AnalyticsEventType>(
  context: TrackerContext | null,
  type: K,
  payload: EventPayloadMap[K],
  options: TrackOptions = {},
): AnalyticsEvent | null {
  if (!context) {
    return null;
  }

  try {
    const tsMs = Date.now();
    const signature = `${type}:${JSON.stringify(payload)}`;
    const dedupeMs =
      options.dedupeMs ?? (type === "PRODUCT_VIEW" ? PRODUCT_VIEW_DEDUPE_MS : 0);

    if (isDuplicate(context, type, signature, dedupeMs, tsMs)) {
      return null;
    }

    if (type === "PRODUCT_VIEW") {
      const view = payload as EventPayloadMap["PRODUCT_VIEW"];
      if (hasRecentProductView(context.userId, view.productId, tsMs, dedupeMs)) {
        return null;
      }
    }

    if (type === "PURCHASE_COMPLETED") {
      const purchase = payload as EventPayloadMap["PURCHASE_COMPLETED"];
      if (hasCompletedPurchase(context.userId, purchase.orderNumber)) {
        return null;
      }
    }

    const event = {
      id: createEventId(),
      type,
      ts: new Date(tsMs).toISOString(),
      tsMs,
      userId: context.userId,
      role: context.role,
      sessionId: context.sessionId,
      payload,
    } as AnalyticsEvent;

    appendEvent(context.userId, event);
    incrementCounter(context.userId, type);
    updateHistory(context.userId, type, payload);
    if (import.meta.env.DEV) {
      console.log("[Afinidad]", {
        accion: event.type,
        datos: event.payload,
        perfilActualizado: buildAffinityProfile(loadEvents(context.userId)),
      });
    }

    return event;
  } catch (error) {
    console.error("[analytics] No se pudo registrar el evento.", error);
    return null;
  }
}
