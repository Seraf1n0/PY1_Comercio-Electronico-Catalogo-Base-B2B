import { liteClient as algoliasearch } from "algoliasearch/lite";
import { isAlgoliaDownSimulated, setAlgoliaStatus } from "./algoliaStatus";
import { runLocalSearch, type LocalRequest } from "./localSearch";

const APP_ID: string | undefined = import.meta.env.VITE_ALGOLIA_APP_ID;
const SEARCH_KEY: string | undefined = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;

export const algoliaIndex: string = import.meta.env.VITE_ALGOLIA_INDEX_NAME || "products";
const USERS_INDEX: string = import.meta.env.VITE_ALGOLIA_USERS_INDEX_NAME || "users";

const isConfigured = Boolean(APP_ID && SEARCH_KEY);
/** Tiempo maximo de espera antes de pasar a la contingencia. */
const TIMEOUT_MS = 6000;
/** Tras un fallo no se reintenta Algolia durante este tiempo (evita esperar en cada consulta). */
const RETRY_AFTER_MS = 30_000;


const client = algoliasearch(APP_ID || "offline", SEARCH_KEY || "offline");
const remoteSearch = client.search.bind(client);

let lastFailureAt = 0;

/** Datos semilla del repo; se cargan bajo demanda solo si hacen falta. */
let localData: Promise<Record<string, Record<string, unknown>[]>> | null = null;
function loadLocalData() {
  localData ??= Promise.all([
    import("../../data/products.json"),
    import("../../data/users.json"),
  ]).then(([products, users]) => ({
    [algoliaIndex]: products.default as unknown as Record<string, unknown>[],
    [USERS_INDEX]: users.default as unknown as Record<string, unknown>[],
  }));
  return localData;
}

async function searchLocally(requests: LocalRequest[]) {
  const data = await loadLocalData();

  await new Promise((resolve) => setTimeout(resolve, 0));
  return {
    results: requests.map((request) =>
      runLocalSearch(request, (data[request.indexName] ?? []) as never),
    ),
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Tiempo de espera agotado")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Contingencia: intenta Algolia y, si no esta configurado, no responde a
 * tiempo o devuelve error, responde con los datos locales del repositorio.
 * Todo el que usa `searchClient` (catalogo, detalle, admin y login) queda
 * cubierto sin cambiar su codigo.
 */
async function resilientSearch(...args: Parameters<typeof remoteSearch>) {
  const requests = (Array.isArray(args[0]) ? args[0] : (args[0] as { requests: LocalRequest[] }).requests) as LocalRequest[];

  const reason = !isConfigured
    ? "Algolia no está configurado."
    : isAlgoliaDownSimulated()
      ? "Caída de Algolia simulada para pruebas."
      : Date.now() - lastFailureAt < RETRY_AFTER_MS
        ? "Algolia no respondió hace un momento."
        : null;

  if (!reason) {
    try {
      const response = await withTimeout(remoteSearch(...args), TIMEOUT_MS);
      setAlgoliaStatus("online");
      return response;
    } catch (error) {
      console.warn("[algolia] Sin respuesta de Algolia, se usa la contingencia local.", error);
      lastFailureAt = Date.now();
      setAlgoliaStatus("fallback", "No se pudo conectar con Algolia.");
    }
  } else {
    setAlgoliaStatus("fallback", reason);
  }

  return (await searchLocally(requests)) as Awaited<ReturnType<typeof remoteSearch>>;
}

client.search = resilientSearch as typeof client.search;

export const searchClient = client;