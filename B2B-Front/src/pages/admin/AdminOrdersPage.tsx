import {
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { branches } from "../../branch/branches";
import { formatColones } from "../../cart/cartTotals";
import Spinner from "../../components/Spinner";
import {
  CUSTOMER_TYPE_LABEL,
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  customerTypeClass,
  formatOrderDate,
  orderBranchName,
  orderClientName,
  orderStatusClass,
  paymentStatusClass,
} from "../../orders/orderLabels";
import type { CustomerType, Order } from "../../orders/types";
import { useOrdersSearch } from "../../orders/useOrdersSearch";
import AdminPageHeader from "./components/AdminPageHeader";

const HITS_PER_PAGE = 50;

type Filters = {
  customerType: "ALL" | CustomerType;
  branch: "ALL" | string;
  orderStatus: "ALL" | Order["orderStatus"];
  paymentStatus: "ALL" | Order["paymentStatus"];
};

const EMPTY_FILTERS: Filters = {
  customerType: "ALL",
  branch: "ALL",
  orderStatus: "ALL",
  paymentStatus: "ALL",
};

/**
 * Los filtros se aplican en el navegador sobre la pagina cargada para no
 * depender de que el indice `orders` tenga attributesForFaceting configurado.
 * La busqueda de texto si va a Algolia.
 */
function applyFilters(orders: Order[], filters: Filters): Order[] {
  return orders.filter(
    (order) =>
      (filters.customerType === "ALL" || order.customerType === filters.customerType) &&
      (filters.branch === "ALL" || order.branch?.id === filters.branch) &&
      (filters.orderStatus === "ALL" || order.orderStatus === filters.orderStatus) &&
      (filters.paymentStatus === "ALL" || order.paymentStatus === filters.paymentStatus),
  );
}

function Badge({ className, children }: { className: string; children: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-normal text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AdminOrdersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  // solo se consulta Algolia cuando el admin deja de escribir.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  
  const { orders, loading, error, nbPages, nbHits, reload } = useOrdersSearch({
    query,
    page,
    hitsPerPage: HITS_PER_PAGE,
    scope: "all",
  });

  const visible = useMemo(() => applyFilters(orders, filters), [orders, filters]);
  const hasFilters = Object.values(filters).some((value) => value !== "ALL");

  const stats = useMemo(() => {
    const b2b = visible.filter((order) => order.customerType === "B2B").length;
    const confirmedTotal = visible
      .filter((order) => order.orderStatus === "CONFIRMED")
      .reduce((sum, order) => sum + (Number.isFinite(order.total) ? order.total : 0), 0);
    return { b2b, b2c: visible.length - b2b, confirmedTotal };
  }, [visible]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));

  return (
    <>
      <AdminPageHeader
        title="Órdenes"
        description="Todas las órdenes generadas por clientes B2C y B2B, consultadas desde el índice de órdenes de Algolia."
        actions={
          <button
            type="button"
            onClick={reload}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 transition hover:bg-slate-50"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Actualizar
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Órdenes en el índice" value={nbHits} />
        <StatCard label="Clientes B2C (vista)" value={stats.b2c} />
        <StatCard label="Empresas B2B (vista)" value={stats.b2b} />
        <StatCard label="Confirmado (vista)" value={formatColones(stats.confirmedTotal)} />
      </div>

      <section className="mb-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar por número de orden, cliente o empresa"
            aria-label="Buscar órdenes"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <SelectFilter
            label="Tipo de cliente"
            value={filters.customerType}
            onChange={(value) => updateFilter("customerType", value as Filters["customerType"])}
            options={[
              { value: "ALL", label: "Todos" },
              { value: "B2C", label: "B2C · Cliente" },
              { value: "B2B", label: "B2B · Empresa" },
            ]}
          />
          <SelectFilter
            label="Sucursal"
            value={filters.branch}
            onChange={(value) => updateFilter("branch", value)}
            options={[
              { value: "ALL", label: "Todas" },
              ...branches.map((branch) => ({ value: branch.id, label: branch.label })),
            ]}
          />
          <SelectFilter
            label="Estado de la orden"
            value={filters.orderStatus}
            onChange={(value) => updateFilter("orderStatus", value as Filters["orderStatus"])}
            options={[
              { value: "ALL", label: "Todos" },
              ...Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => ({ value, label })),
            ]}
          />
          <SelectFilter
            label="Estado del pago"
            value={filters.paymentStatus}
            onChange={(value) => updateFilter("paymentStatus", value as Filters["paymentStatus"])}
            options={[
              { value: "ALL", label: "Todos" },
              ...Object.entries(PAYMENT_STATUS_LABEL).map(([value, label]) => ({ value, label })),
            ]}
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="mt-3 cursor-pointer text-xs font-semibold text-amber-700 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </section>

      {error && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {error} Se muestran solo las órdenes guardadas en este navegador.
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <Spinner className="h-5 w-5 text-amber-500" />
          <span className="text-sm text-slate-500">Cargando órdenes…</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="font-semibold text-slate-800">No hay órdenes para mostrar</p>
          <p className="mt-1 text-sm text-slate-500">
            {query || hasFilters
              ? "Ninguna orden coincide con la búsqueda o los filtros."
              : "Todavía no se han generado órdenes."}
          </p>
        </div>
      ) : (
        <>
          {/* Escritorio: tabla */}
          <section className="hidden overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
            <table className="w-full min-w-[64rem] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-3">Número</th>
                  <th className="px-3 py-3">Fecha</th>
                  <th className="px-3 py-3">Cliente</th>
                  <th className="px-3 py-3">Tipo</th>
                  <th className="px-3 py-3">Empresa</th>
                  <th className="px-3 py-3 text-right">Total</th>
                  <th className="px-3 py-3">Sucursal</th>
                  <th className="px-3 py-3">Orden</th>
                  <th className="px-3 py-3">Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((order) => (
                  <tr key={order.orderNumber} className="hover:bg-amber-50/40">
                    <td className="whitespace-nowrap px-3 py-2">
                      <Link
                        to={`/admin/ordenes/${order.orderNumber}`}
                        className="font-semibold text-amber-700 hover:underline"
                      >
                        #{order.orderNumber}
                      </Link>
                      {order.syncStatus === "PENDING" && (
                        <span className="ml-1 text-[10px] font-semibold text-slate-400" title="Guardada localmente, pendiente de enviar a Algolia">
                          (local)
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600">{formatOrderDate(order)}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-800">{orderClientName(order)}</p>
                      <p className="text-xs text-slate-500">{order.buyer?.email || order.userName}</p>
                    </td>
                    <td className="px-3 py-2">
                      <Badge className={customerTypeClass(order.customerType)}>
                        {CUSTOMER_TYPE_LABEL[order.customerType] ?? "No registrado"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{order.company?.name ?? "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-slate-800">
                      {formatColones(order.total)}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{orderBranchName(order)}</td>
                    <td className="px-3 py-2">
                      <Badge className={orderStatusClass(order.orderStatus)}>
                        {ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge className={paymentStatusClass(order.paymentStatus)}>
                        {PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Movil: tarjetas */}
          <ul className="space-y-3 md:hidden">
            {visible.map((order) => (
              <li key={order.orderNumber}>
                <Link
                  to={`/admin/ordenes/${order.orderNumber}`}
                  className="block rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-amber-400"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-amber-700">#{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">{formatOrderDate(order)}</p>
                    </div>
                    <p className="font-bold text-slate-900">{formatColones(order.total)}</p>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-800">{orderClientName(order)}</p>
                  {order.company?.name && (
                    <p className="text-xs text-slate-500">{order.company.name}</p>
                  )}
                  <p className="text-xs text-slate-500">Sucursal: {orderBranchName(order)}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge className={customerTypeClass(order.customerType)}>
                      {CUSTOMER_TYPE_LABEL[order.customerType] ?? "No registrado"}
                    </Badge>
                    <Badge className={orderStatusClass(order.orderStatus)}>
                      {ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
                    </Badge>
                    <Badge className={paymentStatusClass(order.paymentStatus)}>
                      {PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {nbPages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-3" aria-label="Paginación de órdenes">
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
    </>
  );
}