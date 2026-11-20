import { XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useCart } from "../cart/useCart";
import CartItemRow from "./CartItemRow";
import { getCartLineId } from "../cart/types";
import CartSummary from "./CartSummary";
import B2BMinimumNotice from "./B2BMinimumNotice";

export default function CartPanel({ onClose }: { onClose?: () => void }) {
    const { state, dispatch } = useCart();
    const navigate = useNavigate();

    const handleViewCart = () => {
        onClose?.();
        navigate("/carrito");
    };

    const handleSubmitOrder = () => {
        onClose?.();
        navigate("/finalizar-compra");
    }

    return (
    <>
    {/* Fondo oscuro solo en movil; tocarlo cierra el carrito */}
    <div className="fixed inset-0 z-40 bg-slate-900/40 sm:hidden" onClick={onClose} aria-hidden="true" />
    {/* Movil: hoja inferior a todo el ancho (antes se salia por la izquierda).
        Desde sm: panel flotante bajo el icono, como siempre. */}
    <div role="dialog" aria-label="Tu carrito" className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-200 animate-slide-up sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-10 sm:z-40 sm:max-h-none sm:w-80 sm:overflow-visible sm:rounded-xl sm:shadow-lg sm:origin-top-right sm:animate-scale-in">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Tu carrito
        </h2>

                <div className="flex items-center gap-3">
          {state.items.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'CLEAR_CART' })}
              className="cursor-pointer text-xs font-semibold text-red-600 hover:underline"
            >
              Vaciar carrito
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="cursor-pointer rounded-lg p-1 text-slate-500 hover:bg-slate-100 sm:hidden"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <B2BMinimumNotice className="mb-3" />

      {state.items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          El carrito está vacío
        </p>
      ) : (
        <>
          <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto">
            {state.items.map((item) => (
                <CartItemRow key={getCartLineId(item)} item={item} onNavigate={onClose} />
            ))}
          </ul>

          <CartSummary items={state.items} className="mt-4 border-t border-slate-200 pt-3" />

          {/* Usen estos botones para redirigir */}
            <div className="mt-3 flex flex-col gap-2">
            <button
                type="button"
                onClick={handleViewCart}
                className="w-full cursor-pointer rounded border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
            >
                Ver carrito
            </button>
            <button
                type="button"
                className="w-full cursor-pointer rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                onClick={handleSubmitOrder}
            >
                Finalizar compra
            </button>
            </div>
        </>
            )}
    </div>
    </>
  );
}