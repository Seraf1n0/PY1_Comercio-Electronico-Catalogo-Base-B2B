import { Link, useParams } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../../auth/useAuth";
import { errorMessages } from "../../lib/errorMessages";
import { canViewOrder } from "../../orders/orderAccess";
import { getOrderByNumber } from "../../orders/ordersStorage";
import { OrderDetailView } from "../orders/OrderDetail";

export default function ConfirmationPage() {
  const { orderNumber } = useParams();
  const { user } = useAuth();
  const numeric = Number(orderNumber);
  const order = Number.isNaN(numeric) ? null : getOrderByNumber(numeric);

  // Misma respuesta para una orden inexistente o ajena: no se revela si existe.
  if (!order || !canViewOrder(order, user)) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center animate-fade-in">
        <h2 className="text-xl font-bold text-slate-800">
          {errorMessages.order.notFound.title}
        </h2>
        <p className="text-sm text-slate-500">{errorMessages.order.notFound.text}</p>
        <Link
          to="/mis-ordenes"
          className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          Ir a mis órdenes
        </Link>
      </div>
    );
  }

  const isConfirmed = order.orderStatus === "CONFIRMED";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center gap-2 text-center animate-fade-in-up">
          {isConfirmed && (
            <CheckCircleIcon className="h-16 w-16 text-green-600 animate-scale-in" />
          )}
          <h1 className="text-2xl font-bold text-slate-900">
            {isConfirmed ? "¡Compra confirmada!" : "Detalle de la orden"}
          </h1>
          <p className="text-sm text-slate-500">
            {isConfirmed
              ? "Tu pago fue aprobado y tu orden quedó registrada."
              : "Consulta el estado y las condiciones de tu orden."}
          </p>
          <p className="mt-2 rounded-full bg-indigo-50 px-4 py-1 text-lg font-bold text-indigo-700">
            Orden #{order.orderNumber}
          </p>
        </div>

        <div className="mt-6">
          <OrderDetailView order={order} />
        </div>

        <div className="mt-6 text-center">
          {order.orderStatus === "PENDING" ? (
            <Link
              to={`/pago/${order.orderNumber}`}
              className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Ir al pago
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Volver al catálogo
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
