import type { Product } from "../Catalog/types";
import { branches } from "../branch/branches";
import {
  computeBranchStock,
  getBranchStock,
  type InventoryOverrides,
} from "../inventory/inventoryOverrides";
import type { BranchId } from "../auth/types";
import { applyPriceOverride } from "../Catalog/pricing/priceOverrides";

/** Stock por sucursal ya con los ajustes simulados del admin aplicados. */
export function stockByBranch(product: Product): Record<BranchId, number> {
  return Object.fromEntries(
    branches.map((branch) => [branch.id, getBranchStock(product, branch.id)]),
  ) as Record<BranchId, number>;
}

export function totalStock(product: Product): number {
  return Object.values(stockByBranch(product)).reduce((sum, value) => sum + value, 0);
}

/** Descuento B2B respecto al B2C en porcentaje (null si no se puede calcular). */
export function b2bDiscountPercent(original: Product): number | null {
  const product = applyPriceOverride(original);
  const b2c = product.prices?.B2C;
  const b2b = product.prices?.B2B;
  if (typeof b2c !== "number" || typeof b2b !== "number" || b2c <= 0) return null;
  return Math.round(((b2c - b2b) / b2c) * 1000) / 10;
}


/** Igual que stockByBranch pero con una copia de ajustes ya leida (vista de inventario). */
export function stockByBranchWith(
  product: Product,
  overrides: InventoryOverrides,
): Record<BranchId, number> {
  return Object.fromEntries(
    branches.map((branch) => [branch.id, computeBranchStock(product, branch.id, overrides)]),
  ) as Record<BranchId, number>;
}