import type { Role } from "../../auth/types";
import { applyPriceOverride } from "./priceOverrides";
export type PriceTier = "B2C" | "B2B";

/** Lo minimo que necesita la etiqueta: sirve para Product y para CartItem. */
export type Priceable = {
    objectID?: string;
  id?: string;
  price?: number;
  prices?: { B2C?: number; B2B?: number };
};

export type PriceView =
  | { status: "unavailable"; tier: PriceTier }
  | {
      status: "ok";
      /** Tarifa que paga este usuario en este momento. */
      tier: PriceTier;
      amount: number;
      /** Precio de referencia tachado (B2C cuando se muestra B2B). */
      compareAt?: number;
      savingsPercent?: number;
      /** Precio B2B que obtendria el cliente B2B al cumplir la condicion. */
      pendingB2B?: number;
    }
  | { status: "admin"; b2c: number | null; b2b: number | null };

/** Un precio es valido si es un numero finito mayor que cero. */
export function isValidPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function b2cOf(item: Priceable): number | null {
  if (isValidPrice(item.prices?.B2C)) return item.prices.B2C;
  return isValidPrice(item.price) ? item.price : null;
}

/** El B2B solo es usable si es valido y no supera al B2C */
function b2bOf(item: Priceable, b2c: number | null): number | null {
  const b2b = item.prices?.B2B;
  if (!isValidPrice(b2b)) return null;
  return b2c !== null && b2b > b2c ? null : b2b;
}

/**
 * Decide que precio ve cada rol. Es la unica fuente de verdad visual:
 * catalogo, detalle y carrito usan esta funcion (via PriceTag), y coincide
 * con selectPrice/applyB2BCondition, que son los que llegan a la orden.
 *
 * - B2C: precio B2C.
 * - B2B: precio B2B con el B2C tachado. En el carrito, si aun no cumple el
 *   minimo de vehiculos (appliedTier = "B2C"), paga B2C y se le muestra el B2B pendiente.
 * - ADMIN: ve ambos precios (no compra).
 */
export function getPriceView(
  item: Priceable,
  role: Role | null,
  appliedTier?: PriceTier,
): PriceView {
    item = applyPriceOverride(item);
  const b2c = b2cOf(item);

    const b2b = b2bOf(item, b2c);

  if (role === "ADMIN") {
    // El admin ve los valores crudos para poder detectar el problema.
    const rawB2B = isValidPrice(item.prices?.B2B) ? item.prices.B2B : null;
    return { status: "admin", b2c, b2b: rawB2B };
  }

  if (role === "B2B") {
    const tier = appliedTier ?? "B2B";
    if (tier === "B2C") {
      return b2c === null
        ? { status: "unavailable", tier: "B2C" }
        : { status: "ok", tier: "B2C", amount: b2c, pendingB2B: b2b ?? undefined };
    }
    if (b2b === null) return { status: "unavailable", tier: "B2B" };
    const savings = b2c !== null && b2c > b2b ? Math.round(((b2c - b2b) / b2c) * 100) : undefined;
    return {
      status: "ok",
      tier: "B2B",
      amount: b2b,
      compareAt: savings ? (b2c ?? undefined) : undefined,
      savingsPercent: savings,
    };
  }

  return b2c === null
    ? { status: "unavailable", tier: "B2C" }
    : { status: "ok", tier: "B2C", amount: b2c };
}