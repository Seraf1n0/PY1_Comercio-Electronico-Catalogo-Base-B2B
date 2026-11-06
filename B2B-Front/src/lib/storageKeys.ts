/**
 * AQUI SE UNIFICAN LAS KEYS DEE ALMACENAR EN EL LOCALSTORAGE
 */
export const STORAGE_PREFIX = "bombocars:";

const VERSION_PATTERN = /:v(\d+)(?::|$)/;

export function storageKey(
  name: string,
  version: number,
  scope?: string,
): string {
  const base = `${STORAGE_PREFIX}${name}:v${version}`;
  return scope ? `${base}:${scope}` : base;
}

export function parseStorageVersion(key: string): number | null {
  const match = key.match(VERSION_PATTERN);
  return match ? Number(match[1]) : null;
}

/** Las claves con su almacenamiento */
export const storageKeys = {
  users: storageKey("users", 1),
  session: storageKey("session", 1),
  cart: (userId: string) => storageKey("cart", 2, userId),
  orders: storageKey("orders", 1),
  balances: storageKey("balances", 1),
  events: (userId: string) => storageKey("events", 1, userId),
  history: (userId: string) => storageKey("history", 1, userId),
  metrics: (userId: string) => storageKey("metrics", 1, userId),
} as const;

/** keys viejas */
export const LEGACY_STORAGE_KEYS = {
  orders: "orders",
} as const;