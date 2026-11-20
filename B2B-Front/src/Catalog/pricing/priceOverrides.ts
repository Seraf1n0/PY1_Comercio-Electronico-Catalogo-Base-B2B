import { readJSON, removeJSON, writeJSON } from "../../lib/safeStorage";
import { storageKeys } from "../../lib/storageKeys";


export type PriceOverride = {
  B2C?: number;
  B2B?: number;
  updatedAt: string;
  updatedBy: string;
};

export type PriceOverrides = Record<string, PriceOverride>;

type WithPrices = {
  objectID?: string;
  id?: string;
  price?: number;
  prices?: { B2C?: number; B2B?: number };
};

const isPositiveInt = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

let cache: PriceOverrides | null = null;

// Si otra pestaña cambia los precios, se descarta la copia en memoria.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === storageKeys.priceOverrides) cache = null;
  });
}

export function readPriceOverrides(): PriceOverrides {
  if (cache) return cache;
  const stored = readJSON<unknown>(storageKeys.priceOverrides, {});
  const valid: PriceOverrides = {};

  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    for (const [id, raw] of Object.entries(stored as Record<string, unknown>)) {
      if (!raw || typeof raw !== "object") continue;
      const entry = raw as Record<string, unknown>;
      const override: PriceOverride = {
        updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : "",
        updatedBy: typeof entry.updatedBy === "string" ? entry.updatedBy : "",
      };
      if (isPositiveInt(entry.B2C)) override.B2C = entry.B2C;
      if (isPositiveInt(entry.B2B)) override.B2B = entry.B2B;
      if (override.B2C !== undefined || override.B2B !== undefined) valid[id] = override;
    }
  }

  cache = valid;
  return valid;
}

export function getPriceOverride(productId: string | undefined): PriceOverride | null {
  return productId ? readPriceOverrides()[productId] ?? null : null;
}

export function setPriceOverride(
  productId: string,
  prices: { B2C?: number; B2B?: number },
  updatedBy: string,
): boolean {
  if (prices.B2C !== undefined && !isPositiveInt(prices.B2C)) return false;
  if (prices.B2B !== undefined && !isPositiveInt(prices.B2B)) return false;

  const next: PriceOverrides = {
    ...readPriceOverrides(),
    [productId]: { ...prices, updatedAt: new Date().toISOString(), updatedBy },
  };
  const saved = writeJSON(storageKeys.priceOverrides, next);
  if (saved) cache = next;
  return saved;
}

export function clearPriceOverride(productId: string): boolean {
  const next = { ...readPriceOverrides() };
  delete next[productId];
  const saved = writeJSON(storageKeys.priceOverrides, next);
  if (saved) cache = next;
  return saved;
}

export function resetPriceOverrides(): void {
  removeJSON(storageKeys.priceOverrides);
  cache = {};
}

/** Devuelve el item con los precios sustituidos por el ajuste del admin (si existe). */
export function applyPriceOverride<T extends WithPrices>(item: T): T {
  const override = getPriceOverride(item.objectID ?? item.id);
  if (!override) return item;

  return {
    ...item,
    prices: {
      B2C: override.B2C ?? item.prices?.B2C ?? item.price,
      B2B: override.B2B ?? item.prices?.B2B,
    },
  };
}