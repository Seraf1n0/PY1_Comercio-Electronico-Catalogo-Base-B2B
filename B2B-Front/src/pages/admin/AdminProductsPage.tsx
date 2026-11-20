import {
  ArrowPathIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { appendAudit, readAudit } from "../../admin/adminAudit";
import { b2bDiscountPercent, stockByBranch, totalStock } from "../../admin/productMetrics";
import { useAdminProducts } from "../../admin/useAdminProducts";
import { branches } from "../../branch/branches";
import { formatColones } from "../../cart/cartTotals";
import { getPricingIssues, pricingIssueAdminText } from "../../Catalog/pricing/priceValidation";
import {
  applyPriceOverride,
  getPriceOverride,
  readPriceOverrides,
  resetPriceOverrides,
} from "../../Catalog/pricing/priceOverrides";
import { useAuth } from "../../auth/useAuth";
import type { Product } from "../../Catalog/types";
import Spinner from "../../components/Spinner";
import AdminPageHeader from "./components/AdminPageHeader";
import AuditLog from "./components/AuditLog";
import PriceEditDialog from "./components/PriceEditDialog";
import { getProductTitle } from "../../Catalog/productTitle";

const HITS_PER_PAGE = 25;

type StockFilter = "ALL" | "IN_STOCK" | "OUT_OF_STOCK" | "PRICE_ISSUES";

function formatPrice(value: number | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? formatColones(value) : "—";
}

function StockBadge({ total }: { total: number }) {
  if (total === 0) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        Agotado
      </span>
    );
  }
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        total <= 3 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {total} disponibles
    </span>
  );
}

/** Aviso de informacion comercial invalida (escenario de manejo de errores). */
function PricingIssues({ product }: { product: Product }) {
  const issues = getPricingIssues(product);
  if (issues.length === 0) return null;
  return (
    <p className="mt-1 inline-block rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-700">
      ⚠ {issues.map((code) => pricingIssueAdminText[code]).join(" · ")} · no se puede vender
    </p>
  );
}

/** Marca de precio modificado por el admin (operacion simulada). */
function ModifiedChip({ productId }: { productId: string }) {
  const override = getPriceOverride(productId);
  if (!override) return null;
  return (
    <span
      className="ml-1 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-violet-700"
      title={`Modificado por ${override.updatedBy} el ${new Date(override.updatedAt).toLocaleString("es-CR")}`}
    >
      Modificado
    </span>
  );
}

function EditPriceButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-300 hover:bg-amber-50"
    >
      <PencilSquareIcon className="h-4 w-4" />
      Editar precio
    </button>
  );
}

function ProductThumb({ product }: { product: Product }) {
  const src = product.images_urls?.[0];
  return src ? (
    <img
      src={src}
      alt=""
      loading="lazy"
      className="h-12 w-16 shrink-0 rounded-md bg-slate-100 object-cover"
    />
  ) : (
    <div className="h-12 w-16 shrink-0 rounded-md bg-slate-100" aria-hidden="true" />
  );
}

