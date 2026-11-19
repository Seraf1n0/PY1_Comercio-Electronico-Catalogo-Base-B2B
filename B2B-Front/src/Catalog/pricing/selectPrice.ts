import type { Product } from "../types";
import type { Role } from "../../auth/types";

export function selectPrice(product: Product, role: Role): number {
    const priceType = role === "B2B" ? "B2B" : "B2C"

    return product.prices?.[priceType] ?? product.price;

}