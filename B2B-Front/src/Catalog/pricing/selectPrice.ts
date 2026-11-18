import type { Product } from "../types";
import type { Role } from "../../auth/types";
import { getPriceView } from "./priceView";

export function selectPrice(product: Product, role: Role): number | null {
    const tier = role === "B2B" ? "B2B" : "B2C";
    const view = getPriceView(product, role === "ADMIN" ? "B2C" : role, tier);
    return view.status === "ok" ? view.amount : null;
}