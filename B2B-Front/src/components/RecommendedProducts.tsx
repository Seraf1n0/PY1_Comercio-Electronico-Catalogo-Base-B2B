import { useEffect, useState } from "react";
import type { Product } from "../Catalog/types";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../cart/useCart";
import { buildAffinityProfile, rankProductsByAffinity, type ScoredProduct } from "../analytics/affinityEngine";
import { loadEvents } from "../analytics/eventStore";
import { algoliaIndex, searchClient } from "../lib/algolia";
import ProductHit from "../pages/search/components/ProductHit";

interface AlgoliaHitsResult {
  hits: Product[];
}

interface RecommendedProductsProps {
  excludeProductIds?: readonly string[];
  limit?: number;
  recentTieBreakWindowMs?: number;
  recencyMultiplier?: boolean;
  title?: string;
}

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

/** Aqui buscamos en algolia y utilizamos el motor para darles orden */
export default function RecommendedProducts({
  excludeProductIds = [],
  limit = 4,
  recentTieBreakWindowMs = TWO_DAYS_MS,
  recencyMultiplier = false,
  title = "Recomendados para ti",
}: RecommendedProductsProps) {
  const { user } = useAuth();
  const { state: cartState } = useCart();
  const userId = user?.objectID;
  const excludedIdsKey = [...new Set([
    ...excludeProductIds,
    ...cartState.items.map((item) => item.id),
  ])].sort().join("|");
  const [recommendations, setRecommendations] = useState<ScoredProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      setLoading(true);
      setRecommendations([]);

      if (!userId) {
        setLoading(false);
        return;
      }

      const profile = buildAffinityProfile(loadEvents(userId), {
        recencyMultiplier,
      });
      if (profile.categories.length === 0 && profile.brands.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const affinityFilters = [
          ...profile.categories.slice(0, 10).map(({ value }) =>
            `categories:"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`,
          ),
          ...profile.brands.slice(0, 10).map(({ value }) =>
            `brand:"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`,
          ),
        ];
        const response = await searchClient.search([
          {
            indexName: algoliaIndex,
            params: {
              query: "",
              hitsPerPage: 100,
              filters: `in_stock:true AND (${affinityFilters.join(" OR ")})`,
            },
          },
        ]);

        if (cancelled) return;

        const candidates = (response.results[0] as AlgoliaHitsResult).hits;
        const excludedIds = new Set(excludedIdsKey ? excludedIdsKey.split("|") : []);
        const ranked = rankProductsByAffinity(candidates, profile, {
          excludeProductIds: excludedIds,
          limit,
          recentTieBreakWindowMs,
        }).filter(({ score }) => score > 0);

        setRecommendations(ranked);
      } catch (error) {
        console.error("[recommendations] No se pudieron cargar productos.", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadRecommendations();
    return () => {
      cancelled = true;
    };
  }, [userId, excludedIdsKey, limit, recentTieBreakWindowMs, recencyMultiplier]);

  if (!loading && recommendations.length === 0) return null;

  return (
    <section aria-labelledby="recommended-products-title">
      <div className="mb-4">
        <h2 id="recommended-products-title" className="text-lg font-bold text-slate-800">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Seleccionados según las categorías y marcas que te interesan.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500" role="status">Buscando productos para ti…</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map(({ product }) => (
            <li key={product.objectID} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <ProductHit hit={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
