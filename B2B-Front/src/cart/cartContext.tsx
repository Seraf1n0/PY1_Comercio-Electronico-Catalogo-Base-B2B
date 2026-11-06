import { useEffect, useReducer, type ReactNode, useCallback, useRef} from "react";
import { useAuth } from "../auth/AuthContext";
import { reducer } from "./cartReducer";
import { loadCart, saveCart } from "./storage";
import { CartContext } from "./CartContext";
import { useCartSync } from "./useCartSync";


export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <UserCartProvider key={user.objectID} userId={user.objectID}>
      {children}
    </UserCartProvider>
  );
}

function UserCartProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string;
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

  useEffect(() => {
    if(skipNextSave.current) {
        skipNextSave.current = false;
        return;
    }
    saveCart(userId, state.items);
  }, [userId, state.items]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}