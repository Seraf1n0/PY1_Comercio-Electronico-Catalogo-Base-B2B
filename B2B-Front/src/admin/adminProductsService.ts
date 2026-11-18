import type { Product } from "../Catalog/types";
import { algoliaIndex, searchClient } from "../lib/algolia";

export type AdminProductsParams = {
  query?: string;
  /** Base 0, igual que Algolia. */
  page?: number;
  hitsPerPage?: number;
};

export type AdminProductsResult = {
  products: Product[];
  page: number;
  nbPages: number;
  nbHits: number;
  error: string | null;
};

type ProductSearchResponse = {
  hits: Product[];
  page?: number;
  nbPages?: number;
  nbHits?: number;
};


export async function searchAdminProducts(
  params: AdminProductsParams,
): Promise<AdminProductsResult> {
  const page = Math.max(0, Math.trunc(params.page ?? 0));
  const hitsPerPage = Math.min(100, Math.max(1, Math.trunc(params.hitsPerPage ?? 20)));

  try {
    const response = await searchClient.search([
      {
        indexName: algoliaIndex,
        params: {
          query: params.query?.trim() ?? "",
          page,
          hitsPerPage,
          attributesToHighlight: [],
        },
      },
    ]);
    const result = response.results[0] as ProductSearchResponse;

    return {
      products: result.hits ?? [],
      page: result.page ?? page,
      nbPages: Math.max(result.nbPages ?? 1, 1),
      nbHits: result.nbHits ?? 0,
      error: null,
    };
  } catch (error) {
    console.warn("[adminProductsService] No se pudo consultar el catálogo.", error);
    return {
      products: [],
      page,
      nbPages: 1,
      nbHits: 0,
      error: "No se pudo consultar el catálogo en Algolia.",
    };
  }
}


/** Campos necesarios para la vista de inventario (respuesta mas liviana). */
const INVENTORY_ATTRIBUTES = [
  "objectID",
  "title",
  "brand",
  "model",
  "year",
  "categories",
  "images_urls",
  "stock",
  "in_stock",
  "price",
  "prices",
];

export type AllProductsResult = { products: Product[]; error: string | null };

/**
 * Trae el catalogo completo en una sola consulta para poder sumar el inventario por sucursal de todo el
 * catalogo y no solo de una pagina. Nunca lanza.
 */
export async function loadAllProducts(): Promise<AllProductsResult> {
  try {
    const response = await searchClient.search([
      {
        indexName: algoliaIndex,
        params: {
          query: "",
          hitsPerPage: 1000,
          attributesToRetrieve: INVENTORY_ATTRIBUTES,
          attributesToHighlight: [],
        },
      },
    ]);
    const result = response.results[0] as ProductSearchResponse;
    return { products: result.hits ?? [], error: null };
  } catch (error) {
    console.warn("[adminProductsService] No se pudo cargar el inventario.", error);
    return { products: [], error: "No se pudo consultar el inventario en Algolia." };
  }
}