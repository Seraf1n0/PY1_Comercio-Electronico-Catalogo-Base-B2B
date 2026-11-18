import { branches } from "../branch/branches";
import type { CustomerType, Order } from "./types";



export const ORDER_STATUS_LABEL: Record<Order["orderStatus"], string> = {
  PENDING: "Orden pendiente",
  CONFIRMED: "Orden confirmada",
  FAILED: "Orden fallida",
};

export const PAYMENT_STATUS_LABEL: Record<Order["paymentStatus"], string> = {
  PENDING: "Pago pendiente",
  APPROVED: "Pago aprobado",
  DECLINED: "Pago rechazado",
  ERROR: "Error en el pago",
};

export const CUSTOMER_TYPE_LABEL: Record<CustomerType, string> = {
  B2C: "B2C · Cliente",
  B2B: "B2B · Empresa",
};

export function orderStatusClass(status: Order["orderStatus"]): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-700";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-red-100 text-red-700";
  }
}

export function paymentStatusClass(status: Order["paymentStatus"]): string {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-700";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "DECLINED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function customerTypeClass(type: CustomerType | undefined): string {
  return type === "B2B"
    ? "bg-violet-100 text-violet-700"
    : "bg-sky-100 text-sky-700";
}

/** Fecha de la orden; tolera ordenes viejas sin createdAtTs. */
export function formatOrderDate(order: Order): string {
  const time =
    typeof order.createdAtTs === "number" && order.createdAtTs > 0
      ? order.createdAtTs
      : Date.parse(order.date);
  return Number.isFinite(time) && time > 0
    ? new Date(time).toLocaleString("es-CR")
    : "Fecha no disponible";
}

/** Nombre del cliente: comprador del checkout o, si falta, el usuario. */
export function orderClientName(order: Order): string {
  const buyer = `${order.buyer?.name ?? ""} ${order.buyer?.lastName ?? ""}`.trim();
  return buyer || order.userName || "Cliente no registrado";
}

/** Nombre de la sucursal; las ordenes legacy pueden no traerla. */
export function orderBranchName(order: Order): string {
  if (order.branch?.name) return order.branch.name;
  const known = branches.find((branch) => branch.id === order.branch?.id);
  return known?.label ?? "No registrada";
}