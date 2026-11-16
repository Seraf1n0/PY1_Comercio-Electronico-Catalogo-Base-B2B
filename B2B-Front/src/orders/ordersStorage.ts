import type { BranchId, Role } from "../auth/types";
import { branches, getBranchInfo } from "../branch/branches";
import { readJSON, readLegacyJSON, removeJSON, writeJSON } from "../lib/safeStorage";
import { LEGACY_STORAGE_KEYS, storageKeys } from "../lib/storageKeys";
import type {
  Buyer,
  CustomerType,
  Delivery,
  Order,
  OrderBranchId,
  OrderItem,
  OrderStatus,
  OrderSyncStatus,
  PaymentStatus,
} from "./types";

const ORDERS_VERSION = 2;
const ORDERS_V1_VERSION = 1;

const LEGACY_BRANCH: { id: OrderBranchId; name: string } = {
  id: "no_registrada",
  name: "No registrada",
};

const ORDER_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "FAILED"];
const PAYMENT_STATUSES: PaymentStatus[] = [
  "APPROVED",
  "DECLINED",
  "ERROR",
  "PENDING",
];
const SYNC_STATUSES: OrderSyncStatus[] = ["SYNCED", "PENDING"];
const ROLES: Role[] = ["B2C", "B2B", "ADMIN"];
const CUSTOMER_TYPES: CustomerType[] = ["B2C", "B2B"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): value is string {
  return typeof value === "string";
}

function asFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isBranchId(value: unknown): value is BranchId {
  return branches.some((branch) => branch.id === value);
}

function isRole(value: unknown): value is Role {
  return ROLES.some((role) => role === value);
}

function isCustomerType(value: unknown): value is CustomerType {
  return CUSTOMER_TYPES.some((type) => type === value);
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return ORDER_STATUSES.some((status) => status === value);
}

function isPaymentStatus(value: unknown): value is PaymentStatus {
  return PAYMENT_STATUSES.some((status) => status === value);
}

function isSyncStatus(value: unknown): value is OrderSyncStatus {
  return SYNC_STATUSES.some((status) => status === value);
}

/**
 * Normaliza la sucursal de una orden o linea. Si no se reconoce el id
 * se usa el marcador legacy para no romper ordenes viejas.
 */
function normalizeBranch(value: unknown): { id: OrderBranchId; name: string } {
  if (isRecord(value)) {
    if (value.id === "no_registrada") {
      return {
        id: "no_registrada",
        name: asString(value.name) ? value.name : LEGACY_BRANCH.name,
      };
    }

    if (isBranchId(value.id)) {
      return {
        id: value.id,
        name: asString(value.name) ? value.name : getBranchInfo(value.id).label,
      };
    }
  }

  return { ...LEGACY_BRANCH };
}

function normalizeBuyer(value: unknown): Buyer {
  const record = isRecord(value) ? value : {};
  return {
    name: asString(record.name) ? record.name : "",
    lastName: asString(record.lastName) ? record.lastName : "",
    email: asString(record.email) ? record.email : "",
    phone: asString(record.phone) ? record.phone : "",
  };
}

function normalizeDelivery(value: unknown): Delivery {
  const record = isRecord(value) ? value : {};
  return {
    address: asString(record.address) ? record.address : "",
    province: asString(record.province) ? record.province : "",
    canton: asString(record.canton) ? record.canton : "",
    additionalAddress: asString(record.additionalAddress)
      ? record.additionalAddress
      : null,
  };
}

function normalizeCompany(
  value: unknown,
): { name: string; legalId: string } | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (!asString(value.name) || !asString(value.legalId)) {
    return undefined;
  }

  return { name: value.name, legalId: value.legalId };
}

