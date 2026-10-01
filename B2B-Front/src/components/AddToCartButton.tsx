import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import type { Product } from "../Catalog/types";
import { useCart } from "../cart/useCart";


export default function AddToCartButton({ product}: { product: Product }) {
    const { dispatch } = useCart();


    return (
        <button 
        type="button" 
        onClick={() => dispatch({ type: 'ADD_ITEM', payload: product })}
        className="mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded w-full cursor-pointer">

            <ShoppingCartIcon className="h-5 w-5" />
            Agregar al carrito
        </button> 
    )

}