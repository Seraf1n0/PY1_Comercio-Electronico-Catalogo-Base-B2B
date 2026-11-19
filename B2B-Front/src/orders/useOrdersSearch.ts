import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { canViewOrder } from "./orderAccess";
import {
  getIndexedOrder,
  searchOrders,
  type OrdersSearchOptions,
  type OrdersSearchParams,
} from "./ordersIndexService";
import { getOrderByNumber } from "./ordersStorage";
import type { Order } from "./types";

export type UseOrdersSearchOptions = OrdersSearchParams & OrdersSearchOptions;

export type UseOrdersSearchResult = {
  orders: Order[];
  loading: boolean;
  error: string | null;
  page: number;
  nbPages: number;
  nbHits: number;
  reload: () => void;
};

type OrdersState = {
  key: string;
  orders: Order[];
  loading: boolean;
  error: string | null;
  page: number;
  nbPages: number;
  nbHits: number;
};

const EMPTY_STATE: Omit<OrdersState, "key"> = {
  orders: [],
  loading: false,
  error: null,
  page: 0,
  nbPages: 0,
  nbHits: 0,
};

/**
 * Busca ordenes en el indice (mas las locales pendientes). Sin debounce:
 * cada cambio de parametros dispara una consulta nueva. El estado guarda la
 * clave de la consulta para no mostrar resultados de una busqueda anterior.
 */
export function useOrdersSearch({
  query,
  filters,
  page,
  hitsPerPage,
  scope,
}: UseOrdersSearchOptions = {}): UseOrdersSearchResult {
  const { user } = useAuth();
  const [reloadTick, setReloadTick] = useState(0);
  const [state, setState] = useState<OrdersState | null>(null);

  const key = [
    user?.objectID ?? "",
    query ?? "",
    filters ?? "",
    String(page ?? ""),
    String(hitsPerPage ?? ""),
    scope ?? "",
    String(reloadTick),
  ].join("\u0001");

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    void searchOrders({ query, filters, page, hitsPerPage }, user, { scope })
      .then((result) => {
        if (cancelled) {
          return;
        }

        setState({
          key,
          orders: result.orders,
          loading: false,
          error: result.error,
          page: result.page,
          nbPages: result.nbPages,
          nbHits: result.nbHits,
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setState({
          key,
          ...EMPTY_STATE,
          error: "No se pudieron consultar las órdenes.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [user, query, filters, page, hitsPerPage, scope, reloadTick, key]);

  const reload = useCallback(() => setReloadTick((tick) => tick + 1), []);
  const current = state && state.key === key ? state : null;

  if (!user) {
    return { ...EMPTY_STATE, reload };
  }

  return {
    orders: current?.orders ?? EMPTY_STATE.orders,
    loading: current ? current.loading : true,
    error: current?.error ?? null,
    page: current?.page ?? 0,
    nbPages: current?.nbPages ?? 0,
    nbHits: current?.nbHits ?? 0,
    reload,
  };
}

type OrderDetailState = {
  key: string;
  order: Order | null;
};

/**
 * Resuelve una orden por numero: primero local (si el usuario puede verla)
 * y, si no esta, en el indice. Devuelve null si no existe o no hay permiso.
 */
export function useOrderDetail(orderNumber?: number): {
  order: Order | null;
  loading: boolean;
} {
  const { user } = useAuth();
  const validNumber =
    typeof orderNumber === "number" &&
    Number.isInteger(orderNumber) &&
    orderNumber > 0
      ? orderNumber
      : undefined;
  const localOrder = useMemo(
    () => (validNumber === undefined ? null : getOrderByNumber(validNumber)),
    [validNumber],
  );
  const visibleLocal =
    localOrder !== null && user !== null && canViewOrder(localOrder, user)
      ? localOrder
      : null;
  const key = `${user?.objectID ?? ""}\u0001${validNumber ?? ""}`;
  const [state, setState] = useState<OrderDetailState | null>(null);

  useEffect(() => {
    if (!user || validNumber === undefined || visibleLocal !== null) {
      return;
    }

    let cancelled = false;

    void getIndexedOrder(validNumber, user)
      .then((remoteOrder) => {
        if (!cancelled) {
          setState({ key, order: remoteOrder });
        }
      })
      .catch(() => {
        // getIndexedOrder nunca lanza; la orden queda en null.
        if (!cancelled) {
          setState({ key, order: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, validNumber, visibleLocal, key]);

  if (visibleLocal !== null) {
    return { order: visibleLocal, loading: false };
  }

  if (!user || validNumber === undefined) {
    return { order: null, loading: false };
  }

  if (state && state.key === key) {
    return { order: state.order, loading: false };
  }

  return { order: null, loading: true };
}
