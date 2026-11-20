import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useAlgoliaStatus } from "../lib/algoliaStatus";

/**
 * Aviso visible cuando la app esta en contingencia (Algolia no disponible).
 * Explica al usuario que esta viendo datos de respaldo y que puede faltar algo.
 * En movil se muestra una version corta para no ocupar media pantalla.
 */
export default function AlgoliaStatusBanner() {
  const { mode, reason } = useAlgoliaStatus();
  if (mode === "online") return null;

  return (
    <div
      role="status"
      title={reason ?? undefined}
      className="flex items-start justify-center gap-2 border-b border-amber-300 bg-amber-50 px-3 py-1.5 text-center text-xs text-amber-900 sm:sticky sm:top-0 sm:z-40 sm:py-2 sm:text-sm"
    >
      <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden="true" />
      <p className="sm:hidden">
        <strong>Modo de contingencia:</strong> búsqueda sin conexión, se usan datos de respaldo.
      </p>
      <p className="hidden sm:block">
        <strong>Modo de contingencia:</strong> el servicio de búsqueda no está disponible
        {reason ? ` (${reason.replace(/\.$/, "")})` : ""}. Se muestra el catálogo de respaldo;
        los precios e inventario pueden no estar actualizados y algunos filtros pueden ser limitados.
      </p>
    </div>
  );
}