export default function AdminProductsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [stockFilter, setStockFilter] = useState<StockFilter>("ALL");
  const { user } = useAuth();

  // Operacion simulada de precios: estado local para refrescar la vista tras cada cambio.
  const [overrideCount, setOverrideCount] = useState(() => Object.keys(readPriceOverrides()).length);
  const [audit, setAudit] = useState(() => readAudit());
  const [editing, setEditing] = useState<Product | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const refreshLocalState = () => {
    setOverrideCount(Object.keys(readPriceOverrides()).length);
    setAudit(readAudit());
  };

  const handleResetPrices = () => {
    resetPriceOverrides();
    appendAudit({
      type: "RESET",
      adminId: user?.objectID ?? "",
      adminName: user?.displayName ?? "Administrador",
      target: "Todos los productos",
      field: "Precios modificados",
      before: `${overrideCount} productos con precio modificado`,
      after: "Precios originales de Algolia",
    });
    refreshLocalState();
    setConfirmReset(false);
    setNotice("Se restablecieron todos los precios a los valores originales de Algolia.");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { products, nbHits, nbPages, error, loading, reload } = useAdminProducts({
    query,
    page,
    hitsPerPage: HITS_PER_PAGE,
  });


  const visible = (() => {
    if (stockFilter === "ALL") return products;
    if (stockFilter === "PRICE_ISSUES") {
      return products.filter((product) => getPricingIssues(product).length > 0);
    }
    return products.filter((product) =>
      stockFilter === "IN_STOCK" ? totalStock(product) > 0 : totalStock(product) === 0,
    );
  })();

  return (
    <>
      <AdminPageHeader
        title="Productos"
        description="Información del catálogo desde el índice de productos de Algolia: precios por tipo de cliente y disponibilidad total."
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
            {overrideCount > 0 &&
              (confirmReset ? (
                <span className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-700 ring-1 ring-red-200">
                  ¿Restablecer todos los precios?
                  <button type="button" onClick={handleResetPrices} className="cursor-pointer font-semibold underline">
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
                  Restablecer precios ({overrideCount})
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

      <section className="mb-4 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar por nombre, marca, modelo o código"
            aria-label="Buscar productos"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
          Disponibilidad
          <select
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value as StockFilter)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          >
            <option value="ALL">Todos</option>
            <option value="IN_STOCK">Con stock</option>
            <option value="OUT_OF_STOCK">Agotados</option>
            <option value="PRICE_ISSUES">Con precio inválido</option>
          </select>
        </label>
      </section>

      <p className="mb-3 text-sm text-slate-600">
        {loading ? "Consultando…" : `${nbHits} productos en el índice`}
        {stockFilter !== "ALL" && !loading && ` · ${visible.length} en esta página con el filtro`}
      </p>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error} Intenta actualizar en unos segundos.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <Spinner className="h-5 w-5 text-amber-500" />
          <span className="text-sm text-slate-500">Cargando productos…</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="font-semibold text-slate-800">No hay productos para mostrar</p>
          <p className="mt-1 text-sm text-slate-500">Prueba con otra búsqueda o quita el filtro.</p>
        </div>
      ) : (
        <>
          {/* Escritorio: tabla */}
          <section className="hidden overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
            <table className="w-full min-w-[60rem] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3">Producto</th>
                  <th className="px-3 py-3">Categoría</th>
                  <th className="px-3 py-3 text-right">Precio B2C</th>
                  <th className="px-3 py-3 text-right">Precio B2B</th>
                  <th className="px-3 py-3 text-right">Desc. B2B</th>
                  {branches.map((branch) => (
                    <th key={branch.id} className="px-2 py-3 text-center">{branch.label}</th>
                  ))}
                  <th className="px-3 py-3">Stock total</th>
                  <th className="px-3 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((product) => {
                  const byBranch = stockByBranch(product);
                  const total = totalStock(product);
                  const discount = b2bDiscountPercent(product);
                  const effective = applyPriceOverride(product);
                  return (
                    <tr key={product.objectID} className="hover:bg-amber-50/40">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <ProductThumb product={product} />
                          <div className="min-w-0">
                            <Link
                              to={`/producto/${product.objectID}`}
                              className="font-semibold text-slate-800 hover:text-amber-700 hover:underline"
                            >
                              {getProductTitle(product)}
                            </Link>
                            <p className="text-xs text-slate-500">
                              {product.brand} · {product.model} · {product.year} · {product.objectID}
                            </p>
                            <PricingIssues product={product} />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{product.categories?.[0] ?? "—"}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-slate-800">
                        {formatPrice(effective.prices?.B2C ?? effective.price)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-violet-700">
                        {formatPrice(effective.prices?.B2B)}
                        <ModifiedChip productId={product.objectID} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-slate-600">
                        {discount === null ? "—" : `${discount}%`}
                      </td>
                      {branches.map((branch) => (
                        <td
                          key={branch.id}
                          className={`px-2 py-2 text-center font-medium ${
                            byBranch[branch.id] === 0 ? "text-red-500" : "text-slate-700"
                          }`}
                        >
                          {byBranch[branch.id]}
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        <StockBadge total={total} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <EditPriceButton onClick={() => setEditing(product)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Movil: tarjetas */}
          <ul className="space-y-3 md:hidden">
            {visible.map((product) => {
              const total = totalStock(product);
              const discount = b2bDiscountPercent(product);
              const effective = applyPriceOverride(product);
              return (
                <li key={product.objectID} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="flex gap-3">
                    <ProductThumb product={product} />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/producto/${product.objectID}`}
                        className="font-semibold text-slate-800 hover:text-amber-700"
                      >
                        {getProductTitle(product)}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {product.brand} · {product.year} · {product.objectID}
                      </p>
                      <PricingIssues product={product} />
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">Precio B2C</dt>
                      <dd className="font-medium text-slate-800">{formatPrice(effective.prices?.B2C ?? effective.price)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">
                        Precio B2B {discount !== null && `(-${discount}%)`}
                      </dt>
                      <dd className="font-semibold text-violet-700">
                        {formatPrice(effective.prices?.B2B)}
                        <ModifiedChip productId={product.objectID} />
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <StockBadge total={total} />
                    <EditPriceButton onClick={() => setEditing(product)} />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {nbPages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-3" aria-label="Paginación de productos">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            className="flex cursor-pointer items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-4 w-4" /> Anterior
          </button>
          <span className="text-sm text-slate-600">
            Página {page + 1} de {nbPages}
          </span>
          <button
            type="button"
            disabled={page + 1 >= nbPages}
            onClick={() => setPage((current) => current + 1)}
            className="flex cursor-pointer items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente <ChevronRightIcon className="h-4 w-4" />
          </button>
        </nav>
      )}

      <AuditLog entries={audit} types={["PRICE", "RESET"]} title="Historial de cambios de precio" />

      {editing && (
        <PriceEditDialog
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null);
            refreshLocalState();
            setNotice(message);
          }}
        />
      )}
    </>
  );
}