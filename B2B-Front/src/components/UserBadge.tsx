import { ArrowRightOnRectangleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navItemsFor } from "../auth/navigation";
import { roleAccent } from "../auth/roleStyles";
import { useAuth } from "../auth/useAuth";
import RoleBadge from "./RoleBadge";

function getInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "U";
}


export default function UserBadge() {
  const { user, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const [openedAt, setOpenedAt] = useState(pathname);

  // Al cambiar de pagina se cierra el desplegable (sin efecto: se compara en render).
  if (open && openedAt !== pathname) {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user || !role) {
    return null;
  }

  const accent = roleAccent[role];
  const items = navItemsFor(role);

  const linkClass = (highlight?: boolean) => ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-semibold transition hover:bg-slate-100 ${
      isActive
        ? accent.activeLink
        : highlight
          ? "text-amber-700 ring-1 ring-amber-300"
          : "text-slate-600"
    }`;

  const avatar = (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${accent.avatar}`}
    >
      {getInitials(user.displayName)}
    </span>
  );

  return (
    <div ref={containerRef} className="relative flex items-center gap-1 sm:gap-2">
      {/* Movil: avatar que abre el menu */}
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setOpenedAt(pathname);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menú de ${user.displayName}`}
        className="flex cursor-pointer items-center gap-0.5 rounded-full sm:hidden"
      >
        {avatar}
        <ChevronDownIcon className={`h-4 w-4 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Escritorio/tablet: avatar + datos + enlaces en linea */}
      <span className="hidden sm:block" title={`${user.displayName} · ${role}`}>
        {avatar}
      </span>
      <div className="hidden min-w-0 text-left sm:block">
        <p className="truncate text-sm font-semibold text-slate-800">{user.displayName}</p>
        <div className="flex items-center gap-1">
          <RoleBadge role={role} size="xs" />
          {user.company && (
            <span className="truncate text-xs text-slate-500">{user.company.name}</span>
          )}
        </div>
      </div>

      <nav aria-label="Menú de usuario" className="hidden items-center gap-1 sm:flex">
        {items.map(({ to, label, icon: Icon, highlight }) => (
          <NavLink key={to} to={to} title={label} aria-label={label} className={linkClass(highlight)}>
            <Icon className="h-5 w-5" />
            <span className="hidden lg:inline">{label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={logout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="hidden lg:inline">Salir</span>
        </button>
      </nav>

      {/* Desplegable movil: ocupa el ancho de la pantalla bajo el encabezado */}
      {open && (
        <div
          role="menu"
          className="fixed inset-x-3 top-16 z-50 rounded-xl bg-white p-3 text-left shadow-xl ring-1 ring-slate-200 sm:hidden animate-fade-in"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            {avatar}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{user.displayName}</p>
              <div className="flex flex-wrap items-center gap-1">
                <RoleBadge role={role} size="xs" />
                {user.company && <span className="text-xs text-slate-500">{user.company.name}</span>}
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            {items.map(({ to, label, icon: Icon, highlight }) => (
              <NavLink
                key={to}
                to={to}
                role="menuitem"
                className={(state) => `${linkClass(highlight)(state)} px-3 py-2 text-sm`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}