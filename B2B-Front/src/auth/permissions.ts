import type { Role } from "./types";
import { isRole } from "./UserRecord";


export type Permission =
  | "catalog.view"      // Consultar catalogo
  | "catalog.search"    // Buscar productos
  | "cart.add"          // Agregar productos al carrito
  | "checkout"          // Checkout y pago
  | "orders.own"        // Consultar ordenes propias
  | "orders.all"        // Consultar todas las ordenes
  | "admin.view"        // Consultar informacion administrativa
  | "admin.simulate"    // Administracion simulada
  | "analytics.view";   // Analytics del proyecto II

export const PERMISSION_MATRIX: Record<Permission, readonly Role[]> = {
  "catalog.view": ["B2C", "B2B", "ADMIN"],
  "catalog.search": ["B2C", "B2B", "ADMIN"],
  "cart.add": ["B2C", "B2B"],
  checkout: ["B2C", "B2B"],
  "orders.own": ["B2C", "B2B"],
  "orders.all": ["ADMIN"],
  "admin.view": ["ADMIN"],
  "admin.simulate": ["ADMIN"],
  "analytics.view": ["B2C", "B2B", "ADMIN"],
};

/** Descripcion de cada permiso */
export const permissionLabels: Record<Permission, string> = {
  "catalog.view": "Consultar catálogo",
  "catalog.search": "Buscar productos",
  "cart.add": "Agregar productos al carrito",
  checkout: "Realizar el checkout",
  "orders.own": "Consultar órdenes propias",
  "orders.all": "Consultar todas las órdenes",
  "admin.view": "Consultar información administrativa",
  "admin.simulate": "Realizar administración simulada",
  "analytics.view": "Consultar analytics",
};

/**
 * Rol
 */
export function can(
  role: Role | string | null | undefined,
  permission: Permission,
): boolean {
  if (!isRole(role)) return false;
  return PERMISSION_MATRIX[permission]?.includes(role) ?? false;
}

/** True si el rol tiene TODOS los permisos indicados */
export function canAll(
  role: Role | string | null | undefined,
  permissions: readonly Permission[],
): boolean {
  return permissions.length > 0 && permissions.every((p) => can(role, p));
}

/** Pagina de inicio segun el rol */
export function homePathFor(role: Role | string | null | undefined): string {
  if (!isRole(role)) return "/login";
   return role === "ADMIN" ? "/admin" : "/"; 
}

/**
 * Rutas protegidas y el permiso que exigen. Sirve para validar el
 * `from` del login: si el destino no esta permitido, se va al inicio.
 */
const ROUTE_PERMISSIONS: { prefix: string; permission: Permission }[] = [
  { prefix: "/admin", permission: "admin.view" },
  { prefix: "/carrito", permission: "cart.add" },
  { prefix: "/finalizar-compra", permission: "checkout" },
  { prefix: "/pago", permission: "checkout" },
  { prefix: "/confirmacion", permission: "checkout" },
  { prefix: "/mis-ordenes", permission: "orders.own" },
  { prefix: "/analytics", permission: "analytics.view" },
];

export function canAccessPath(
  role: Role | string | null | undefined,
  pathname: string,
): boolean {
  const rule = ROUTE_PERMISSIONS.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return rule ? can(role, rule.permission) : isRole(role);
}