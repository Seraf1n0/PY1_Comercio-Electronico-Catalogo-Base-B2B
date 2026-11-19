import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { roleLabels } from "../../auth/roleLabels";
import Spinner from "../../components/Spinner";
import UserBadge from "../../components/UserBadge";
import { errorMessages } from "../../lib/errorMessages";
import { useOrderDetail } from "../../orders/useOrdersSearch";
import type { Order } from "../../orders/types";
import OrderSummary from "../payment/components/OrderSummary";

function formatOrderDate(order: Order): string {
  const date = new Date(order.date);
  return Number.isNaN(date.getTime()) ? order.date : date.toLocaleString("es-CR");
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800 sm:text-right">{children}</dd>
    </div>
  );
}

export type OrderDetailViewProps = { order: Order };

// Detalle presentacional: no lee storage ni auth para poder reutilizarse.
export function OrderDetailView({ order }: OrderDetailViewProps) {
  const pricingTierLabel = order.pricingTier === "B2B" ? "B2B (Empresa)" : "B2C (Cliente)";

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Condiciones comerciales</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Field label="Usuario">{order.userName || "No registrado"}</Field>
          <Field label="Rol">{roleLabels[order.role] ?? order.role}</Field>
          {order.company && (
            <>
              <Field label="Empresa">{order.company.name || "No registrada"}</Field>
              <Field label="Cédula jurídica">{order.company.legalId || "No registrada"}</Field>
            </>
          )}
          <Field label="Sucursal">{order.branch.name || "No registrada"}</Field>
          <Field label="Tipo de precio">{pricingTierLabel}</Field>
          <div>
            <dt className="text-slate-500">Condiciones aplicadas</dt>
            <dd className="mt-1 font-medium text-slate-800">
              {order.appliedConditions.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5">
                  {order.appliedConditions.map((condition) => (
                    <li key={condition}>{condition}</li>
                  ))}
                </ul>
              ) : (
                "Sin condiciones aplicadas"
              )}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Comprador</h2>
          <div className="mt-3 space-y-1 text-sm">
            <p className="font-medium text-slate-800">
              {order.buyer.name} {order.buyer.lastName}
            </p>
            <p className="text-slate-500">{order.buyer.email}</p>
            <p className="text-slate-500">{order.buyer.phone}</p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Entrega</h2>
          <div className="mt-3 space-y-1 text-sm">
            <p className="font-medium text-slate-800">{order.delivery.address}</p>
            <p className="text-slate-500">
              {order.delivery.canton}, {order.delivery.province}
            </p>
            {order.delivery.additionalAddress && (
              <p className="text-slate-500">{order.delivery.additionalAddress}</p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Productos y totales</h2>
        <div className="mt-3">
          <OrderSummary order={order} />
        </div>
        <div className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-xs text-slate-500">
          <p>Fecha: {formatOrderDate(order)}</p>
          {order.transactionId && <p>Transacción: {order.transactionId}</p>}
        </div>
      </section>
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const numeric = Number(orderNumber);
  const valid = Number.isInteger(numeric) && numeric > 0;
  const { order, loading } = useOrderDetail(valid ? numeric : undefined);

  if (!order && loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-10">
        <header className="flex items-center justify-between gap-3 bg-white px-4 py-4 shadow-md sm:px-6">
          <Link to="/mis-ordenes" className="text-sm font-semibold text-slate-700 hover:text-indigo-600">
            ← Volver a mis órdenes
          </Link>
          <h1 className="text-lg font-bold text-blue-800 sm:text-xl">Detalle de la orden</h1>
          <UserBadge />
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-center gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <Spinner className="h-5 w-5 text-indigo-600" />
            <span className="text-sm text-slate-500">Cargando orden…</span>
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 pb-10">
        <header className="flex items-center justify-between gap-3 bg-white px-4 py-4 shadow-md sm:px-6">
          <Link to="/mis-ordenes" className="text-sm font-semibold text-slate-700 hover:text-indigo-600">
            ← Volver a mis órdenes
          </Link>
          <h1 className="text-lg font-bold text-blue-800 sm:text-xl">Detalle de la orden</h1>
          <UserBadge />
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
            <p className="font-semibold text-slate-800">{errorMessages.order.notFound.title}</p>
            <p className="mt-1 text-sm text-slate-500">{errorMessages.order.notFound.text}</p>
            <Link
              to="/mis-ordenes"
              className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Volver a mis órdenes
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <header className="flex items-center justify-between gap-3 bg-white px-4 py-4 shadow-md sm:px-6">
        <Link to="/mis-ordenes" className="text-sm font-semibold text-slate-700 hover:text-indigo-600">
          ← Volver a mis órdenes
        </Link>
        <h1 className="text-lg font-bold text-blue-800 sm:text-xl">Detalle de la orden</h1>
        <UserBadge />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <OrderDetailView order={order} />
      </main>
    </div>
  );
}
