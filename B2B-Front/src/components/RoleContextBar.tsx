import { BuildingOffice2Icon, ShieldCheckIcon, UserIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import { roleAccent } from "../auth/roleStyles";
import { useAuth } from "../auth/useAuth";
import { B2B_MINIMUM_VEHICLES } from "../cart/b2bEligibility";


export default function RoleContextBar() {
  const { user, role } = useAuth();
  const { pathname } = useLocation();

  if (!user || !role || pathname === "/login" || pathname.startsWith("/admin")) {
    return null;
  }

  const accent = roleAccent[role];

  return (
    <div role="note" className={`border-b px-4 py-1.5 text-xs sm:text-sm ${accent.bar}`}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
        {role === "B2C" && (
          <>
            <UserIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Comprando como <strong>cliente</strong> · Precios <strong>B2C</strong> · Compra desde 1 unidad
            </span>
          </>
        )}

        {role === "B2B" && (
          <>
            <BuildingOffice2Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Comprando como <strong>{user.company?.name ?? "empresa"}</strong> · Precios{" "}
              <strong>B2B</strong> · Mínimo {B2B_MINIMUM_VEHICLES} vehículos por orden
            </span>
          </>
        )}

        {role === "ADMIN" && (
          <>
            <ShieldCheckIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              <strong>Vista de administrador:</strong> consulta del catálogo, sin compras.
            </span>
            <Link to="/admin" className="font-semibold underline underline-offset-2 hover:no-underline">
              Ir al panel administrativo
            </Link>
          </>
        )}
      </div>
    </div>
  );
}