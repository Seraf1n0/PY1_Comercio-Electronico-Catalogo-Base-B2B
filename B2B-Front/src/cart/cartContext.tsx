import { useEffect, useReducer, type ReactNode } from 'react';
import { reducer } from './cartReducer';
import { loadCart, saveCart } from './storage';
import { CartContext } from './CartContext';

export function CartProvider( { children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, { items: [] }, () => ({
        items: loadCart(),
    }));

    useEffect(() => {
        saveCart(state.items);
    }, [state.items]);

    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>

    )

}
