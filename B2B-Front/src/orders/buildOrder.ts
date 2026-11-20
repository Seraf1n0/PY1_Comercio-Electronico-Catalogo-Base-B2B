import type { AppUser, BranchId } from "../auth/types";
import type { CartItem } from "../cart/types";
import type { Buyer, Delivery, Order, OrderItem, CustomerType } from "./types";
import { getBranchInfo } from "../branch/branches";
import { getBranchStock } from "../inventory/inventoryOverrides";
import { meetsB2BMinimum } from "../cart/b2bEligibility";
import { getProductSubtotal, getIva, getOrderTotal } from "../cart/cartTotals";
import { getShippingCost } from "../cart/shipping";
import { getNextOrderNumber } from "./ordersStorage";
import { isValidPrice } from "../Catalog/pricing/priceView";
import { canBePurchasedBy, isValidLegalId } from "../Catalog/pricing/priceValidation";

export type OrderBuildErrorCode =
  | "INVALID_ROLE"
  | "MISSING_BRANCH"
  | "EMPTY_CART"
  | "B2B_MINIMUM_NOT_MET"
    | "B2B_COMPANY_MISSING"
  | "B2B_COMPANY_INVALID"
  | "INVALID_PRICE";

export class OrderBuildError extends Error {
  readonly code: OrderBuildErrorCode;

  constructor(code: OrderBuildErrorCode, message: string) {
    super(message);
    this.name = "OrderBuildError";
    this.code = code;
  }
}

export type BuildOrderInput = {
  user: AppUser | null;
  branchId: BranchId | null;
  buyer: Buyer;
  delivery: Delivery;
  items: CartItem[];
};

export function buildOrder(input: BuildOrderInput): Order {
  const { user, branchId, buyer, delivery, items } = input;

  if (!user || (user.role !== "B2C" && user.role !== "B2B")) {
    throw new OrderBuildError(
      "INVALID_ROLE",
      "La sesión no tiene un rol B2C o B2B válido.",
    );
  }

  if (!branchId) {
    throw new OrderBuildError(
      "MISSING_BRANCH",
      "No hay una sucursal seleccionada para la orden.",
    );
  }

  if (items.length === 0) {
    throw new OrderBuildError("EMPTY_CART", "El carrito está vacío.");
  }

  const isB2B = user.role === "B2B";

    // Condicion comercial: el B2B obtiene precio B2B solo con 4+ vehiculos;
  // con menos, la compra se permite con precio B2C.
  const pricingTier: CustomerType = isB2B && meetsB2BMinimum(items) ? "B2B" : "B2C";

  if (isB2B && !user.company) {
    throw new OrderBuildError(
      "B2B_COMPANY_MISSING",
      "La cuenta B2B no tiene una empresa registrada.",
    );
  }
  if (isB2B && user.company && (!user.company.name.trim() || !isValidLegalId(user.company.legalId))) {
    throw new OrderBuildError(
      "B2B_COMPANY_INVALID",
      "La información de la empresa (nombre o cédula jurídica) no es válida.",
    );
  }

  // Ultima barrera: nunca se genera una orden con un precio invalido o que
  // no corresponda a la tarifa del cliente.
  const invalidItem = items.find(
    (item) =>
      !isValidPrice(item.price) ||
      !canBePurchasedBy(item, user.role) ||
            (isB2B &&
        item.price !==
          (pricingTier === "B2B" ? item.prices?.B2B : (item.prices?.B2C ?? item.price))),
  );
  if (invalidItem) {
    throw new OrderBuildError(
      "INVALID_PRICE",
      `El producto ${invalidItem.title} no tiene un precio válido.`,
    );
  }
  
 

  const orderItems: OrderItem[] = items.map((item) => {
    const itemBranchId = item.branchId ?? branchId;

    return {
      productId: item.id,
      name: item.title,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotal: item.subtotal,
      category: item.category ?? "",
      brand: item.brand ?? "",
      priceTier: pricingTier,
      branch: { id: itemBranchId, name: getBranchInfo(itemBranchId).label },
      availableAtPurchase: item.stockByBranch
        ? getBranchStock(
            { objectID: item.id, stock: item.stockByBranch },
            itemBranchId,
          )
        : 0,
    };
  });

  const subtotal = getProductSubtotal(items);
  const iva = getIva(subtotal);
  const shippingCost = getShippingCost(items);
  const total = getOrderTotal(items);

  return {
    orderNumber: getNextOrderNumber(),
    date: new Date().toISOString(),
    buyer,
    delivery,
    subtotal,
    iva,
    shippingCost,
    total,
    orderStatus: "PENDING",
    paymentStatus: "PENDING",
    items: orderItems,
    termsAccepted: true,
    schemaVersion: 2,
    userId: user.objectID,
    userName: user.displayName,
    role: user.role,
        customerType: isB2B ? "B2B" : "B2C",
    company:
      isB2B && user.company
        ? { name: user.company.name, legalId: user.company.legalId }
        : undefined,
    pricingTier,
    branch: { id: branchId, name: getBranchInfo(branchId).label },
        appliedConditions: !isB2B
      ? []
      : pricingTier === "B2B"
        ? ["Precio B2B aplicado: 4 o más vehículos en la orden"]
        : ["Sin el mínimo de 4 vehículos: se aplicó precio B2C"],
    createdAtTs: Date.now(),
    syncStatus: "PENDING",
  };
}
