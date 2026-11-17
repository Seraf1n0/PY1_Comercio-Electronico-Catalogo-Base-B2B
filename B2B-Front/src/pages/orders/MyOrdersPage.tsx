import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { formatColones } from "../../cart/cartTotals";
import Spinner from "../../components/Spinner";
import UserBadge from "../../components/UserBadge";
import type { Order } from "../../orders/types";
import { useOrdersSearch } from "../../orders/useOrdersSearch";

const ORDER_STATUS_LABEL: Record<Order["orderStatus"], string> = {
  PENDING: "Orden pendiente",
  CONFIRMED: "Orden confirmada",
  FAILED: "Orden fallida",
};

const PAYMENT_STATUS_LABEL: Record<Order["paymentStatus"], string> = {
  PENDING: "Pago pendiente",
  APPROVED: "Pago aprobado",
  DECLINED: "Pago rechazado",
  ERROR: "Error en el pago",
};

function getOrderTime(order: Order): number {
  if (typeof order.createdAtTs === "number" && Number.isFinite(order.createdAtTs) && order.createdAtTs > 0) {
    return order.createdAtTs;
  }

  const parsed = Date.parse(order.date);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatOrderDate(order: Order): string {
  const time = getOrderTime(order);
  return time > 0 ? new Date(time).toLocaleString("es-CR") : "Fecha no disponible";
}

function orderStatusClass(status: Order["orderStatus"]): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-700";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-red-100 text-red-700";
  }
}

function paymentStatusClass(status: Order["paymentStatus"]): string {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-700";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "DECLINED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { orders, loading, error } = useOrdersSearch({
    hitsPerPage: 100,
    scope: "own",
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <header className="flex items-center justify-between gap-3 bg-white px-4 py-4 shadow-md sm:px-6">
        <Link to="/" className="text-sm font-semibold text-slate-700 hover:text-indigo-600">
          ← Volver al catálogo
        </Link>
        <h1 className="text-lg font-bold text-blue-800 sm:text-xl">Mis órdenes</h1>
        <UserBadge />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            {error}
          </div>
        )}

        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <Spinner className="h-5 w-5 text-indigo-600" />
            <span className="text-sm text-slate-500">Cargando órdenes…</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
            <p className="font-semibold text-slate-800">Todavía no tienes órdenes</p>
            <p className="mt-1 text-sm text-slate-500">
              Cuando realices una compra, podrás verla aquí.
            </p>
            <Link
              to="/"
              className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Explorar el catálogo
            </Link>
          </div>
        ) : (
          <section className="overflow-x-auto rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Número</th>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Sucursal</th>
                  <th className="px-3 py-2">Estado de la orden</th>
                  <th className="px-3 py-2">Estado del pago</th>
                  <th className="px-3 py-2">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.orderNumber}>
                    <td className="whitespace-nowrap py-2 pr-3 font-medium text-indigo-700">
                      <Link to={"/mis-ordenes/" + order.orderNumber} className="hover:underline">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                      {formatOrderDate(order)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-800">
                      {formatColones(order.total)}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{order.branch.name}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${orderStatusClass(order.orderStatus)}`}>
                        {ORDER_STATUS_LABEL[order.orderStatus]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${paymentStatusClass(order.paymentStatus)}`}>
                        {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <Link
                        to={"/mis-ordenes/" + order.orderNumber}
                        className="font-semibold text-indigo-700 hover:underline"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}
