import { formatColones } from "../cart/cartTotals";
import type { AnalyticsEvent, AnalyticsEventType } from "./types";

// Nombre legible de cada tipo de evento
export const eventLabels: Record<AnalyticsEventType, string> = {
  LOGIN: "Inicio de sesión",
  LOGOUT: "Cierre de sesión",
  SEARCH: "Búsqueda",
  PRODUCT_VIEW: "Producto visto",
  ADD_TO_CART: "Agregado al carrito",
  CHECKOUT_START: "Inicio de checkout",
  PURCHASE_COMPLETED: "Compra completada",
};

// Resumen corto del evento para la columna "Detalle" de la tabla
export function summarizeEvent(event: AnalyticsEvent): string {
  switch (event.type) {
    case "LOGIN":
      return `Entró como ${event.payload.username}`;
    case "LOGOUT":
      return "Salió de la sesión";
    case "SEARCH":
      return `"${event.payload.query}" · ${event.payload.nbHits} resultados`;
    case "PRODUCT_VIEW":
      return event.payload.title;
    case "ADD_TO_CART":
      return `${event.payload.quantity} × ${event.payload.title}`;
    case "CHECKOUT_START":
      return `${event.payload.totalUnits} unidades · ${formatColones(event.payload.total)}`;
    case "PURCHASE_COMPLETED":
      return `Orden #${event.payload.orderNumber} · ${formatColones(event.payload.total)}`;
  }
}