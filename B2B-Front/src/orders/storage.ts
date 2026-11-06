import type { Order } from "../orders/types";
import {
  readJSON,
  readLegacyJSON,
  removeJSON,
  writeJSON,
} from "../lib/safeStorage";
import { LEGACY_STORAGE_KEYS, storageKeys } from "../lib/storageKeys";

const ORDERS_VERSION = 1;

function isOrderArray(value: unknown): value is Order[] {
  return Array.isArray(value);
}

/**
 * Migra una sola vez la clave antigua "orders" (arreglo sin envoltura)
 * a la clave versionada nueva. Si no hay datos validos, limpia el resto.
 */
function migrateLegacyOrders(): void {
  const legacy = readLegacyJSON<unknown>(LEGACY_STORAGE_KEYS.orders, []);

  if (isOrderArray(legacy) && legacy.length > 0) {
    writeJSON(storageKeys.orders, legacy, ORDERS_VERSION);
  }

  removeJSON(LEGACY_STORAGE_KEYS.orders);
}

export function getNextOrderNumber(): number {
  const orders = getOrders();
  if (orders.length === 0) {
    return 1;
  }
  return Math.max(...orders.map((order) => order.orderNumber)) + 1;
}

export function getOrders(): Order[] {
  const orders = readJSON<Order[]>(storageKeys.orders, [], ORDERS_VERSION);
  if (isOrderArray(orders) && orders.length > 0) {
    return orders;
  }

  migrateLegacyOrders();
  const migrated = readJSON<Order[]>(storageKeys.orders, [], ORDERS_VERSION);
  return isOrderArray(migrated) ? migrated : [];
}

export function saveOrder(order: Order): void {
  const currentOrders = getOrders();
  writeJSON(storageKeys.orders, [...currentOrders, order], ORDERS_VERSION);
}

// Busca una orden por su número.
//  devuelve null si no existe
export function getOrderByNumber(orderNumber: number): Order | null {
  return getOrders().find((order) => order.orderNumber === orderNumber) ?? null;
}

// Mezcla los cambios con la orden existente y la vuelve a guardar
export function updateOrder(
  orderNumber: number,
  changes: Partial<Order>,
): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((order) => order.orderNumber === orderNumber);

  if (index === -1) {
    return null;
  }

  const updated: Order = { ...orders[index], ...changes };
  orders[index] = updated;
  writeJSON(storageKeys.orders, orders, ORDERS_VERSION);
  return updated;
}
