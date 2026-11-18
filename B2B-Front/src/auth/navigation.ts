import {
  ChartBarIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import { can, type Permission } from "./permissions";
import type { Role } from "./types";

export type NavItem = {
  to: string;
  label: string;
  permission: Permission;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Estilo destacado (ej. acceso al panel admin). */
  highlight?: boolean;
};


export const NAV_ITEMS: NavItem[] = [
  { to: "/admin", label: "Panel admin", permission: "admin.view", icon: ShieldCheckIcon, highlight: true },
  { to: "/mis-ordenes", label: "Mis órdenes", permission: "orders.own", icon: ShoppingBagIcon },
  { to: "/analytics", label: "Analytics", permission: "analytics.view", icon: ChartBarIcon },
];

export function navItemsFor(role: Role | string | null | undefined): NavItem[] {
  return NAV_ITEMS.filter((item) => can(role, item.permission));
}