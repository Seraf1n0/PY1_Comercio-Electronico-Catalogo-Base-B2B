import { algoliasearch } from "algoliasearch";
import type { AppUser } from "../auth/types";
import { canViewOrder } from "./orderAccess";
import { getOrders, updateOrder } from "./ordersStorage";
import type { Order } from "./types";

const APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID;
const WRITE_KEY = import.meta.env.VITE_ALGOLIA_WRITE_KEY;
const SEARCH_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;
const ORDERS_INDEX_NAME =
  import.meta.env.VITE_ALGOLIA_ORDERS_INDEX_NAME || "orders";

const writeClient =
  APP_ID && WRITE_KEY ? algoliasearch(APP_ID, WRITE_KEY) : null;

// Cliente de solo lectura. Algolia es opcional: si falta configuracion,
// la app sigue funcionando con las ordenes locales.
const readClient =
  APP_ID && SEARCH_KEY ? algoliasearch(APP_ID, SEARCH_KEY) : null;

export type OrderRecord = Order & {
  objectID: string;
  buyer: Order["buyer"] & { fullName: string };
};

export function toOrderRecord(order: Order): OrderRecord {
  return {
    ...order,
    objectID: String(order.orderNumber),
    buyer: {
      ...order.buyer,
      fullName:
        `${order.buyer.name} ${order.buyer.lastName}`.trim() || order.userName,
    },
  };
}

// Publica una orden y refleja el resultado en su syncStatus local.
// Nunca lanza: si falla, la orden queda en PENDING para reintentarse.
async function doPublish(order: Order): Promise<boolean> {
  if (!writeClient) {
    return false;
  }

  updateOrder(order.orderNumber, { syncStatus: "PENDING" });

  try {
    await writeClient.saveObject({
      indexName: ORDERS_INDEX_NAME,
      body: toOrderRecord(order),
    });
    updateOrder(order.orderNumber, { syncStatus: "SYNCED" });
    return true;
  } catch (error) {
    console.warn(
      `[ordersIndexService] No se pudo publicar la orden ${order.orderNumber} en Algolia.`,
      error,
    );
    updateOrder(order.orderNumber, { syncStatus: "PENDING" });
    return false;
  }
}

// Publicaciones encoladas por numero de orden: la creacion nunca pisa al pago.
const publishQueue = new Map<number, Promise<boolean>>();

export function publishOrder(order: Order): Promise<boolean> {
  const key = order.orderNumber;
  const previous = publishQueue.get(key) ?? Promise.resolve(false);

  const current = previous
    .catch(() => false)
    .then(() => doPublish(order))
    .catch(() => false);

  publishQueue.set(key, current);

  void current.then(() => {
    if (publishQueue.get(key) === current) {
      publishQueue.delete(key);
    }
  });

  return current;
}

// Guard de modulo para StrictMode: el reintento corre una sola vez a la vez.
let retryInFlight: Promise<void> | null = null;

export function retryPendingOrders(): Promise<void> {
  if (retryInFlight) {
    return retryInFlight;
  }

  const run = (async () => {
    try {
      const pending = getOrders().filter(
        (order) => order.syncStatus === "PENDING",
      );
      for (const order of pending) {
        await publishOrder(order);
      }
    } catch (error) {
      console.warn(
        "[ordersIndexService] No se pudieron reintentar las ordenes pendientes.",
        error,
      );
    }
  })();

  retryInFlight = run;

  void run.then(() => {
    if (retryInFlight === run) {
      retryInFlight = null;
    }
  });

  return run;
}

// ---------------------------------------------------------------------------
// AL-06: capa de lectura unica de ordenes.
// Clientes siempre filtran por su userId; ADMIN puede pedir "all" o "own".
// ---------------------------------------------------------------------------

export type OrdersScope = "own" | "all";

export type OrdersSearchParams = {
  query?: string;
  filters?: string;
  /** Base 0, igual que Algolia. */
  page?: number;
  hitsPerPage?: number;
};

export type OrdersSearchOptions = { scope?: OrdersScope };

export type OrdersSearchResult = {
  orders: Order[];
  page: number;
  nbPages: number;
  nbHits: number;
  error: string | null;
};

/** Escapa un valor para usarlo entre comillas dentro de un filtro de Algolia. */
export function quoteFilterValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Un cliente nunca puede ampliar su alcance: solo ADMIN llega a "all". */
export function resolveOrdersScope(
  viewer: AppUser,
  scope?: OrdersScope,
): OrdersScope {
  if (viewer.role !== "ADMIN") {
    return "own";
  }

  return scope ?? "all";
}

export type OrdersFilterOptions = { scope?: OrdersScope; filters?: string };

/**
 * Construye el filtro de Algolia. En "own" siempre se antepone userId;
 * si el usuario no tiene id devuelve undefined y el llamador corta antes
 * (un filtro `userId:""` es invalido y Algolia responde 400).
 */
export function buildOrdersFilter(
  viewer: AppUser,
  options?: OrdersFilterOptions,
): string | undefined {
  const scope = resolveOrdersScope(viewer, options?.scope);
  const extra = options?.filters?.trim() || undefined;

  if (scope === "all") {
    return extra;
  }

  const userId = viewer.objectID?.trim();

  if (!userId) {
    return undefined;
  }

  const ownFilter = `userId:"${quoteFilterValue(userId)}"`;

  return extra ? `${ownFilter} AND (${extra})` : ownFilter;
}

