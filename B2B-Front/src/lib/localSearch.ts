/**
 * Motor de busqueda local de respaldo (contingencia cuando Algolia no esta
 * disponible). Responde con la MISMA forma que Algolia para que InstantSearch,
 * el detalle de producto, el panel admin y el login sigan funcionando con los
 * datos semilla del repositorio (data/products.json y data/users.json).
 *
 * Soporta: query de texto, filters "objectID:x", facetFilters, numericFilters,
 * facets (conteos y facets_stats), paginacion y busqueda de valores de faceta.
 */
type Hit = Record<string, unknown> & { objectID: string };

export type LocalRequest = {
  indexName: string;
  type?: string;
  facet?: string;
  params?: Record<string, unknown>;
};

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>(
    (current, key) => (current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined),
    obj,
  );
}

function valuesOf(hit: Hit, attribute: string): string[] {
  const raw = getPath(hit, attribute);
  const list = Array.isArray(raw) ? raw : [raw];
  return list.filter((v) => v !== null && v !== undefined && v !== "").map(String);
}

const SEARCHABLE = ["objectID", "title", "brand", "model", "description", "categories", "username", "email", "displayName"];

function matchesQuery(hit: Hit, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalize(SEARCHABLE.flatMap((attr) => valuesOf(hit, attr)).join(" "));
  return words.every((word) => haystack.includes(word));
}

/** "attr:valor" o "attr:\"valor\"" */
function matchesFacetString(hit: Hit, expr: string): boolean {
  const negated = expr.startsWith("-");
  const clean = negated ? expr.slice(1) : expr;
  const index = clean.indexOf(":");
  if (index === -1) return true;
  const attribute = clean.slice(0, index);
  const value = clean.slice(index + 1).replace(/^"|"$/g, "");
  const hasValue = valuesOf(hit, attribute).includes(value);
  return negated ? !hasValue : hasValue;
}

/** facetFilters: [["a:1","a:2"], "b:3"] => (a=1 OR a=2) AND b=3 */
function matchesFacetFilters(hit: Hit, facetFilters: unknown): boolean {
  if (!facetFilters) return true;
  const groups = Array.isArray(facetFilters) ? facetFilters : [facetFilters];
  return groups.every((group) =>
    Array.isArray(group)
      ? group.some((expr) => matchesFacetString(hit, String(expr)))
      : matchesFacetString(hit, String(group)),
  );
}

/** numericFilters: ["price>=100", ["year=2020","year=2021"]] */
function matchesNumericExpr(hit: Hit, expr: string): boolean {
  const match = expr.match(/^(.+?)(<=|>=|!=|<|>|=)(.+)$/);
  if (!match) return true;
  const [, attribute, op, rawValue] = match;
  const value = Number(rawValue);
  const actual = Number(getPath(hit, attribute.trim()));
  if (!Number.isFinite(actual)) return false;
  switch (op) {
    case "<=": return actual <= value;
    case ">=": return actual >= value;
    case "<": return actual < value;
    case ">": return actual > value;
    case "!=": return actual !== value;
    default: return actual === value;
  }
}

function matchesNumericFilters(hit: Hit, numericFilters: unknown): boolean {
  if (!numericFilters) return true;
  const groups = Array.isArray(numericFilters) ? numericFilters : [numericFilters];
  return groups.every((group) =>
    Array.isArray(group)
      ? group.some((expr) => matchesNumericExpr(hit, String(expr)))
      : matchesNumericExpr(hit, String(group)),
  );
}

/** Solo se soporta el filtro usado por la app: objectID:xxx (con o sin comillas). */
function matchesFilters(hit: Hit, filters: unknown): boolean {
  if (typeof filters !== "string" || !filters.trim()) return true;
  const match = filters.match(/objectID:"?([^"\s)]+)"?/);
  return match ? hit.objectID === match[1] : true;
}

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return value === "*" ? ["*"] : [value];
  return [];
}

function computeFacets(hits: Hit[], requested: string[]) {
  const facets: Record<string, Record<string, number>> = {};
  const stats: Record<string, { min: number; max: number; avg: number; sum: number }> = {};

  for (const attribute of requested) {
    if (attribute === "*") continue;
    const counts: Record<string, number> = {};
    const numbers: number[] = [];
    for (const hit of hits) {
      for (const value of valuesOf(hit, attribute)) {
        counts[value] = (counts[value] ?? 0) + 1;
        const number = Number(value);
        if (Number.isFinite(number)) numbers.push(number);
      }
    }
    facets[attribute] = counts;
    if (numbers.length > 0) {
      const sum = numbers.reduce((a, b) => a + b, 0);
      stats[attribute] = { min: Math.min(...numbers), max: Math.max(...numbers), avg: sum / numbers.length, sum };
    }
  }
  return { facets, stats };
}

export function runLocalSearch(request: LocalRequest, dataset: Hit[]) {
  const params = request.params ?? {};
  const query = typeof params.query === "string" ? params.query : "";

  const filtered = dataset.filter(
    (hit) =>
      matchesQuery(hit, query) &&
      matchesFilters(hit, params.filters) &&
      matchesFacetFilters(hit, params.facetFilters) &&
      matchesNumericFilters(hit, params.numericFilters),
  );

  // Busqueda de valores de faceta (ej. buscador dentro del filtro de marca).
  if (request.type === "facet" && request.facet) {
    const facetQuery = normalize(String(params.facetQuery ?? ""));
    const { facets } = computeFacets(filtered, [request.facet]);
    const facetHits = Object.entries(facets[request.facet] ?? {})
      .filter(([value]) => normalize(value).includes(facetQuery))
      .sort((a, b) => b[1] - a[1])
      .slice(0, Number(params.maxFacetHits ?? 10))
      .map(([value, count]) => ({ value, highlighted: value, count }));
    return { facetHits, exhaustiveFacetsCount: true, processingTimeMS: 0 };
  }

  const hitsPerPage = Math.max(1, Math.min(1000, Number(params.hitsPerPage ?? 20)));
  const page = Math.max(0, Number(params.page ?? 0));
  const nbPages = Math.max(1, Math.ceil(filtered.length / hitsPerPage));
  const { facets, stats } = computeFacets(filtered, toList(params.facets));

  return {
    hits: filtered.slice(page * hitsPerPage, (page + 1) * hitsPerPage),
    nbHits: filtered.length,
    page,
    nbPages,
    hitsPerPage,
    processingTimeMS: 0,
    exhaustiveNbHits: true,
    query,
    params: "",
    index: request.indexName,
    facets,
    facets_stats: stats,
  };
}