import { useEffect, useRef } from "react";
import { useInstantSearch } from "react-instantsearch";
import { useAnalytics } from "./useAnalytics";

const SEARCH_DEBOUNCE_MS = 800;

// Registra la busqueda cuando el usuario deja de escribir y Algolia ya respondio.
export function useTrackSearch(): void {
  const { indexUiState, results, status } = useInstantSearch();
  const { track } = useAnalytics();
  const lastTracked = useRef<string | null>(null);

  const query = (indexUiState?.query ?? "").trim();
  const resultsQuery = results.query;
  const nbHits = results.nbHits;

  useEffect(() => {
    if (!query) {
      // Al vaciar la caja se permite registrar de nuevo el mismo termino.
      lastTracked.current = null;
      return;
    }

    if (status !== "idle" || resultsQuery !== query) {
      return;
    }

    const key = query.toLowerCase();
    if (lastTracked.current === key) {
      return;
    }

    const timeout = window.setTimeout(() => {
      lastTracked.current = key;
      track("SEARCH", { query, nbHits });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [query, resultsQuery, nbHits, status, track]);
}
