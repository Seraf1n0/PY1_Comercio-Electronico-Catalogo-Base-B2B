import { createContext } from "react";

export type OrdersContextValue = {
  retryPendingOrders: () => Promise<void>;
};

export const OrdersContext = createContext<OrdersContextValue | null>(null);
