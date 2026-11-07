import type { Role } from "../auth/types";

/**
 * Contrato unico de eventos de analytics.
 */
export type AnalyticsEventType =
  | "LOGIN"
  | "LOGOUT"
  | "SEARCH"
  | "PRODUCT_VIEW"
  | "ADD_TO_CART"
  | "CHECKOUT_START"
  | "PURCHASE_COMPLETED";

/** Orden estable para inicializar contadores y filtros. */
export const ANALYTICS_EVENT_TYPES: readonly AnalyticsEventType[] = [
  "LOGIN",
  "LOGOUT",
  "SEARCH",
  "PRODUCT_VIEW",
  "ADD_TO_CART",
  "CHECKOUT_START",
  "PURCHASE_COMPLETED",
];

export interface LoginPayload {
  role: Role;
  username: string;
}

export interface LogoutPayload {
  role: Role;
}

export interface SearchPayload {
  query: string;
  nbHits: number;
}

export interface ProductViewPayload {
  productId: string;
  title: string;
  category: string;
  brand: string;
  price: number;
}

export interface AddToCartPayload {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  source: "catalog" | "detail";
}

export interface CheckoutStartPayload {
  itemsCount: number;
  totalUnits: number;
  total: number;
}

export interface PurchaseCompletedPayload {
  orderNumber: number;
  total: number;
  itemsCount: number;
}

/** Payload asociado a cada tipo de evento. */
export interface EventPayloadMap {
  LOGIN: LoginPayload;
  LOGOUT: LogoutPayload;
  SEARCH: SearchPayload;
  PRODUCT_VIEW: ProductViewPayload;
  ADD_TO_CART: AddToCartPayload;
  CHECKOUT_START: CheckoutStartPayload;
  PURCHASE_COMPLETED: PurchaseCompletedPayload;
}

/** Cabecera comun a todos los eventos: estandarizada. */
interface AnalyticsEventBase<K extends AnalyticsEventType> {
  id: string;
  type: K;
  ts: string;
  tsMs: number;
  userId: string;
  role: Role;
  sessionId: string;
  payload: EventPayloadMap[K];
}

/** Evento discriminado por `type`: TypeScript infiere el payload correcto. */
export type AnalyticsEvent = {
  [K in AnalyticsEventType]: AnalyticsEventBase<K>;
}[AnalyticsEventType];
