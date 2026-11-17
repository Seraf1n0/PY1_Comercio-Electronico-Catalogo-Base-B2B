import { getOrderByNumber, updateOrder } from "./ordersStorage";
import { publishOrder } from "./ordersIndexService";
import type { Order } from "./types";

//Obtener orden que se puede cambiar su estado. Solo las que tienen estado de PENDING. 
//Retorna null en caso de que la orden no pueda cambiar de estado
function getEditableOrder(orderNumber: number): Order | null {
    const order = getOrderByNumber(orderNumber);
    if (!order || order.orderStatus !== "PENDING") {
        return null;
    }
    return order;
}

// Esta función es caundo el pago está aprobado y se cambia el estado a APPROVED del pago
export function markPaymentApproved(
    orderNumber: number,
    transactionId: string
): Order | null {
    const order = getEditableOrder(orderNumber);
    if (!order) return getOrderByNumber(orderNumber);

    const updated = updateOrder(orderNumber, {
        orderStatus: "CONFIRMED",
        paymentStatus: "APPROVED",
        transactionId,
        paymentAttempts: (order.paymentAttempts ?? 0) + 1,
    });
    if (updated) {
        void publishOrder(updated);
    }
    return updated;
}

// Registra el pago DECLINED. Aumenta la cantidad de intentos también para llevar el registro por si se hiciera algo con esto a futuro
export function markPaymentDeclined(orderNumber: number): Order | null {
    const order = getEditableOrder(orderNumber);
    if (!order) return getOrderByNumber(orderNumber);

    const updated = updateOrder(orderNumber, {
        paymentStatus: "DECLINED",
        paymentAttempts: (order.paymentAttempts ?? 0) + 1,
    });
    if (updated) {
        void publishOrder(updated);
    }
    return updated;
}

// Caso del ERROR en el pago. Se aumenta la cantidad de intentos y permite volver a intentar porque sigue la orden en PENDING
export function markPaymentError(orderNumber: number): Order | null {
    const order = getEditableOrder(orderNumber);
    if (!order) return getOrderByNumber(orderNumber);

    const updated = updateOrder(orderNumber, {
        paymentStatus: "ERROR",
        paymentAttempts: (order.paymentAttempts ?? 0) + 1,
    });
    if (updated) {
        void publishOrder(updated);
    }
    return updated;
}

// Este estado sería cuando ya falla o se va a abandonar del todo. Tal vez se podría implementar otro estado a futuro pero con este es suficiente de momento.
export function markOrderFailed(orderNumber: number): Order | null {
    const order = getEditableOrder(orderNumber);
    if (!order) return getOrderByNumber(orderNumber);

    const updated = updateOrder(orderNumber, { orderStatus: "FAILED" });
    if (updated) {
        void publishOrder(updated);
    }
    return updated;
}