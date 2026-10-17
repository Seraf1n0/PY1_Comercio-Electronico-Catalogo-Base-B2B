import { Link, useParams } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { getOrderByNumber } from "../../orders/storage";
import { errorMessages } from "../../lib/errorMessages";
import OrderSummary from "../payment/components/OrderSummary";

export default function ConfirmationPage() {
  const { orderNumber } = useParams();
  const order = getOrderByNumber(Number(orderNumber));

  // Solo se muestra la confirmación si la orden realmente está confirmada
  if (!order || order.orderStatus !== "CONFIRMED") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center animate-fade-in">
        <h2 className="text-xl font-bold text-slate-800">
          {order
            ? errorMessages.order.notConfirmed.title
            : errorMessages.order.notFound.title}
        </h2>
        <p className="text-sm text-slate-500">
          {order
            ? errorMessages.order.notConfirmed.text
            : errorMessages.order.notFound.text}
        </p>
        <Link
          to={order?.orderStatus === "PENDING" ? `/pago/${order.orderNumber}` : "/"}
          className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          {order?.orderStatus === "PENDING" ? "Ir al pago" : "Volver al catálogo"}
        </Link>
      </div>
    );
  }

  const date = new Date(order.date);
  const dateText = Number.isNaN(date.getTime()) ? order.date : date.toLocaleString("es-CR");

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center gap-2 text-center animate-fade-in-up">
          <CheckCircleIcon className="h-16 w-16 text-green-600 animate-scale-in" />
          <h1 className="text-2xl font-bold text-slate-900">¡Compra confirmada!</h1>
          <p className="text-sm text-slate-500">
            Tu pago fue aprobado y tu orden quedó registrada.
          </p>
          <p className="mt-2 rounded-full bg-indigo-50 px-4 py-1 text-lg font-bold text-indigo-700">
            Orden #{order.orderNumber}
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl bg-white p-5 text-sm shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-2 font-bold text-slate-800">Comprador</h2>
            <p>{order.buyer.name} {order.buyer.lastName}</p>
            <p className="text-slate-500">{order.buyer.email}</p>
            <p className="text-slate-500">{order.buyer.phone}</p>
          </section>

          <section className="rounded-xl bg-white p-5 text-sm shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-2 font-bold text-slate-800">Entrega</h2>
            <p>{order.delivery.address}</p>
            <p className="text-slate-500">{order.delivery.canton}, {order.delivery.province}</p>
            {order.delivery.additionalAddress && (
              <p className="text-slate-500">{order.delivery.additionalAddress}</p>
            )}
          </section>
        </div>

        <section className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 font-bold text-slate-800">Resumen de la compra</h2>
          <OrderSummary order={order} />
          <div className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-xs text-slate-500">
            <p>Fecha: {dateText}</p>
            {order.transactionId && <p>Transacción: {order.transactionId}</p>}
          </div>
        </section>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700">
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}