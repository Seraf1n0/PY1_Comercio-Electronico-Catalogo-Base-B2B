import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { appendAudit, readAudit } from "../../admin/adminAudit";
import { stockByBranchWith } from "../../admin/productMetrics";
import { useAllProducts } from "../../admin/useAllProducts";
import type { BranchId } from "../../auth/types";
import { branches } from "../../branch/branches";
import type { Product } from "../../Catalog/types";
import Spinner from "../../components/Spinner";
import {
  readInventoryOverrides,
  resetOverrides,
  type InventoryOverrides,
} from "../../inventory/inventoryOverrides";
import { useAuth } from "../../auth/useAuth";
import AdminPageHeader from "./components/AdminPageHeader";
import AuditLog from "./components/AuditLog";
import InventoryAdjustDialog from "./components/InventoryAdjustDialog";

const PAGE_SIZE = 25;
const LOW_STOCK = 2;

type BranchFilter = "ALL" | BranchId;
type Availability = "ALL" | "OUT" | "LOW";

type Row = {
  product: Product;
  stock: Record<BranchId, number>;
  total: number;
};

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function matchesSearch(product: Product, query: string): boolean {
  if (!query) return true;
  const haystack = normalize(
    [product.objectID, product.title, product.brand, product.model, String(product.year)].join(" "),
  );
  return normalize(query)
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

/** Celda de stock: color segun disponibilidad y marca si tiene ajuste simulado. */
function StockCell({
  adjustment,
  value,
  highlighted,
}: {
  adjustment: number;
  value: number;
  highlighted: boolean;
}) {
  const color =
    value === 0
      ? "bg-red-50 text-red-600"
      : value <= LOW_STOCK
        ? "bg-amber-50 text-amber-700"
        : "text-slate-700";

  return (
    <td
      className={`px-2 py-2 text-center font-semibold ${color} ${
        highlighted ? "ring-2 ring-inset ring-amber-300" : ""
      }`}
      title={adjustment !== 0 ? `Base ${value - adjustment}, ajuste simulado ${adjustment > 0 ? "+" : ""}${adjustment}` : undefined}
    >
      {value === 0 ? "Sin stock" : value}
      {adjustment !== 0 && (
        <span className="ml-1 align-super text-[10px] font-bold text-violet-600">
          {adjustment > 0 ? `+${adjustment}` : adjustment}
        </span>
      )}
    </td>
  );
}

export default function AdminInventoryPage() {
  const { products, error, loading, reload } = useAllProducts();
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState<BranchFilter>("ALL");
  const [availability, setAvailability] = useState<Availability>("ALL");
  const [page, setPage] = useState(0);
  const { user } = useAuth();

  // Operacion simulada: los ajustes viven en localStorage. Se guarda una copia
  // en estado para recalcular la tabla cada vez que el admin modifica algo.
  const [overrides, setOverrides] = useState<InventoryOverrides>(() => readInventoryOverrides());
  const [audit, setAudit] = useState(() => readAudit());
  const [editing, setEditing] = useState<Product | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const refreshLocalState = () => {
    setOverrides(readInventoryOverrides());
    setAudit(readAudit());
  };

  const handleResetAll = () => {
    const adjusted = Object.keys(overrides).length;
    resetOverrides();
    appendAudit({
      type: "RESET",
      adminId: user?.objectID ?? "",
      adminName: user?.displayName ?? "Administrador",
      target: "Todo el inventario",
      field: "Ajustes de inventario",
      before: `${adjusted} productos ajustados`,
      after: "Stock base de Algolia",
    });
    refreshLocalState();
    setConfirmReset(false);
    setNotice("Se eliminaron todos los ajustes simulados. El inventario volvió al stock base de Algolia.");
  };

  // Inventario efectivo (base de Algolia + ajustes simulados) de todo el catalogo.
  const rows = useMemo<Row[]>(
    () =>
      products.map((product) => {
        const stock = stockByBranchWith(product, overrides);
        const total = Object.values(stock).reduce((sum, value) => sum + value, 0);
        return { product, stock, total };
      }),
    [products, overrides],
  );

  // Resumen por sucursal sobre TODO el catalogo (no solo la pagina visible).
  const summary = useMemo(
    () =>
      branches.map((branch) => ({
        ...branch,
        units: rows.reduce((sum, row) => sum + row.stock[branch.id], 0),
        outOfStock: rows.filter((row) => row.stock[branch.id] === 0).length,
      })),
    [rows],
  );

  const filtered = useMemo(() => {
    const valueFor = (row: Row) => (branchFilter === "ALL" ? row.total : row.stock[branchFilter]);
    return rows.filter((row) => {
      if (!matchesSearch(row.product, search.trim())) return false;
      if (availability === "OUT") return valueFor(row) === 0;
      if (availability === "LOW") return valueFor(row) > 0 && valueFor(row) <= LOW_STOCK;
      return true;
    });
  }, [rows, search, branchFilter, availability]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const scopeLabel =
    branchFilter === "ALL" ? "todas las sucursales" : branches.find((b) => b.id === branchFilter)?.label;

  const changeFilter = (apply: () => void) => {
    apply();
    setPage(0);
  };

  return (
    <>
      <AdminPageHeader
        title="Inventario por sucursal"
        description="Disponibilidad de cada producto en San José, Guanacaste y Limón. Incluye los ajustes simulados realizados por el administrador."
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                reload();
                refreshLocalState();
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 transition hover:bg-slate-50"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Actualizar
            </button>
            {Object.keys(overrides).length > 0 &&
              (confirmReset ? (
                <span className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-700 ring-1 ring-red-200">
                  ¿Quitar todos los ajustes?
                  <button type="button" onClick={handleResetAll} className="cursor-pointer font-semibold underline">
                    Sí
                  </button>
                  <button type="button" onClick={() => setConfirmReset(false)} className="cursor-pointer font-semibold">
                    No
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-50"
                >
                  Restablecer inventario ({Object.keys(overrides).length})
                </button>
              ))}
          </>
        }
      />

      {notice && (
        <div
          role="status"
          className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <span className="flex items-start gap-2">
            <CheckCircleIcon className="h-5 w-5 shrink-0" />
            {notice}
          </span>
          <button type="button" onClick={() => setNotice(null)} className="cursor-pointer font-semibold">
            Cerrar
          </button>
        </div>
      )}

      {/* Resumen por sucursal: tambien sirve como selector */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {summary.map((branch) => {
          const active = branchFilter === branch.id;
          return (
            <button
              key={branch.id}
              type="button"
              aria-pressed={active}
              onClick={() => changeFilter(() => setBranchFilter(active ? "ALL" : branch.id))}
              className={`cursor-pointer rounded-xl bg-white p-4 text-left shadow-sm ring-1 transition hover:ring-amber-400 ${
                active ? "ring-2 ring-amber-400" : "ring-slate-200"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sucursal {branch.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {loading ? "…" : branch.units.toLocaleString("es-CR")}
                <span className="ml-1 text-sm font-medium text-slate-500">unidades</span>
              </p>
              <p className={`text-xs font-semibold ${branch.outOfStock > 0 ? "text-red-600" : "text-emerald-600"}`}>
                {loading ? "" : `${branch.outOfStock} productos sin stock`}
              </p>
            </button>
          );
        })}
      </div>

      <section className="mb-4 grid gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => changeFilter(() => setSearch(event.target.value))}
            placeholder="Buscar por nombre, marca, modelo o código"
            aria-label="Buscar en el inventario"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
          Sucursal
          <select
            value={branchFilter}
            onChange={(event) => changeFilter(() => setBranchFilter(event.target.value as BranchFilter))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-normal text-slate-800 outline-none focus:border-amber-500"
          >
            <option value="ALL">Todas</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
          Disponibilidad
          <select
            value={availability}
            onChange={(event) => changeFilter(() => setAvailability(event.target.value as Availability))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-normal text-slate-800 outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos</option>
            <option value="OUT">Sin stock</option>
            <option value="LOW">Stock bajo (≤ {LOW_STOCK})</option>
          </select>
        </label>
      </section>

      <p className="mb-3 text-sm text-slate-600">
        {loading ? "Consultando…" : `${filtered.length} productos · disponibilidad en ${scopeLabel}`}
      </p>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error} Intenta actualizar en unos segundos.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <Spinner className="h-5 w-5 text-amber-500" />
          <span className="text-sm text-slate-500">Cargando inventario…</span>
        </div>
      ) : pageRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="font-semibold text-slate-800">No hay productos para mostrar</p>
          <p className="mt-1 text-sm text-slate-500">Prueba con otra búsqueda o cambia los filtros.</p>
        </div>
      ) : (
        <>
          {/* Escritorio: matriz producto x sucursal */}
          <section className="hidden overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3">Producto</th>
                  {branches.map((branch) => (
                    <th
                      key={branch.id}
                      className={`px-2 py-3 text-center ${branchFilter === branch.id ? "text-amber-700" : ""}`}
                    >
                      {branch.label}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center">Total</th>
                  <th className="px-3 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.map(({ product, stock, total }) => (
                  <tr key={product.objectID}>
                    <td className="px-3 py-2">
                      <Link
                        to={`/producto/${product.objectID}`}
                        className="font-semibold text-slate-800 hover:text-amber-700 hover:underline"
                      >
                        {product.title}
                      </Link>
                      <p className="text-xs text-slate-500">{product.objectID} · {product.brand} · {product.year}</p>
                    </td>
                    {branches.map((branch) => (
                      <StockCell
                        key={branch.id}
                        adjustment={overrides[product.objectID]?.[branch.id] ?? 0}
                        value={stock[branch.id]}
                        highlighted={branchFilter === branch.id}
                      />
                    ))}
                    <td className={`px-3 py-2 text-center font-bold ${total === 0 ? "text-red-600" : "text-slate-900"}`}>
                      {total}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => setEditing(product)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-300 hover:bg-amber-50"
                      >
                        <AdjustmentsHorizontalIcon className="h-4 w-4" />
                        Ajustar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Movil: tarjetas con las tres sucursales */}
          <ul className="space-y-3 md:hidden">
            {pageRows.map(({ product, stock, total }) => (
              <li key={product.objectID} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800">{product.title}</p>
                    <p className="text-xs text-slate-500">{product.objectID} · Total: {total}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing(product)}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-300"
                  >
                    <AdjustmentsHorizontalIcon className="h-4 w-4" />
                    Ajustar
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                  {branches.map((branch) => (
                    <div
                      key={branch.id}
                      className={`rounded-lg p-2 ${
                        stock[branch.id] === 0
                          ? "bg-red-50 text-red-600"
                          : stock[branch.id] <= LOW_STOCK
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-50 text-slate-700"
                      } ${branchFilter === branch.id ? "ring-2 ring-amber-300" : ""}`}
                    >
                      <p className="text-[11px] font-semibold uppercase">{branch.label}</p>
                      <p className="text-lg font-bold">{stock[branch.id]}</p>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-3" aria-label="Paginación del inventario">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
            className="flex cursor-pointer items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-4 w-4" /> Anterior
          </button>
          <span className="text-sm text-slate-600">
            Página {currentPage + 1} de {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage + 1 >= totalPages}
            onClick={() => setPage(currentPage + 1)}
            className="flex cursor-pointer items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente <ChevronRightIcon className="h-4 w-4" />
          </button>
        </nav>
      )}
      <AuditLog entries={audit} types={["INVENTORY", "RESET"]} title="Historial de ajustes de inventario" />

      {editing && (
        <InventoryAdjustDialog
          product={editing}
          initialBranch={branchFilter === "ALL" ? branches[0].id : branchFilter}
          onClose={() => setEditing(null)}
          onSaved={({ message }) => {
            setEditing(null);
            refreshLocalState();
            setNotice(message);
          }}
        />
      )}
    </>
  );
}