function normalizeItem(
  raw: unknown,
  fallbackBranch: { id: OrderBranchId; name: string },
  fallbackTier: CustomerType,
): OrderItem | null {
  if (!isRecord(raw)) {
    return null;
  }

  if (!asString(raw.productId) || !asString(raw.name)) {
    return null;
  }

  if (!asFiniteNumber(raw.quantity) || raw.quantity <= 0) {
    return null;
  }

  const quantity = raw.quantity;
  const unitPrice = asFiniteNumber(raw.unitPrice) ? raw.unitPrice : 0;
  const subtotal = asFiniteNumber(raw.subtotal)
    ? raw.subtotal
    : unitPrice * quantity;

  let branch: { id: OrderBranchId; name: string };
  if (isRecord(raw.branch)) {
    branch = normalizeBranch(raw.branch);
  } else if (isBranchId(raw.branchId)) {
    branch = { id: raw.branchId, name: getBranchInfo(raw.branchId).label };
  } else {
    branch = fallbackBranch;
  }

  return {
    productId: raw.productId,
    name: raw.name,
    quantity,
    unitPrice,
    subtotal,
    category: asString(raw.category) ? raw.category : undefined,
    brand: asString(raw.brand) ? raw.brand : undefined,
    priceTier: isCustomerType(raw.priceTier) ? raw.priceTier : fallbackTier,
    branch,
    availableAtPurchase:
      asFiniteNumber(raw.availableAtPurchase) && raw.availableAtPurchase >= 0
        ? raw.availableAtPurchase
        : 0,
  };
}

/**
 * Normaliza una orden v1 (o v2 con campos incompletos) al formato actual.
 * Preserva los campos que ya existen y solo rellena los faltantes.
 */
function normalizeOrder(raw: unknown): Order | null {
  if (!isRecord(raw)) {
    return null;
  }

  if (
    !asFiniteNumber(raw.orderNumber) ||
    !Number.isInteger(raw.orderNumber) ||
    raw.orderNumber <= 0
  ) {
    return null;
  }

  if (!Array.isArray(raw.items)) {
    return null;
  }

  const date = asString(raw.date) ? raw.date : new Date(0).toISOString();

  const customerType = isCustomerType(raw.customerType)
    ? raw.customerType
    : "B2C";
  const pricingTier = isCustomerType(raw.pricingTier)
    ? raw.pricingTier
    : customerType;

  const branch = normalizeBranch(raw.branch);

  const items = raw.items
    .map((item) => normalizeItem(item, branch, pricingTier))
    .filter((item): item is OrderItem => item !== null);

  const parsedDate = Date.parse(date);
  const createdAtTs = asFiniteNumber(raw.createdAtTs)
    ? raw.createdAtTs
    : Number.isFinite(parsedDate)
      ? parsedDate
      : 0;

  return {
    orderNumber: raw.orderNumber,
    date,
    buyer: normalizeBuyer(raw.buyer),
    delivery: normalizeDelivery(raw.delivery),
    subtotal: asFiniteNumber(raw.subtotal) ? raw.subtotal : 0,
    iva: asFiniteNumber(raw.iva) ? raw.iva : 0,
    shippingCost: asFiniteNumber(raw.shippingCost) ? raw.shippingCost : 0,
    total: asFiniteNumber(raw.total) ? raw.total : 0,
    orderStatus: isOrderStatus(raw.orderStatus) ? raw.orderStatus : "PENDING",
    paymentStatus: isPaymentStatus(raw.paymentStatus)
      ? raw.paymentStatus
      : "PENDING",
    items,
    transactionId: asString(raw.transactionId) ? raw.transactionId : undefined,
    paymentAttempts: asFiniteNumber(raw.paymentAttempts)
      ? raw.paymentAttempts
      : undefined,
    termsAccepted:
      typeof raw.termsAccepted === "boolean" ? raw.termsAccepted : false,
    schemaVersion: 2,
    userId: asString(raw.userId) ? raw.userId : "",
    userName:
      asString(raw.userName) && raw.userName.trim() !== ""
        ? raw.userName
        : "No registrado",
    role: isRole(raw.role) ? raw.role : "B2C",
    customerType,
    company: normalizeCompany(raw.company),
    pricingTier,
    branch,
    appliedConditions: Array.isArray(raw.appliedConditions)
      ? raw.appliedConditions.filter(asString)
      : [],
    createdAtTs,
    syncStatus: isSyncStatus(raw.syncStatus) ? raw.syncStatus : "PENDING",
  };
}

