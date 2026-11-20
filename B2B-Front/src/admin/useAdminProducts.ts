import { useCallback, useEffect, useState } from "react";
import {
  searchAdminProducts,
  type AdminProductsParams,
  type AdminProductsResult,
} from "./adminProductsService";

type State = AdminProductsResult & { key: string };

/** Hook de lectura del catalogo para el panel */
export function useAdminProducts({ query = "", page = 0, hitsPerPage = 20 }: AdminProductsParams) {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<State | null>(null);
  const key = `${query}\u0001${page}\u0001${hitsPerPage}\u0001${tick}`;

  useEffect(() => {
    let cancelled = false;
    void searchAdminProducts({ query, page, hitsPerPage }).then((result) => {
      if (!cancelled) setState({ ...result, key });
    });
    return () => {
      cancelled = true;
    };
  }, [query, page, hitsPerPage, key]);

  const reload = useCallback(() => setTick((value) => value + 1), []);
  const current = state?.key === key ? state : null;

  return {
    products: current?.products ?? [],
    nbHits: current?.nbHits ?? 0,
    nbPages: current?.nbPages ?? 0,
    error: current?.error ?? null,
    loading: current === null,
    reload,
  };
}