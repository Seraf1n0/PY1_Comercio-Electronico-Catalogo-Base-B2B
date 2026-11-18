import {
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import AdminPageHeader from "./components/AdminPageHeader";

const SECTIONS = [
  {
    to: "/admin/ordenes",
    title: "Órdenes",
    text: "Consulta todas las órdenes generadas por clientes B2C y B2B.",
    icon: ClipboardDocumentListIcon,
  },
  {
    to: "/admin/productos",
    title: "Productos",
    text: "Revisa el catálogo con sus precios B2C y B2B. Simula cambios de precio.",
    icon: CubeIcon,
  },
  {
    to: "/admin/inventario",
    title: "Inventario",
    text: "Consulta la disponibilidad por sucursal. Simula ajustes de inventario.",
    icon: ArchiveBoxIcon,
  },
];

export default function AdminHomePage() {
  const { user } = useAuth();

  return (
    <>
      <AdminPageHeader
        title={`Hola, ${user?.displayName ?? "administrador"}`}
        description="Desde aquí puedes consultar la información administrativa de la tienda. Las modificaciones son simuladas y se guardan solo en este navegador."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(({ to, title, text, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-amber-400"
          >
            <Icon className="h-8 w-8 text-slate-700 group-hover:text-amber-500" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
          </Link>
        ))}
      </div>
    </>
  );
}