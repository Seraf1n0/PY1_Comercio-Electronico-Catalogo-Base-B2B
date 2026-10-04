import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import type { Product } from "../Catalog/types";
import { useCart } from "../cart/useCart";
import { useCartFeedback } from "./cartFeedbackContext";


export default function AddToCartButton({ product }: { product: Product }) {
    const { state, dispatch } = useCart();
    const { notify } = useCartFeedback();

    const totalStock = product.stock
        ? Object.values(product.stock).reduce((sum, cantidad) => sum + (cantidad ?? 0), 0)
        : 0;

    const hasPrice = typeof product.price === "number" && Number.isFinite(product.price);
    const canAdd = product.in_stock !== false && totalStock > 0 && hasPrice;

    const handleAdd = () => {
        if (!canAdd) return;

        dispatch({ type: 'ADD_ITEM', payload: product });

        const currentItem = state.items.find((item) => item.id === product.objectID);
        const newQuantity = (currentItem?.quantity ?? 0) + 1;
        const label = product.title ?? "Producto";
        notify(`${label} · ${newQuantity} en el carrito`);
    };

    return (
        <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        aria-label={
            canAdd
                ? `Agregar ${product.title ?? "producto"} al carrito`
                : `${product.title ?? "Producto"} sin stock`
        }
        className="mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded w-full cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">

            <ShoppingCartIcon className="h-5 w-5" />
            {canAdd ? "Agregar al carrito" : "Sin stock"}
        </button>
    )

}
