import { describe, expect, it } from "vitest";
import { discountPercent, validatePriceForm } from "../admin/priceRules";
import { validateStockInput } from "../admin/stockRules";
import { computeBranchStock } from "../inventory/inventoryOverrides";
import { resolveOrdersScope, buildOrdersFilter } from "../orders/ordersIndexService";
import type { AppUser } from "../auth/types";

describe("Operación simulada: modificar inventario", () => {
  it("acepta enteros entre 0 y 999", () => {
    expect(validateStockInput("0")).toBeNull();
    expect(validateStockInput("25")).toBeNull();
  });

  it("rechaza vacío, negativos, decimales y valores fuera de rango", () => {
    expect(validateStockInput("")).not.toBeNull();
    expect(validateStockInput("-1")).toMatch(/negativo/);
    expect(validateStockInput("2.5")).toMatch(/entero/);
    expect(validateStockInput("1000")).toMatch(/máxima/);
    expect(validateStockInput("abc")).not.toBeNull();
  });

  it("el stock efectivo es base + ajuste y nunca baja de 0", () => {
    const product = {
      objectID: "p1",
      stock: { headquarterSanJose: 3, headquarterGuanacaste: 4, headquarterLimon: 5 },
    };
    expect(computeBranchStock(product, "limon", {})).toBe(5);
    expect(computeBranchStock(product, "limon", { p1: { limon: 2 } })).toBe(7);
    expect(computeBranchStock(product, "limon", { p1: { limon: -9 } })).toBe(0);
  });
});

describe("Operación simulada: modificar precio", () => {
  it("acepta precios válidos con B2B menor o igual al B2C", () => {
    expect(validatePriceForm("100000", "90000")).toEqual({ errors: {}, b2c: 100_000, b2b: 90_000 });
  });

  it("rechaza un precio B2B mayor que el B2C", () => {
    expect(validatePriceForm("100", "120").errors.b2b).toMatch(/no puede ser mayor/);
  });

  it("rechaza precios vacíos, cero, negativos y con decimales", () => {
    expect(validatePriceForm("", "10").errors.b2c).toBeDefined();
    expect(validatePriceForm("0", "10").errors.b2c).toBeDefined();
    expect(validatePriceForm("100", "-1").errors.b2b).toBeDefined();
    expect(validatePriceForm("100", "9.5").errors.b2b).toMatch(/enteros/);
  });

  it("calcula el % de descuento B2B", () => {
    expect(discountPercent(10_440_000, 9_135_000)).toBe(12.5);
  });
});

describe("Consulta de órdenes: alcance por rol", () => {
  const client = { objectID: "usr-b2c", role: "B2C" } as AppUser;
  const admin = { objectID: "usr-admin", role: "ADMIN" } as AppUser;

  it("un cliente nunca puede ampliar su alcance a todas las órdenes", () => {
    expect(resolveOrdersScope(client, "all")).toBe("own");
    expect(buildOrdersFilter(client, { scope: "all" })).toBe('userId:"usr-b2c"');
  });

  it("el admin consulta todas las órdenes por defecto", () => {
    expect(resolveOrdersScope(admin)).toBe("all");
    expect(buildOrdersFilter(admin)).toBeUndefined();
  });
});
