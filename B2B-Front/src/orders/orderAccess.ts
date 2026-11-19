import type { AppUser } from "../auth/types";
import type { Order } from "./types";

/** ADMIN puede ver cualquier orden; cada cliente solo las suyas. */
export function canViewOrder(order: Order, user: AppUser | null): boolean {
  return user !== null && (user.role === "ADMIN" || order.userId === user.objectID);
}
