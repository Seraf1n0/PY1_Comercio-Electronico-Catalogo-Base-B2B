import type { Product, StockByHeadquarter } from "../Catalog/types";
import type { BranchId } from "../auth/types";
import { branches, getBranchInfo } from "../branch/branches";
import { readJSON, writeJSON, removeJSON } from "../lib/safeStorage";
import { storageKeys } from "../lib/storageKeys";

type InventoryOverrides = Record<string, Partial<Record<BranchId, number>>>;

type InventoryProduct = {
  objectID: string;
  stock?: StockByHeadquarter;
};

function isValidBranchId(value: string): value is BranchId {
  return branches.some((branch) => branch.id === value);
}

function readOverrides(): InventoryOverrides {
  const stored = readJSON<unknown>(storageKeys.inventoryOverrides, {});
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    return {};
  }

  const valid: InventoryOverrides = {};
  for (const [productId, branchAdjustments] of Object.entries(stored)) {
    if (!branchAdjustments || typeof branchAdjustments !== "object" || Array.isArray(branchAdjustments)) {
      continue;
    }

    const adjustments: Partial<Record<BranchId, number>> = {};
    for (const [branchId, amount] of Object.entries(branchAdjustments)) {
      if (isValidBranchId(branchId) && typeof amount === "number" && Number.isInteger(amount)) {
        adjustments[branchId] = amount;
      }
    }

    if (Object.keys(adjustments).length > 0) {
      valid[productId] = adjustments;
    }
  }

  return valid;
}

function getBaseStock(product: InventoryProduct, branchId: BranchId): number {
  if (!product.stock) return 0;

  const baseStock = product.stock[getBranchInfo(branchId).stockKey];
  return Number.isInteger(baseStock) && baseStock >= 0 ? baseStock : 0;
}

/** PAra devolver el stock simulado esto en panel de admin y catalogo, dealle,carrito */
export function getBranchStock(product: InventoryProduct, branchId: BranchId): number {
  const baseStock = getBaseStock(product, branchId);
  const adjustment = readOverrides()[product.objectID]?.[branchId] ?? 0;

  return Math.max(0, baseStock + adjustment);
}

/** añadir o quitar productos para el panel de admin*/
export function adjustBranchStock(
  product: Pick<Product, "objectID" | "stock">,
  branchId: BranchId,
  adjustment: number,
): boolean {
  if (!Number.isInteger(adjustment)) return false;

  const currentStock = getBranchStock(product, branchId);
  const nextStock = currentStock + adjustment;
  if (nextStock < 0) return false;

  const overrides = readOverrides();
  const baseStock = getBaseStock(product, branchId);
  const nextAdjustment = nextStock - baseStock;

  if (nextAdjustment === 0) {
    delete overrides[product.objectID]?.[branchId];
    if (overrides[product.objectID] && Object.keys(overrides[product.objectID]).length === 0) {
      delete overrides[product.objectID];
    }
  } else {
    overrides[product.objectID] = {
      ...overrides[product.objectID],
      [branchId]: nextAdjustment,
    };
  }

  return writeJSON(storageKeys.inventoryOverrides, overrides);
}

/** Devolvemos todo a su forma original igual para admin */
export function resetOverrides(): void {
  removeJSON(storageKeys.inventoryOverrides);
}

