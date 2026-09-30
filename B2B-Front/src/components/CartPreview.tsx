import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useCart } from "../cart/useCart";
import { useState } from "react";
import CartPanel from "./CartPanel";
   
export default function CartPreview() {  
    const { state } = useCart();   
    const [isOpen, setIsOpen] = useState(false);

    const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
    return (
        <div className="relative">
            <button type="button" aria-label="Abrir carrito" onClick={() => setIsOpen(!isOpen)}>  
                <ShoppingCartIcon className="h-6 w-6 text-gray-700 cursor-pointer hover:text-indigo-600" />
            </button>
            {totalItems > 0 && (
                < span className="absolute -top-3 -right-4 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600
                text-xs font-semibold text-white">
                    {totalItems}
                </span>
            )}

            {isOpen && <CartPanel />}
        </div>
    );  
}    
