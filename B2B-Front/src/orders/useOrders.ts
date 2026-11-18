import { useContext } from "react";
import { OrdersContext, type OrdersContextValue } from "./ordersContextValue";

export function useOrders(): OrdersContextValue {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders debe usarse dentro de OrdersProvider");
  }
  return context;
}
