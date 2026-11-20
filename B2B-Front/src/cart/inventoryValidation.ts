import type { CartItem } from "./types";
import { getBranchInfo } from "../branch/branches";
import { getBranchStock } from "../inventory/inventoryOverrides";
import { getCartLineId } from "./types";
import type { Role } from "../auth/types";
import { isValidPrice } from "../Catalog/pricing/priceView";
import { canBePurchasedBy } from "../Catalog/pricing/priceValidation";


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


/**
 * Lineas del carrito con precio o informacion comercial invalida
 */
export function getCartPricingIssues(items: CartItem[], role: Role | null): CartInventoryIssue[] {
  return items.flatMap((item) => {
    const lineOk =
      isValidPrice(item.price) &&
      Number.isFinite(item.subtotal) &&
      canBePurchasedBy(item, role);
    return lineOk
      ? []
      : [{
          itemId: `${getCartLineId(item)}:price`,
          message: `${item.title}: el precio no es válido en este momento. Elimínalo del carrito para continuar.`,
        }];
  });
}

/** Todo lo que impide continuar con la compra: inventario y precios. */
export function getCartIssues(items: CartItem[], role: Role | null): CartInventoryIssue[] {
  return [...getCartInventoryIssues(items), ...getCartPricingIssues(items, role)];
}
