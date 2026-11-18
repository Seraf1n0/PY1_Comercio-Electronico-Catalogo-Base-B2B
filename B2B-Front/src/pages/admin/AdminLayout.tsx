import {
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import RoleBadge from "../../components/RoleBadge";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
};


const NAV_ITEMS: NavItem[] = [
  { to: "/admin", label: "Resumen", icon: Squares2X2Icon, end: true },
  { to: "/admin/ordenes", label: "Órdenes", icon: ClipboardDocumentListIcon },
  { to: "/admin/productos", label: "Productos", icon: CubeIcon },
  { to: "/admin/inventario", label: "Inventario", icon: ArchiveBoxIcon },
];

function navClass({ isActive }: { isActive: boolean }) {
  // Movil: icono arriba y texto abajo (las 4 pestañas caben sin desplazarse).
  // Escritorio: icono y texto en linea.
  return `flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] font-semibold transition sm:flex-row sm:gap-2 sm:px-3 sm:py-2 sm:text-sm ${
    isActive
      ? "bg-amber-400 text-slate-900"
      : "text-slate-300 hover:bg-slate-800 hover:text-white"
  }`;
}

function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "A"
  );
}


export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <ShieldCheckIcon className="h-7 w-7 shrink-0 text-amber-400" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-base font-bold leading-tight sm:text-lg">Bombocars</p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-amber-400 sm:text-xs">
                Panel administrativo
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            {user && (
              <div className="flex items-center gap-2" title={user.displayName}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800 ring-2 ring-amber-400">
                  {getInitials(user.displayName)}
                </span>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold leading-tight">{user.displayName}</p>
                  <RoleBadge role="ADMIN" size="xs" />
                </div>
              </div>
            )}
            <Link
              to="/"
              title="Ver catálogo"
              aria-label="Ver catálogo"
              className="flex items-center gap-1 rounded-lg p-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white sm:px-3"
            >
              <BuildingStorefrontIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Ver catálogo</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="flex cursor-pointer items-center gap-1 rounded-lg p-2 text-xs font-semibold text-slate-300 transition hover:bg-red-900/40 hover:text-white sm:px-3"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        <nav aria-label="Secciones del panel administrativo" className="border-t border-slate-800">
          <ul className="mx-auto grid max-w-7xl grid-cols-4 gap-1 px-2 py-2 sm:flex sm:px-6">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={navClass}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-6 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}