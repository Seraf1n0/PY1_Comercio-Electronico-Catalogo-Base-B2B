import { createContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type {State, Action} from './cartReducer';
import { reducer } from './cartReducer';

type CartContextType = {
    state: State;
    dispatch: Dispatch<Action>;
}

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider( { children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, { items: [] });

    console.log(state.items);
    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>

    )
    
}