/** Un hit del indice vuelve a la forma de Order (sin objectID). */
function toOrderFromRecord(record: OrderRecord): Order {
  const { objectID, ...rest } = record;
  void objectID;

  const createdAtTs =
    typeof rest.createdAtTs === "number" && Number.isFinite(rest.createdAtTs)
      ? rest.createdAtTs
      : Date.parse(rest.date) || 0;

  return { ...rest, createdAtTs };
}

/**
 * Ordenes locales que aun no estan en el indice. Los filtros de Algolia no
 * se pueden evaluar en local: si hay filtros extra se descartan los pendientes.
 */
function getPendingLocalOrders(
  viewer: AppUser,
  scope: OrdersScope,
  query: string | undefined,
  filters: string | undefined,
): Order[] {
  if (filters) {
    return [];
  }

  const pending = getOrders().filter((order) => order.syncStatus === "PENDING");
  const scoped =
    scope === "own"
      ? pending.filter((order) => order.userId === viewer.objectID)
      : pending;
  const normalizedQuery = query?.trim().toLowerCase();

  if (!normalizedQuery) {
    return scoped;
  }

  return scoped.filter((order) => {
    const haystack = [
      String(order.orderNumber),
      `${order.buyer.name} ${order.buyer.lastName}`.trim(),
      order.userName,
      order.company?.name ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

/** Duplicados: gana el indice; los locales solo rellenan numeros ausentes. */
function mergeOrders(indexOrders: Order[], locals: Order[]): Order[] {
  const seen = new Set(indexOrders.map((order) => order.orderNumber));
  const merged = [...indexOrders];

  for (const local of locals) {
    if (!seen.has(local.orderNumber)) {
      seen.add(local.orderNumber);
      merged.push(local);
    }
  }

  return merged.sort((a, b) => {
    const timeA = Number.isFinite(a.createdAtTs) ? a.createdAtTs : 0;
    const timeB = Number.isFinite(b.createdAtTs) ? b.createdAtTs : 0;

    if (timeB !== timeA) {
      return timeB - timeA;
    }

    return b.orderNumber - a.orderNumber;
  });
}

/**
 * Consulta el indice y combina las ordenes locales pendientes. Nunca lanza:
 * cualquier fallo se devuelve en `error` junto con lo que haya en local.
 *
 * Limitacion conocida: los pendientes solo se combinan en `page === 0`
 * (la primera pagina trae los mas recientes) para no duplicarlos ni falsear
 * la paginacion de Algolia; `nbHits` suma los añadidos en esa pagina.
 */
export async function searchOrders(
  params: OrdersSearchParams,
  viewer: AppUser,
  options?: OrdersSearchOptions,
): Promise<OrdersSearchResult> {
  const page = Math.max(0, Math.trunc(params.page ?? 0));
  const hitsPerPage = Math.min(
    100,
    Math.max(1, Math.trunc(params.hitsPerPage ?? 20)),
  );
  const scope = resolveOrdersScope(viewer, options?.scope);
  const query = params.query?.trim() ?? "";
  const extraFilters = params.filters?.trim() || undefined;

  if (scope === "own" && !viewer.objectID) {
    return {
      orders: [],
      page,
      nbPages: 1,
      nbHits: 0,
      error: "No se pudo identificar al usuario.",
    };
  }

  const filter = buildOrdersFilter(viewer, { scope, filters: extraFilters });

  if (!readClient) {
    const locals =
      page === 0
        ? getPendingLocalOrders(viewer, scope, query, extraFilters)
        : [];

    return {
      orders: mergeOrders([], locals),
      page,
      nbPages: 1,
      nbHits: locals.length,
      error: "Algolia no está configurado.",
    };
  }

  try {
    const response = await readClient.searchSingleIndex<OrderRecord>({
      indexName: ORDERS_INDEX_NAME,
      searchParams: {
        query,
        filters: filter || undefined,
        page,
        hitsPerPage,
        attributesToHighlight: [],
      },
    });

    const indexOrders = (response.hits ?? []).map(toOrderFromRecord);
    const locals =
      page === 0
        ? getPendingLocalOrders(viewer, scope, query, extraFilters)
        : [];
    const orders = page === 0 ? mergeOrders(indexOrders, locals) : indexOrders;

    return {
      orders,
      page: response.page ?? page,
      nbPages: Math.max(response.nbPages ?? 1, 1),
      nbHits: (response.nbHits ?? 0) + Math.max(orders.length - indexOrders.length, 0),
      error: null,
    };
  } catch (error) {
    console.warn(
      "[ordersIndexService] No se pudieron consultar las ordenes.",
      error,
    );

    const locals =
      page === 0
        ? getPendingLocalOrders(viewer, scope, query, extraFilters)
        : [];

    return {
      orders: mergeOrders([], locals),
      page,
      nbPages: 1,
      nbHits: locals.length,
      error: "No se pudieron consultar las órdenes en Algolia.",
    };
  }
}

/**
 * Lee una orden del indice aplicando permisos. Devuelve null si no existe,
 * si no hay cliente o si el usuario no puede verla. Nunca lanza.
 */
export async function getIndexedOrder(
  orderNumber: number,
  viewer: AppUser,
): Promise<Order | null> {
  if (!Number.isInteger(orderNumber) || orderNumber <= 0) {
    return null;
  }

  if (!readClient || !viewer.objectID) {
    return null;
  }

  try {
    const record = await readClient.getObject<OrderRecord>({
      indexName: ORDERS_INDEX_NAME,
      objectID: String(orderNumber),
    });
    const order = toOrderFromRecord(record);

    return canViewOrder(order, viewer) ? order : null;
  } catch (error) {
    const status = (error as { status?: number } | null)?.status;

    if (status !== 404) {
      console.warn("[ordersIndexService] No se pudo leer la orden.", error);
    }

    return null;
  }
}
