import { useEffect, useReducer, type ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { reducer } from "./cartReducer";
import { loadCart, saveCart } from "./storage";
import { CartContext } from "./CartContext";

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

  useEffect(() => {
    saveCart(userId, state.items);
  }, [userId, state.items]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}