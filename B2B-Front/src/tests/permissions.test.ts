import { describe, expect, it } from "vitest";
import { can, canAccessPath, homePathFor, PERMISSION_MATRIX, type Permission } from "../auth/permissions";
import type { Role } from "../auth/types";

/**
 * RBAC: la matriz debe coincidir con la tabla del enunciado
 * (✓ = tiene permiso, — = no lo tiene).
 */
const ENUNCIADO: Record<string, Record<Role, boolean>> = {
  "catalog.view": { B2C: true, B2B: true, ADMIN: true },
  "catalog.search": { B2C: true, B2B: true, ADMIN: true },
  "cart.add": { B2C: true, B2B: true, ADMIN: false },
  checkout: { B2C: true, B2B: true, ADMIN: false },
  "orders.own": { B2C: true, B2B: true, ADMIN: false },
  "orders.all": { B2C: false, B2B: false, ADMIN: true },
  "admin.view": { B2C: false, B2B: false, ADMIN: true },
  "admin.simulate": { B2C: false, B2B: false, ADMIN: true },
};

describe("RBAC - matriz de permisos", () => {
  for (const [permission, roles] of Object.entries(ENUNCIADO)) {
    for (const [role, expected] of Object.entries(roles)) {
      it(`${role} ${expected ? "puede" : "NO puede"}: ${permission}`, () => {
        expect(can(role as Role, permission as Permission)).toBe(expected);
      });
    }
  }

  it("niega todo a un rol desconocido, nulo o vacío (deny by default)", () => {
    for (const permission of Object.keys(PERMISSION_MATRIX) as Permission[]) {
      expect(can("SUPERVISOR", permission)).toBe(false);
      expect(can(null, permission)).toBe(false);
      expect(can(undefined, permission)).toBe(false);
      expect(can("", permission)).toBe(false);
    }
  });
});

describe("RBAC - rutas", () => {
  it("un cliente no puede entrar al panel administrativo", () => {
    expect(canAccessPath("B2C", "/admin")).toBe(false);
    expect(canAccessPath("B2B", "/admin/ordenes")).toBe(false);
  });

  it("el admin no puede entrar al carrito ni al checkout", () => {
    expect(canAccessPath("ADMIN", "/carrito")).toBe(false);
    expect(canAccessPath("ADMIN", "/finalizar-compra")).toBe(false);
    expect(canAccessPath("ADMIN", "/mis-ordenes")).toBe(false);
  });

  it("todos los roles validos pueden ver el catálogo", () => {
    for (const role of ["B2C", "B2B", "ADMIN"] as Role[]) {
      expect(canAccessPath(role, "/")).toBe(true);
      expect(canAccessPath(role, "/producto/prod001")).toBe(true);
    }
  });

  it("cada rol tiene su página de inicio", () => {
    expect(homePathFor("ADMIN")).toBe("/admin");
    expect(homePathFor("B2C")).toBe("/");
    expect(homePathFor("B2B")).toBe("/");
    expect(homePathFor("SUPERVISOR")).toBe("/login");
  });
});
