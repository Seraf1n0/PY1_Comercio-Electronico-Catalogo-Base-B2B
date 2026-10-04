import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HomeIcon } from "@heroicons/react/24/solid";
import { useCart } from "../../cart/useCart";
import type { CartItem } from "../../cart/types";
import { getIva, getProductSubtotal, getTotal, formatColones } from "../../cart/cartTotals";
import CartSummary from "../../components/CartSummary";
import CartLineItem from "./components/CartLineItem";
import EmptyCart from "./components/EmptyCart";

export default function CartPage() {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const [removed, setRemoved] = useState<{ item: CartItem; index: number } | null>(null);

  const subtotal = getProductSubtotal(state.items);
  const iva = getIva(subtotal);
  const total = getTotal(state.items);
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!removed) return;
    const timeout = window.setTimeout(() => setRemoved(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [removed]);

  const handleRemove = (item: CartItem) => {
    const index = state.items.findIndex((current) => current.id === item.id);
    setRemoved({ item, index });
    dispatch({ type: "REMOVE_ITEM", payload: item.id });
  };

  const handleUndo = () => {
    if (!removed) return;
    dispatch({ type: "RESTORE_ITEM", payload: removed });
    setRemoved(null);
  };

  const handleClear = () => {
    dispatch({ type: "CLEAR_CART" });
    setRemoved(null);
    navigate("/");
  };

  const handleCheckout = () => {
    navigate("/finalizar-compra");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-44 lg:pb-10">
      <header className="flex items-center justify-between gap-3 bg-white px-4 py-4 shadow-md sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-indigo-600"
        >
          <HomeIcon className="h-5 w-5" />
          Seguir comprando
        </button>
        <h1 className="text-lg font-bold tracking-tight text-blue-800 sm:text-xl">
          Tu carrito
        </h1>
        <span className="min-w-20 text-right text-sm text-slate-500">
          {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
        </span>
      </header>

      {state.items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-6 lg:flex lg:gap-6">
          <section className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">
                Productos ({state.items.length})
              </h2>
              <button
                type="button"
                onClick={handleClear}
                className="cursor-pointer text-sm font-semibold text-red-600 hover:underline"
              >
                Vaciar carrito
              </button>
            </div>

            <ul className="flex flex-col gap-3">
              {state.items.map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  onRemove={() => handleRemove(item)}
                />
              ))}
            </ul>
          </section>

          <aside className="hidden lg:block lg:w-80 lg:shrink-0">
            <div className="sticky top-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                Resumen de compra
              </h2>
              <CartSummary items={state.items} />
              <button
                type="button"
                onClick={handleCheckout}
                className="mt-5 w-full cursor-pointer rounded-lg bg-indigo-600 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Realizar compra
              </button>
              <p className="mt-2 text-center text-xs text-slate-400">
                Impuestos calculados (IVA 13%)
              </p>
            </div>
          </aside>
        </div>
      )}

      {state.items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-4 pb-4 pt-3 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-6xl items-end justify-between gap-4">
            <div className="text-sm text-slate-500">
              <p>
                Subtotal
                <span className="ml-2 font-semibold text-slate-700">
                  {formatColones(subtotal)}
                </span>
              </p>
              <p>
                IVA (13%)
                <span className="ml-2 font-semibold text-slate-700">
                  {formatColones(iva)}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total
              </p>
              <p className="text-lg font-bold text-slate-900">
                {formatColones(total)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="mx-auto mt-3 block w-full max-w-6xl cursor-pointer rounded-lg bg-indigo-600 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Realizar compra
          </button>
        </div>
      )}

      {removed && (
        <div className="fixed bottom-40 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 lg:bottom-6">
          <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
            <span className="truncate">Producto eliminado</span>
            <button
              type="button"
              onClick={handleUndo}
              className="shrink-0 cursor-pointer font-semibold text-indigo-300 hover:text-indigo-200"
            >
              Deshacer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
