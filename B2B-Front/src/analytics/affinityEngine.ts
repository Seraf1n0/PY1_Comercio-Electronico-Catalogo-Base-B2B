import type { Product } from "../Catalog/types";
import type { AnalyticsEvent } from "./types";

// Por cada acción sumamos puntos a la afinidad del usuario con categorías y marcas.
// Ver un producto suma 1 punto, agregarlo al carrito 3 y comprarlo 5.
export const AFFINITY_EVENT_POINTS = {
  PRODUCT_VIEW: 1,
  ADD_TO_CART: 3,
  PURCHASE_COMPLETED: 5,
} as const;

export interface AffinityEntry {
  value: string;
  score: number;
  lastInteractionMs: number;
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
  lastInteractionMs: number;
}

export interface RankProductsOptions {
  excludeProductIds?: ReadonlySet<string>;
  limit?: number;
  recentTieBreakWindowMs?: number;
}

export interface BuildAffinityOptions {
  recencyMultiplier?: boolean;
  nowMs?: number;
}

type AffinityAccumulator = Map<string, AffinityEntry>;

function addPoints(
  accumulator: AffinityAccumulator,
  value: unknown,
  points: number,
  eventTsMs: number,
): void {
  if (typeof value !== "string") {
    return;
  }

  const label = value.trim();
  if (!label) {
    return;
  }

  const key = label.toLocaleLowerCase();
  const interactionTsMs = Number.isFinite(eventTsMs) ? eventTsMs : 0;
  const current = accumulator.get(key);

  if (current) {
    current.score += points;
    current.lastInteractionMs = Math.max(current.lastInteractionMs, interactionTsMs);
  } else {
    accumulator.set(key, {
      value: label,
      score: points,
      lastInteractionMs: interactionTsMs,
    });
  }
}

function sortedEntries(accumulator: AffinityAccumulator): AffinityEntry[] {
  return [...accumulator.values()].sort((a, b) => b.score - a.score);
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

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
 * Suma puntos dependiendo de la acción en caso de que el evento 
 * llegue como falso no va a multiplicar por la cantidad de dias 
 * los puntos correspondentes 
 */
export function buildAffinityProfile(
  events: readonly AnalyticsEvent[],
  { recencyMultiplier = true, nowMs = Date.now() }: BuildAffinityOptions = {},
): AffinityProfile {
  const categories: AffinityAccumulator = new Map();
  const brands: AffinityAccumulator = new Map();

  for (const event of events) {
    if (!event.payload || typeof event.payload !== "object") {
      continue;
    }

    const multiplier = recencyMultiplier
      ? getRecencyMultiplier(event.tsMs, nowMs)
      : 1;

    if (event.type === "PRODUCT_VIEW") {
      const points = AFFINITY_EVENT_POINTS.PRODUCT_VIEW * multiplier;
      addPoints(categories, event.payload.category, points, event.tsMs);
      addPoints(brands, event.payload.brand, points, event.tsMs);
      continue;
    }

    if (event.type === "ADD_TO_CART") {
      const points = AFFINITY_EVENT_POINTS.ADD_TO_CART * multiplier;
      addPoints(categories, event.payload.category, points, event.tsMs);
      addPoints(brands, event.payload.brand, points, event.tsMs);
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
          event.tsMs,
        );
        addPoints(
          brands,
          purchasedItem.brand,
          AFFINITY_EVENT_POINTS.PURCHASE_COMPLETED * multiplier,
          event.tsMs,
        );
      }
    }
  }

  return {
    categories: sortedEntries(categories),
    brands: sortedEntries(brands),
  };
}

function affinityForValue(
  entries: readonly AffinityEntry[],
  value: string,
): AffinityEntry | undefined {
  const key = value.trim().toLocaleLowerCase();
  if (!key) {
    return undefined;
  }

  return entries.find((entry) => entry.value.toLocaleLowerCase() === key);
}

/**
 * Se le da la puntuación correspondiente al producto dependiendo de los puntos que se habian sumado del usuario
 * para cada categoría y marca
 */
export function scoreProductAffinity(
  product: Product,
  profile: AffinityProfile,
): ScoredProduct {
  const categoryAffinities = product.categories
    .map((category) => affinityForValue(profile.categories, category))
    .filter((entry): entry is AffinityEntry => entry !== undefined);
  const brandAffinity = affinityForValue(profile.brands, product.brand);
  const categoryScore = Math.max(0, ...categoryAffinities.map(({ score }) => score));
  const brandScore = brandAffinity?.score ?? 0;
  const lastInteractionMs = Math.max(
    0,
    brandAffinity?.lastInteractionMs ?? 0,
    ...categoryAffinities.map(({ lastInteractionMs: timestamp }) => timestamp),
  );

  return {
    product,
    categoryScore,
    brandScore,
    score: categoryScore + brandScore,
    lastInteractionMs,
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
  const {
    excludeProductIds,
    limit = products.length,
    recentTieBreakWindowMs = 0,
  } = options;
  const nowMs = Date.now();
  const recentCutoffMs = nowMs - recentTieBreakWindowMs;

  const compareProducts = (
    a: ScoredProduct & { originalIndex: number },
    b: ScoredProduct & { originalIndex: number },
  ): number => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }

    if (recentTieBreakWindowMs > 0) {
      const aIsRecent =
        a.lastInteractionMs >= recentCutoffMs && a.lastInteractionMs <= nowMs;
      const bIsRecent =
        b.lastInteractionMs >= recentCutoffMs && b.lastInteractionMs <= nowMs;

      if (aIsRecent !== bIsRecent) {
        return aIsRecent ? -1 : 1;
      }
      if (aIsRecent && bIsRecent && a.lastInteractionMs !== b.lastInteractionMs) {
        return b.lastInteractionMs - a.lastInteractionMs;
      }
    }

    return a.originalIndex - b.originalIndex;
  };

  return products
    .filter((product) => !excludeProductIds?.has(product.objectID))
    .map((product, index) => ({
      ...scoreProductAffinity(product, profile),
      originalIndex: index,
    }))
    .sort(compareProducts)
    .slice(0, Math.max(0, limit))
    .map(({ product, score, categoryScore, brandScore, lastInteractionMs }) => ({
      product,
      score,
      categoryScore,
      brandScore,
      lastInteractionMs,
    }));
}