function normalizeOrderList(value: unknown): Order[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const orders: Order[] = [];
  const seen = new Set<number>();

  for (const raw of value) {
    const order = normalizeOrder(raw);
    if (!order || seen.has(order.orderNumber)) {
      continue;
    }
    seen.add(order.orderNumber);
    orders.push(order);
  }

  return orders;
}

function readOrdersFromKey(key: string, version: number): Order[] {
  return normalizeOrderList(readJSON<unknown>(key, [], version));
}

/** El arreglo primario gana; del secundario solo se agregan numeros nuevos. */
function mergeOrders(primary: Order[], secondary: Order[]): Order[] {
  const merged = [...primary];
  const seen = new Set(primary.map((order) => order.orderNumber));

  for (const order of secondary) {
    if (seen.has(order.orderNumber)) {
      continue;
    }
    seen.add(order.orderNumber);
    merged.push(order);
  }

  return merged;
}

/**
 * Migra una sola vez la clave antigua "orders" (arreglo sin envoltura) a v2.
 * La clave cruda solo se elimina si la escritura fue exitosa.
 */
function migrateLegacyRawOrders(): void {
  const legacy = readLegacyJSON<unknown>(LEGACY_STORAGE_KEYS.orders, null);

  if (legacy === null) {
    return;
  }

  const normalized = normalizeOrderList(legacy);
  const current = readOrdersFromKey(storageKeys.orders, ORDERS_VERSION);
  const merged = mergeOrders(current, normalized);

  if (writeJSON(storageKeys.orders, merged, ORDERS_VERSION)) {
    removeJSON(LEGACY_STORAGE_KEYS.orders);
  }
}

export function getNextOrderNumber(): number {
  const orders = getOrders();
  if (orders.length === 0) {
    return 1;
  }
  return Math.max(...orders.map((order) => order.orderNumber)) + 1;
}

/** Fusiona v2 con v1; en duplicados por numero gana v2. */
export function getOrders(): Order[] {
  migrateLegacyRawOrders();

  return mergeOrders(
    readOrdersFromKey(storageKeys.orders, ORDERS_VERSION),
    readOrdersFromKey(storageKeys.ordersV1, ORDERS_V1_VERSION),
  );
}

export function saveOrder(order: Order): void {
  const current = readOrdersFromKey(storageKeys.orders, ORDERS_VERSION);
  const next = current.filter(
    (existing) => existing.orderNumber !== order.orderNumber,
  );
  next.push({ ...order, schemaVersion: 2 });

  if (!writeJSON(storageKeys.orders, next, ORDERS_VERSION)) {
    console.warn("[ordersStorage] No se pudo guardar la orden.", order.orderNumber);
    throw new Error("No se pudo guardar la orden");
  }
}

// Busca una orden por su numero. Devuelve null si no existe.
export function getOrderByNumber(orderNumber: number): Order | null {
  return getOrders().find((order) => order.orderNumber === orderNumber) ?? null;
}

// Mezcla los cambios con la orden existente y la vuelve a guardar en v2.
// v1 queda intacta: la actualizacion solo se escribe en la clave nueva.
export function updateOrder(
  orderNumber: number,
  changes: Partial<Order>,
): Order | null {
  const found = getOrders().find((order) => order.orderNumber === orderNumber);

  if (!found) {
    return null;
  }

  const updated: Order = {
    ...found,
    ...changes,
    orderNumber,
    schemaVersion: 2,
  };

  const current = readOrdersFromKey(storageKeys.orders, ORDERS_VERSION);
  const next = current.filter((order) => order.orderNumber !== orderNumber);
  next.push(updated);

  if (!writeJSON(storageKeys.orders, next, ORDERS_VERSION)) {
    console.warn(
      "[ordersStorage] No se pudo actualizar la orden.",
      orderNumber,
    );
    return null;
  }

  return updated;
}
