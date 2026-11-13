import type { CartItem } from "./types";

export const B2B_MINIMUM_VEHICLES = 4;

export function meetsB2BMinimum(items: Pick<CartItem, "quantity">[]): boolean {
  const totalVehicles = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return totalVehicles >= B2B_MINIMUM_VEHICLES;
}
