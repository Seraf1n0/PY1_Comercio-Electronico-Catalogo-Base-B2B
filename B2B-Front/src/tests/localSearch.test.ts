import { describe, expect, it } from "vitest";
import { runLocalSearch } from "../lib/localSearch";

const data = [
  { objectID: "p1", title: "Toyota Corolla", brand: "TOYOTA", price: 100, facets: { year: 2024 } },
  { objectID: "p2", title: "Toyota RAV4", brand: "TOYOTA", price: 200, facets: { year: 2025 } },
  { objectID: "p3", title: "Honda Civic", brand: "HONDA", price: 150, facets: { year: 2025 } },
];

type SearchResult = { hits: { objectID: string }[]; nbHits: number; nbPages: number; facets: Record<string, Record<string, number>> };
const search = (params: Record<string, unknown>) =>
  runLocalSearch({ indexName: "products", params }, data) as unknown as SearchResult;

describe("Contingencia: búsqueda local cuando Algolia no está disponible", () => {
  it("busca por texto sin importar mayúsculas", () => {
    expect(search({ query: "toyota" }).nbHits).toBe(2);
  });

  it("filtra por objectID (detalle de producto)", () => {
    expect(search({ filters: "objectID:p3" }).hits.map((h) => h.objectID)).toEqual(["p3"]);
  });

  it("aplica filtros de faceta y numéricos como Algolia", () => {
    expect(search({ facetFilters: [["brand:HONDA"]] }).nbHits).toBe(1);
    expect(search({ numericFilters: ["price>=150"] }).nbHits).toBe(2);
    expect(search({ numericFilters: ["facets.year=2025"], facetFilters: ["brand:TOYOTA"] }).nbHits).toBe(1);
  });

  it("pagina y cuenta facetas", () => {
    const result = search({ hitsPerPage: 2, page: 1, facets: ["brand"] });
    expect(result.hits).toHaveLength(1);
    expect(result.nbPages).toBe(2);
    expect(result.facets.brand).toEqual({ TOYOTA: 2, HONDA: 1 });
  });
});
