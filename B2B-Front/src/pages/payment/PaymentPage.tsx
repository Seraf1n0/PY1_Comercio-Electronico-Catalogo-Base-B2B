import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { useCart } from "../../cart/useCart";
import { formatColones } from "../../cart/cartTotals";
import { getOrderByNumber } from "../../orders/storage";
import {
  markOrderFailed,
  markPaymentApproved,
  markPaymentDeclined,
  markPaymentError,
} from "../../orders/orderTransitions";
import type { Order } from "../../orders/types";
import { processPayment } from "../../payments/paymentService";
import type { CardData } from "../../payments/types";
import OrderSummary from "./components/OrderSummary";
import PaymentResultMessage from "./components/PaymentResultMessage";

//Formato

type FieldErrors = Partial<Record<keyof CardData, string>>;


const formatNumber = (value: string) =>
  value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

// "1230" -> "12/30"
const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

// Lo único que se exige antes de enviar es que no haya campos vacíos.
// Si los datos son incorrectos el servicio de pagos rechaza el pago.
function validateRequired(card: CardData): FieldErrors {
  const errors: FieldErrors = {};
  (Object.keys(card) as (keyof CardData)[]).forEach((key) => {
    if (card[key].trim() === "") errors[key] = "Este campo es obligatorio";
  });
  return errors;
}

//La interfa(zZ)+

type Ui =
  | { status: "idle" }
  | { status: "processing" }
  | { status: "declined"; message: string }
  | { status: "error" };

const PAYMENT_LABEL: Record<Order["paymentStatus"], string> = {
  PENDING: "Pago pendiente",
  APPROVED: "Pago aprobado",
  DECLINED: "Pago rechazado",
  ERROR: "Error en el pago",
};

function Field({
  label, error, children,
}: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100";

function Notice({ title, text, to, action }: { title: string; text: string; to: string; action: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-500">{text}</p>
      <Link to={to} className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700">
        {action}
      </Link>
    </div>
  );
}



export default function PaymentPage() {
  const { orderNumber } = useParams();
  const orderId = Number(orderNumber);
  const navigate = useNavigate();
  const { dispatch } = useCart();

  const [order, setOrder] = useState<Order | null>(() => getOrderByNumber(orderId));
  const [form, setForm] = useState<CardData>({ holder: "", number: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [ui, setUi] = useState<Ui>({ status: "idle" });

  // Evita solicitudes duplicadas aunque el usuario haga doble clic muy rápido
  const processing = useRef(false);
  const isProcessing = ui.status === "processing";

  const refreshOrder = () => setOrder(getOrderByNumber(orderId));

  async function handlePay() {
    if (processing.current || !order) return;

    const found = validateRequired(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    processing.current = true;
    setUi({ status: "processing" });

    try {
      const response = await processPayment({
        orderId: order.orderNumber,
        amount: order.total,
        currency: "CRC",
        card: form,
      });

      // Se aprueba el pago
      if (response.status === "PAYMENT_APPROVED") {
        const updated = markPaymentApproved(order.orderNumber, response.transactionId);
        if (updated?.orderStatus === "CONFIRMED") {
          dispatch({ type: "CLEAR_CART" });
          navigate(`/confirmacion/${order.orderNumber}`, { replace: true });
          return;
        }
        
        refreshOrder();
        setUi({ status: "error" });
        return;
      }

      // Pago rechazado y la orden sigue en pending
      markPaymentDeclined(order.orderNumber);
      refreshOrder();
      setUi({ status: "declined", message: response.message });
    } catch (error) {
      // El servicio falló: la orden sigue PENDING
      console.error("Fallo del servicio de pagos", error);
      markPaymentError(order.orderNumber);
      refreshOrder();
      setUi({ status: "error" });
    } finally {
      processing.current = false;
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void handlePay();
  };

  const handleCancel = () => {
    if (isProcessing || !order) return;
    markOrderFailed(order.orderNumber);
    navigate("/carrito");   // el carrito conserva los productos
  };

  //Protecciones para ordenes que se borran o cancelan

  if (!order) {
    return <Notice title="No encontramos tu orden" text="Revisa el enlace o vuelve al catálogo." to="/" action="Volver al catálogo" />;
  }
  if (order.orderStatus === "CONFIRMED") {
    return <Navigate to={`/confirmacion/${order.orderNumber}`} replace />;
  }
  if (order.orderStatus === "FAILED") {
    return <Notice title="Esta orden fue cancelada" text="Puedes volver a tu carrito para iniciar una nueva compra." to="/carrito" action="Ir al carrito" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <header className="flex items-center justify-between gap-3 bg-white px-4 py-4 shadow-md sm:px-6">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isProcessing}
          className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Cancelar compra
        </button>
        <h1 className="text-lg font-bold tracking-tight text-blue-800 sm:text-xl">
          Pago · Orden #{order.orderNumber}
        </h1>
        <span className="min-w-20 text-right text-xs font-semibold text-slate-500">
          {PAYMENT_LABEL[order.paymentStatus]}
        </span>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 lg:flex lg:gap-6">
        <section className="flex flex-1 flex-col gap-4">
          

          <form
            id="payment-form"
            onSubmit={onSubmit}
            noValidate
            className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <h2 className="mb-4 text-base font-bold text-slate-800">Datos de la tarjeta</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Titular" error={errors.holder}>
                  <input className={inputClass} disabled={isProcessing} value={form.holder}
                    onChange={(e) => setForm({ ...form, holder: e.target.value })} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Número de tarjeta" error={errors.number}>
                  <input className={inputClass} inputMode="numeric" disabled={isProcessing}
                    placeholder="0000 0000 0000 0000" value={form.number}
                    onChange={(e) => setForm({ ...form, number: formatNumber(e.target.value) })} />
                </Field>
              </div>
              <Field label="Vencimiento (MM/AA)" error={errors.expiry}>
                <input className={inputClass} inputMode="numeric" disabled={isProcessing}
                  placeholder="MM/AA" value={form.expiry}
                  onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })} />
              </Field>
              <Field label="CVV" error={errors.cvv}>
                <input className={inputClass} inputMode="numeric" disabled={isProcessing}
                  placeholder="•••" value={form.cvv}
                  onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })} />
              </Field>
            </div>
          </form>

          {ui.status === "declined" && (
            <PaymentResultMessage kind="declined" detail={ui.message} onRetry={handlePay} disabled={isProcessing} />
          )}
          {ui.status === "error" && (
            <PaymentResultMessage kind="error" onRetry={handlePay} disabled={isProcessing} />
          )}
        </section>

        <aside className="mt-6 lg:mt-0 lg:w-96 lg:shrink-0">
          <div className="sticky top-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
              Resumen de la orden
            </h2>
            <OrderSummary order={order} />

            <button
              type="submit"
              form="payment-form"
              disabled={isProcessing}
              aria-busy={isProcessing}
              className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Procesando pago…
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5" />
                  Pagar {formatColones(order.total)}
                </>
              )}
            </button>
            {isProcessing && (
              <p className="mt-2 text-center text-xs text-slate-500">
                No cierres ni recargues esta página.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}