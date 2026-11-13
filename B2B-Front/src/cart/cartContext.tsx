import { useEffect, useReducer, type ReactNode, useCallback, useRef} from "react";
import { useAuth } from "../auth/useAuth";
import { reducer } from "./cartReducer";
import { loadCart, saveCart } from "./storage";
import { CartContext } from "./CartContext";
import { useCartSync } from "./useCartSync";
import { applyB2BCondition } from "./applyB2BCondition";
import type { Role } from "../auth/types";


export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <UserCartProvider key={user.objectID} userId={user.objectID} role={user.role}>
      {children}
    </UserCartProvider>
  );
}

function UserCartProvider({
  children,
  userId,
  role,
}: {
  children: ReactNode;
  userId: string;
  role: Role;
}) {
  const [state, dispatch] = useReducer(reducer, { items: [] }, () => ({
    items: loadCart(userId),
  }));

  const skipNextSave = useRef(false);

  const syncCart = useCallback(() => {
    skipNextSave.current = true;

    dispatch({
        type: 'SYNC_CART',
        payload: loadCart(userId),
    });
  }, [userId]);

  useCartSync(userId, syncCart);

  const visibleState = {
    ...state,
    items: applyB2BCondition(state.items, role),
  };

  useEffect(() => {
    if(skipNextSave.current) {
        skipNextSave.current = false;
        return;
    }
    saveCart(userId, state.items);
  }, [userId, state.items]);

  return (
    <CartContext.Provider value={{ state: visibleState, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}
