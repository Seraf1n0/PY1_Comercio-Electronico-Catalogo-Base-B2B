import type { CartItem } from "./types";

export function meetsB2BMinimum(items: CartItem[]): boolean {
  const totalVehicles = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return totalVehicles >= 4;
}