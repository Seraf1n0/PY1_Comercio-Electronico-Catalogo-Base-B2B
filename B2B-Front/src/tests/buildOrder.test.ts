import { describe, expect, it } from "vitest";
import type { AppUser } from "../auth/types";
import type { CartItem } from "../cart/types";
import { buildOrder, OrderBuildError, type OrderBuildErrorCode } from "../orders/buildOrder";

const b2c: AppUser = {
  objectID: "usr-b2c",
  username: "cliente",
  email: "c@demo.cr",
  displayName: "Laura Mora",
  phone: "88888888",
  role: "B2C",
  active: true,
  defaultBranch: "san_jose",
};
const b2b: AppUser = {
  ...b2c,
  objectID: "usr-b2b",
  role: "B2B",
  company: { name: "Transportes Demo S.A.", legalId: "3-101-123456", contactName: "Carlos" },
};
const admin: AppUser = { ...b2c, objectID: "usr-admin", role: "ADMIN" };

const stock = { headquarterSanJose: 10, headquarterGuanacaste: 10, headquarterLimon: 10 };
function line(quantity: number, price: number, prices = { B2C: 100_000, B2B: 90_000 }): CartItem {
  return {
    id: "prod001",
    title: "Toyota Corolla",
    price,
    prices,
    quantity,
    img: "",
    stock: 30,
    stockByBranch: stock,
    branchId: "san_jose",
    subtotal: price * quantity,
  };
}

const buyer = { name: "Laura", lastName: "Mora", email: "c@demo.cr", phone: "88888888" };
const delivery = { address: "San José centro, 100 m norte", province: "San José", canton: "Central", additionalAddress: null };

function errorCode(fn: () => unknown): OrderBuildErrorCode | null {
  try {
    fn();
    return null;
  } catch (error) {
    return error instanceof OrderBuildError ? error.code : null;
  }
}

describe("Generación de la orden", () => {
  it("genera una orden B2C con usuario, rol, sucursal y precio aplicado", () => {
    const order = buildOrder({ user: b2c, branchId: "san_jose", buyer, delivery, items: [line(1, 100_000)] });
    expect(order.role).toBe("B2C");
    expect(order.pricingTier).toBe("B2C");
    expect(order.branch.id).toBe("san_jose");
    expect(order.items[0].unitPrice).toBe(100_000);
    expect(order.orderStatus).toBe("PENDING");
    expect(order.paymentStatus).toBe("PENDING");
    expect(order.company).toBeUndefined();
  });

  it("genera una orden B2B con empresa y condición comercial aplicada", () => {
    const order = buildOrder({ user: b2b, branchId: "san_jose", buyer, delivery, items: [line(4, 90_000)] });
    expect(order.pricingTier).toBe("B2B");
    expect(order.company?.name).toBe("Transportes Demo S.A.");
    expect(order.items[0].unitPrice).toBe(90_000);
    expect(order.appliedConditions.length).toBeGreaterThan(0);
  });

    it("B2B con menos de 4 vehículos compra con precio B2C", () => {
    const order = buildOrder({ user: b2b, branchId: "san_jose", buyer, delivery, items: [line(3, 100_000)] });
    expect(order.customerType).toBe("B2B");
    expect(order.pricingTier).toBe("B2C");
    expect(order.items[0].unitPrice).toBe(100_000);
    expect(order.company?.name).toBe("Transportes Demo S.A.");
  });

  it("impide la orden B2B con menos de 4 vehículos si se intenta cobrar precio B2B", () => {
    expect(errorCode(() => buildOrder({ user: b2b, branchId: "san_jose", buyer, delivery, items: [line(3, 90_000)] })))
      .toBe("INVALID_PRICE");
  });

  it("impide la orden B2B con 4 o más vehículos si el precio no es el B2B", () => {
    expect(errorCode(() => buildOrder({ user: b2b, branchId: "san_jose", buyer, delivery, items: [line(4, 100_000)] })))
      .toBe("INVALID_PRICE");
  });

  it("impide la orden con un precio inválido", () => {
    expect(errorCode(() => buildOrder({ user: b2c, branchId: "san_jose", buyer, delivery, items: [line(1, 0)] })))
      .toBe("INVALID_PRICE");
  });

  it("impide la orden B2B si la cédula jurídica es inválida", () => {
    const badCompany = { ...b2b, company: { ...b2b.company!, legalId: "123" } };
    expect(errorCode(() => buildOrder({ user: badCompany, branchId: "san_jose", buyer, delivery, items: [line(4, 90_000)] })))
      .toBe("B2B_COMPANY_INVALID");
  });

  it("impide comprar al administrador, sin sucursal o con carrito vacío", () => {
    expect(errorCode(() => buildOrder({ user: admin, branchId: "san_jose", buyer, delivery, items: [line(1, 100_000)] })))
      .toBe("INVALID_ROLE");
    expect(errorCode(() => buildOrder({ user: b2c, branchId: null, buyer, delivery, items: [line(1, 100_000)] })))
      .toBe("MISSING_BRANCH");
    expect(errorCode(() => buildOrder({ user: b2c, branchId: "san_jose", buyer, delivery, items: [] })))
      .toBe("EMPTY_CART");
  });
});
