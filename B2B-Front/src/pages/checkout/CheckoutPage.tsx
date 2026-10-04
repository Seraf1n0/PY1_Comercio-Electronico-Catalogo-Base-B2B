import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { useCart } from "../../cart/useCart";
import { formatColones, getOrderTotal } from "../../cart/cartTotals";
import {
  FACTOR_TRASLADO_INTERNO_Y_PROVINCIA,
  FLETE_PROMEDIO_SEDE_SAN_JOSE,
  getShippingCost,
  getTotalUnits,
} from "../../cart/shipping";
import { useCartFeedback } from "../../components/cartFeedbackContext";
import CartSummary from "../../components/CartSummary";
import EmptyCart from "../cart/components/EmptyCart";

export default function CheckoutPage() {
  const { state } = useCart();
  const navigate = useNavigate();
  const { notify } = useCartFeedback();

  const shipping = getShippingCost(state.items);
  const total = getOrderTotal(state.items);
  const totalUnits = getTotalUnits(state.items);

  const handlePay = () => {
    notify("La pasarela de pago estará disponible próximamente");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-44 lg:pb-10">
      <header className="flex items-center justify-between gap-3 bg-white px-4 py-4 shadow-md sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/carrito")}
          className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-indigo-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Volver al carrito
        </button>
        <h1 className="text-lg font-bold tracking-tight text-blue-800 sm:text-xl">
          Finalizar compra
        </h1>
        <span className="min-w-20 text-right text-sm text-slate-500">
          {totalUnits} {totalUnits === 1 ? "vehículo" : "vehículos"}
        </span>
      </header>

      {state.items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-6 lg:flex lg:gap-6">
          <section className="flex-1">
            <h2 className="mb-4 text-base font-bold text-slate-800">
              Resumen de productos
            </h2>

            <ul className="flex flex-col gap-3">
              {state.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:gap-4 sm:p-4"
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="h-16 w-20 shrink-0 rounded-lg object-cover sm:h-20 sm:w-28"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/producto/${item.id}`}
                      className="line-clamp-2 font-semibold text-slate-800 transition hover:text-indigo-600 hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.quantity} × {formatColones(item.price)}
                    </p>
                  </div>
                  <p className="shrink-0 font-bold text-slate-900">
                    {formatColones(item.subtotal)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-lg bg-white p-4 text-xs text-slate-500 shadow-sm ring-1 ring-slate-200">
              <p className="font-semibold text-slate-600">
                Cómo se calcula el envío
              </p>
              <p className="mt-1">
                Envío estandarizado: flete promedio desde cualquier sede a San
                José ({formatColones(FLETE_PROMEDIO_SEDE_SAN_JOSE)}) ×{" "}
                {totalUnits} {totalUnits === 1 ? "vehículo" : "vehículos"} ×{" "}
                {FACTOR_TRASLADO_INTERNO_Y_PROVINCIA} (traslado interno + traslado
                a la provincia) = <strong>{formatColones(shipping)}</strong>.
              </p>
            </div>
          </section>

          <aside className="hidden lg:block lg:w-80 lg:shrink-0">
            <div className="sticky top-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                Resumen del pedido
              </h2>
              <CartSummary items={state.items} includeShipping />
              <button
                type="button"
                onClick={handlePay}
                className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <CreditCardIcon className="h-5 w-5" />
                Proceder al Pago
              </button>
              <p className="mt-2 text-center text-xs text-slate-400">
                Total con IVA (13%) y envío incluidos
              </p>
            </div>
          </aside>
        </div>
      )}

      {state.items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-4 pb-4 pt-3 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <span className="text-sm uppercase tracking-wide text-slate-500">
              Total
            </span>
            <span className="text-xl font-bold text-slate-900">
              {formatColones(total)}
            </span>
          </div>
          <p className="mx-auto mt-1 max-w-6xl text-xs text-slate-400">
            Incluye IVA (13%) y envío
          </p>
          <button
            type="button"
            onClick={handlePay}
            className="mx-auto mt-3 flex w-full max-w-6xl cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <CreditCardIcon className="h-5 w-5" />
            Proceder al Pago
          </button>
        </div>
      )}
    </div>
  );
}
