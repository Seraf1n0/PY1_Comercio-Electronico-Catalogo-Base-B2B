import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { searchClient, algoliaIndex } from "../../algoliaClient";
import type { Product } from "../../Catalog/types";
import ProductDetail from "./ProductDetail";

interface AlgoliaHitsResult {
  hits: Product[];
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

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
          setError("Producto no encontrado");
        } else {
          setProduct(hits[0]);
        }
      } catch {
        if (!cancelled) setError("Ocurrió un error al buscar el producto");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p>Cargando producto...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return null;

  return <ProductDetail product={product} />;
}