import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { searchClient, algoliaIndex } from "../../algoliaClient";
import type { Product } from "../../Catalog/types";
import { errorMessages } from "../../lib/errorMessages";
import ProductDetail from "./ProductDetail";
import ProductDetailSkeleton from "../../components/ProductDetailSkeleton";
import { useAuth } from "../../auth/useAuth";
import { useAnalytics } from "../../analytics/useAnalytics";

interface AlgoliaHitsResult {
  hits: Product[];
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const userId = user?.objectID;
  const { track } = useAnalytics();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchProduct() {
      try {
        const response = await searchClient.search([
          {
            indexName: algoliaIndex,
            params: { filters: `objectID:${id}` },
          },
        ]);

        if (cancelled) return;

        const hits = (response.results[0] as AlgoliaHitsResult).hits;

        if (hits.length === 0) {
          setError(errorMessages.catalog.productNotFound);
        } else {
          setProduct(hits[0]);
        }
      } catch {
        if (!cancelled) setError(errorMessages.catalog.productLoadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!product || !userId) return;

    track("PRODUCT_VIEW", {
      productId: product.objectID,
      title: product.title,
      category: product.categories[0] ?? "",
      brand: product.brand,
      price: product.price,
      img: product.images_urls[0] ?? "",
    });
  }, [product, userId, track]);

  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">Cargando producto…</span>
        <ProductDetailSkeleton />
      </div>
    );
  }
  if (error) return <p>{error}</p>;
  if (!product) return null;

  return <ProductDetail product={product} />;
}
