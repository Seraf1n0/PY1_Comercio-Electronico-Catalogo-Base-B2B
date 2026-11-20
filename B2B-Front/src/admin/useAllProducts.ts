import { useCallback, useEffect, useState } from "react";
import { loadAllProducts, type AllProductsResult } from "./adminProductsService";

/** Catalogo completo para el panel de inventario */
export function useAllProducts() {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<(AllProductsResult & { tick: number }) | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadAllProducts().then((result) => {
      if (!cancelled) setState({ ...result, tick });
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);
  const current = state?.tick === tick ? state : null;

  return {
    products: current?.products ?? [],
    error: current?.error ?? null,
    loading: current === null,
    reload,
  };
}