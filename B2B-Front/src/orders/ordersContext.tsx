import { useEffect, type ReactNode } from "react";
import { retryPendingOrders } from "./ordersIndexService";
import { OrdersContext } from "./ordersContextValue";

export function OrdersProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void retryPendingOrders();
  }, []);

  return (
    <OrdersContext.Provider value={{ retryPendingOrders }}>
      {children}
    </OrdersContext.Provider>
  );
}
