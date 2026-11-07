import type { Product } from "../Catalog/types";
import type { AnalyticsEvent } from "./types";

// Por cada acción sumaremos ciertos puntos para la afinidad del usuario con categorias y marcas
// Cuando vea un producto es 1 punto, cuando agregue al carro 2 y 3 si compra los productos 
export const AFFINITY_EVENT_POINTS = {
  PRODUCT_VIEW: 1,
  ADD_TO_CART: 3,
  PURCHASE_COMPLETED: 5,
} as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface AffinityEntry {
  value: string;
  score: number;
}

export interface AffinityProfile {
  categories: AffinityEntry[];
  brands: AffinityEntry[];
}

export interface ScoredProduct {
  product: Product;
  score: number;
  categoryScore: number;
  brandScore: number;
}

export interface RankProductsOptions {
  excludeProductIds?: ReadonlySet<string>;
  limit?: number;
}

type AffinityAccumulator = Map<string, AffinityEntry>;

function addPoints(
  accumulator: AffinityAccumulator,
  value: unknown,
  points: number,
): void {
  if (typeof value !== "string") {
    return;
  }

  const label = value.trim();
  if (!label) {
    return;
  }

  const key = label.toLocaleLowerCase();
  const current = accumulator.get(key);

  if (current) {
    current.score += points;
  } else {
    accumulator.set(key, { value: label, score: points });
  }
}

function sortedEntries(accumulator: AffinityAccumulator): AffinityEntry[] {
  return [...accumulator.values()].sort((a, b) => b.score - a.score);
}

// Dependiendo de la cantidad de dias multiplicamos para aumentar o disminuir la afinidad
// de 0 a 3 días multiplica por, de 4 a 6 días multiplica por 2 y de 7 días en adelante por 1
function getRecencyMultiplier(eventTsMs: number, nowMs: number): number {
  if (!Number.isFinite(eventTsMs)) {
    return 1;
  }

  const ageDays = Math.max(0, Math.floor((nowMs - eventTsMs) / MS_PER_DAY));
  if (ageDays <= 3) {
    return 3;
  }
  if (ageDays <= 6) {
    return 2;
  }
  return 1;
}

/**
 * Suma puntos dependiendo de la acción para cada categoría y marca además de la multiplicación por días
 */
export function buildAffinityProfile(
  events: readonly AnalyticsEvent[],
  nowMs = Date.now(),
): AffinityProfile {
  const categories: AffinityAccumulator = new Map();
  const brands: AffinityAccumulator = new Map();

  for (const event of events) {
    if (!event.payload || typeof event.payload !== "object") {
      continue;
    }

    const multiplier = getRecencyMultiplier(event.tsMs, nowMs);

    if (event.type === "PRODUCT_VIEW") {
      const points = AFFINITY_EVENT_POINTS.PRODUCT_VIEW * multiplier;
      addPoints(categories, event.payload.category, points);
      addPoints(brands, event.payload.brand, points);
      continue;
    }

    if (event.type === "ADD_TO_CART") {
      const points = AFFINITY_EVENT_POINTS.ADD_TO_CART * multiplier;
      addPoints(categories, event.payload.category, points);
      addPoints(brands, event.payload.brand, points);
      continue;
    }

    if (event.type === "PURCHASE_COMPLETED") {
      const items: unknown = event.payload.items;
      if (!Array.isArray(items)) {
        continue;
      }

      for (const item of items) {
        if (!item || typeof item !== "object") {
          continue;
        }

        const purchasedItem = item as Record<string, unknown>;
        addPoints(
          categories,
          purchasedItem.category,
          AFFINITY_EVENT_POINTS.PURCHASE_COMPLETED * multiplier,
        );
        addPoints(
          brands,
          purchasedItem.brand,
          AFFINITY_EVENT_POINTS.PURCHASE_COMPLETED * multiplier,
        );
      }
    }
  }

  return {
    categories: sortedEntries(categories),
    brands: sortedEntries(brands),
  };
}

function scoreForValue(entries: readonly AffinityEntry[], value: string): number {
  const key = value.trim().toLocaleLowerCase();
  if (!key) {
    return 0;
  }

  return entries.find((entry) => entry.value.toLocaleLowerCase() === key)?.score ?? 0;
}

/**
 * Se le da la puntuación correspondiente al producto dependiendo de los puntos que se habian sumado del usuario
 * para cada categoría y marca
 */
export function scoreProductAffinity(
  product: Product,
  profile: AffinityProfile,
): ScoredProduct {
  const categoryScore = product.categories.reduce(
    (bestScore, category) =>
      Math.max(bestScore, scoreForValue(profile.categories, category)),
    0,
  );
  const brandScore = scoreForValue(profile.brands, product.brand);

  return {
    product,
    categoryScore,
    brandScore,
    score: categoryScore + brandScore,
  };
}

/**
 * Ordena una lista de productos obtenida de Algolia por afinidad del 
 * usuario con las categorías y marcas de los productos.
 */
export function rankProductsByAffinity(
  products: readonly Product[],
  profile: AffinityProfile,
  options: RankProductsOptions = {},
): ScoredProduct[] {
  const { excludeProductIds, limit = products.length } = options;

  return products
    .filter((product) => !excludeProductIds?.has(product.objectID))
    .map((product, index) => ({
      ...scoreProductAffinity(product, profile),
      originalIndex: index,
    }))
    .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex)
    .slice(0, Math.max(0, limit))
    .map(({ product, score, categoryScore, brandScore }) => ({
      product,
      score,
      categoryScore,
      brandScore,
    }));
}
