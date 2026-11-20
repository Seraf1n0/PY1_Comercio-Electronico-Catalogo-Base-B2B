import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link, useParams } from "react-router-dom";
import Spinner from "../../components/Spinner";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  orderStatusClass,
  paymentStatusClass,
} from "../../orders/orderLabels";
import { useOrderDetail } from "../../orders/useOrdersSearch";
import { OrderDetailView } from "../orders/OrderDetail";
import AdminPageHeader from "./components/AdminPageHeader";

const backLink = (
  <Link
    to="/admin/ordenes"
    className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50"
  >
    <ArrowLeftIcon className="h-4 w-4" /> Volver a órdenes
  </Link>
);

/** Detalle de cualquier orden para el administrador*/
export default function AdminOrderDetailPage() {
  const { orderNumber } = useParams();
  const parsed = Number(orderNumber);
  const { order, loading } = useOrderDetail(Number.isInteger(parsed) ? parsed : undefined);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <Spinner className="h-5 w-5 text-amber-500" />
        <span className="text-sm text-slate-500">Cargando orden…</span>
      </div>
    );
  }

  // Orden inexistente se muestra un mensaje.
  if (!order) {
    return (
      <>
        <AdminPageHeader title="Orden no encontrada" actions={backLink} />
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="font-semibold text-slate-800">
            No existe una orden con el número #{orderNumber}.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Verifica el número o vuelve al listado de órdenes.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title={`Orden #${order.orderNumber}`} actions={backLink} />
      <div className="mb-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusClass(order.orderStatus)}`}>
          {ORDER_STATUS_LABEL[order.orderStatus]}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClass(order.paymentStatus)}`}>
          {PAYMENT_STATUS_LABEL[order.paymentStatus]}
        </span>
      </div>
      <OrderDetailView order={order} />
    </>
  );
}