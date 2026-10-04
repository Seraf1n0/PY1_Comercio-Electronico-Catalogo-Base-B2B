import { createContext, type Dispatch } from 'react';
import type { State, Action } from './cartReducer';

export type CartContextType = {
    state: State;
    dispatch: Dispatch<Action>;
};

export const CartContext = createContext<CartContextType | null>(null);
