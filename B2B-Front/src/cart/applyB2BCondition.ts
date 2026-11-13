import type { Role } from "../auth/types";
import type { CartItem } from "./types";
import { meetsB2BMinimum } from "./b2bEligibility";


// Si el rol es B2B y tiene 4 vehiculos aunque sean de otros modelos se aplica precio B2B sino original
export function applyB2BCondition(items: CartItem[], role: Role): CartItem[] {
  const useB2BPrice = role === "B2B" && meetsB2BMinimum(items);
  const priceType = useB2BPrice ? "B2B" : "B2C";

  return items.map((item) => {
    const price = item.prices?.[priceType] ?? item.price;

    return {
      ...item,
      price,
      subtotal: price * item.quantity,
    };
  });
}
