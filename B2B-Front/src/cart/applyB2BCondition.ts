import type { Role } from "../auth/types";
import type { CartItem } from "./types";
import { meetsB2BMinimum } from "./b2bEligibility";
import { applyPriceOverride } from "../Catalog/pricing/priceOverrides";


// Si el rol es B2B y tiene 4 vehiculos aunque sean de otros modelos se aplica precio B2B sino original.
// Los precios se toman con los ajustes simulados del admin aplicados, para que
// el carrito, el checkout y la orden usen el mismo precio que muestra el catalogo.
export function applyB2BCondition(items: CartItem[], role: Role): CartItem[] {
  const useB2BPrice = role === "B2B" && meetsB2BMinimum(items);
  const priceType = useB2BPrice ? "B2B" : "B2C";

  return items.map((original) => {
    const item = applyPriceOverride(original);
    const price = item.prices?.[priceType] ?? item.price;

    return {
      ...item,
      price,
      subtotal: price * item.quantity,
    };
  });
}