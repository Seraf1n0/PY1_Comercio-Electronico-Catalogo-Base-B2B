import type { CartItem } from "./types";
import { getBranchInfo } from "../branch/branches";
import { getBranchStock } from "../inventory/inventoryOverrides";
import { getCartLineId } from "./types";

export interface CartInventoryIssue {
  itemId: string;
  message: string;
}

export function getCartInventoryIssues(items: CartItem[]): CartInventoryIssue[] {
  return items.flatMap((item) => {
    if (!item.branchId) {
      return [{ itemId: getCartLineId(item), message: `${item.title}: selecciona una sucursal.` }];
    }

    if (!item.stockByBranch) {
      return [{ itemId: getCartLineId(item), message: `${item.title}: no se pudo consultar el inventario. Vuelve a agregarlo al carrito.` }];
    }

    const available = getBranchStock(
      { objectID: item.id, stock: item.stockByBranch },
      item.branchId,
    );

    if (item.quantity <= available) return [];

    const branchName = getBranchInfo(item.branchId).label;
    return [{
      itemId: getCartLineId(item),
      message: available === 0
        ? `${item.title}: no hay unidades disponibles en ${branchName}.`
        : `${item.title}: solicitas ${item.quantity}, pero solo hay ${available} disponibles en ${branchName}.`,
    }];
  });
}
