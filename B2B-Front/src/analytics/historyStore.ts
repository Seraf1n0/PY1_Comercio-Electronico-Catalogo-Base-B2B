import { readJSON, writeJSON } from "../lib/safeStorage";
import { storageKeys } from "../lib/storageKeys";

const HISTORY_VERSION = 1;

export const MAX_RECENT_PRODUCTS = 12;
export const MAX_RECENT_SEARCHES = 10;

/** Datos minimos para volver a mostrar un producto visto. */
export interface ViewedProduct {
  id: string;
  title: string;
  img: string;
  category: string;
  brand: string;
  price: number;
  viewedAt: string;
}

export interface HistoryState {
  recentlyViewed: ViewedProduct[];
  recentSearches: string[];
}

export interface ProductViewInput {
  id: string;
  title: string;
  img?: string;
  category?: string;
  brand?: string;
  price?: number;
}

function emptyHistory(): HistoryState {
  return { recentlyViewed: [], recentSearches: [] };
}

function isViewedProduct(value: unknown): value is ViewedProduct {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.img === "string" &&
    typeof item.category === "string" &&
    typeof item.brand === "string" &&
    typeof item.price === "number" &&
    typeof item.viewedAt === "string"
  );
}

function isHistoryState(value: unknown): value is HistoryState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const history = value as Record<string, unknown>;

  return (
    Array.isArray(history.recentlyViewed) &&
    history.recentlyViewed.every(isViewedProduct) &&
    Array.isArray(history.recentSearches) &&
    history.recentSearches.every((search) => typeof search === "string")
  );
}

/**
 * Migración al formato nuevo de historial desde el formato legacy (array de objetos con productId, productTitle y lastViewed).
 */
function migrateLegacyHistory(value: unknown): HistoryState | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const recentlyViewed = value
    .flatMap((item): ViewedProduct[] => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return [];
      }

      const legacy = item as Record<string, unknown>;
      const id =
        typeof legacy.productId === "string"
          ? legacy.productId
          : typeof legacy.id === "string"
            ? legacy.id
            : null;
      const title =
        typeof legacy.productTitle === "string"
          ? legacy.productTitle
          : typeof legacy.title === "string"
            ? legacy.title
            : null;

      if (!id || !title) {
        return [];
      }

      return [
        {
          id,
          title,
          img: "",
          category: "",
          brand: "",
          price: 0,
          viewedAt:
            typeof legacy.lastViewed === "string"
              ? legacy.lastViewed
              : new Date().toISOString(),
        },
      ];
    })
    .slice(0, MAX_RECENT_PRODUCTS);

  return { recentlyViewed, recentSearches: [] };
}

function saveHistory(userId: string, history: HistoryState): void {
  writeJSON(storageKeys.history(userId), history, HISTORY_VERSION);
}

export function loadHistory(userId: string): HistoryState {
  const stored = readJSON<unknown>(
    storageKeys.history(userId),
    null,
    HISTORY_VERSION,
  );

  if (isHistoryState(stored)) {
    return stored;
  }

  const migrated = migrateLegacyHistory(stored);
  if (migrated) {
    saveHistory(userId, migrated);
    return migrated;
  }

  if (stored !== null) {
    // Dato con forma desconocida: se reemplaza por un historial limpio.
    saveHistory(userId, emptyHistory());
  }

  return emptyHistory();
}

export function loadRecentlyViewedProducts(userId: string): ViewedProduct[] {
  return loadHistory(userId).recentlyViewed;
}

export function loadRecentSearches(userId: string): string[] {
  return loadHistory(userId).recentSearches;
}

export function recordProductView(
  userId: string,
  product: ProductViewInput,
): void {
  const history = loadHistory(userId);
  const viewedAt = new Date().toISOString();

  const entry: ViewedProduct = {
    id: product.id,
    title: product.title,
    img: product.img ?? "",
    category: product.category ?? "",
    brand: product.brand ?? "",
    price: product.price ?? 0,
    viewedAt,
  };

  const recentlyViewed = [
    entry,
    ...history.recentlyViewed.filter((item) => item.id !== entry.id),
  ].slice(0, MAX_RECENT_PRODUCTS);

  saveHistory(userId, { ...history, recentlyViewed });
}

export function recordSearch(userId: string, query: string): void {
  const normalized = query.trim();
  if (!normalized) {
    return;
  }

  const history = loadHistory(userId);
  const key = normalized.toLowerCase();

  const recentSearches = [
    normalized,
    ...history.recentSearches.filter((item) => item.toLowerCase() !== key),
  ].slice(0, MAX_RECENT_SEARCHES);

  saveHistory(userId, { ...history, recentSearches });
}

export function clearHistory(userId: string): void {
  saveHistory(userId, emptyHistory());
}
