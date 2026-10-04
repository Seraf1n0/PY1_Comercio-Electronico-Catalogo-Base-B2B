import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useCart } from "../cart/useCart";
import { useEffect, useRef, useState } from "react";
import CartPanel from "./CartPanel";

export default function CartPreview() {
    const { state } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);

    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                aria-label={`Abrir carrito, ${totalItems} ${totalItems === 1 ? "unidad" : "unidades"}`}
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
            >
                <ShoppingCartIcon className="h-6 w-6 text-gray-700 cursor-pointer hover:text-indigo-600" />
            </button>
            {totalItems > 0 && (
                < span className="absolute -top-3 -right-4 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600
                text-xs font-semibold text-white">
                    {totalItems}
                </span>
            )}

            {isOpen && <CartPanel onClose={() => setIsOpen(false)} />}
        </div>
    );
}
