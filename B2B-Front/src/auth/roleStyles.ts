import type { Role } from "./types";

/** Texto y colores por rol, usados por RoleBadge y por la navegacion. */
export const roleBadgeText: Record<Role, string> = {
  B2C: "Cliente B2C",
  B2B: "Empresa B2B",
  ADMIN: "Administrador",
};

export const roleBadgeClass: Record<Role, string> = {
  B2C: "bg-sky-100 text-sky-800 ring-sky-200",
  B2B: "bg-violet-100 text-violet-800 ring-violet-200",
  ADMIN: "bg-amber-100 text-amber-800 ring-amber-300",
};

/** Texto de la tarifa de precio para cada tipo. */
export const tierLabel = {
  B2C: "Precio B2C",
  B2B: "Precio B2B",
} as const;



export const roleAccent: Record<Role, { avatar: string; bar: string; activeLink: string }> = {
  B2C: {
    avatar: "bg-sky-100 text-sky-800 ring-2 ring-sky-300",
    bar: "border-sky-200 bg-sky-50 text-sky-900",
    activeLink: "bg-sky-100 text-sky-800",
  },
  B2B: {
    avatar: "bg-violet-100 text-violet-800 ring-2 ring-violet-300",
    bar: "border-violet-200 bg-violet-50 text-violet-900",
    activeLink: "bg-violet-100 text-violet-800",
  },
  ADMIN: {
    avatar: "bg-amber-100 text-amber-800 ring-2 ring-amber-400",
    bar: "border-amber-300 bg-amber-50 text-amber-900",
    activeLink: "bg-amber-100 text-amber-800",
  },
};