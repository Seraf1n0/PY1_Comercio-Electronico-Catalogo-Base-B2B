import type{ Order } from "../orders/types";




const Orders_key = "orders";

export function getNextOrderNumber(): number {
    const orders = getOrders();
    if (orders.length === 0) {
        return 1;
    }
    return Math.max(...orders.map((order) => order.orderNumber)) + 1;
}



export function getOrders(): Order[] {
    if (typeof window === 'undefined') {
        return [];
    }

    const ord = (localStorage.getItem(Orders_key));
    try {
    if(ord === null) {
        return [];
    } 

    return JSON.parse(ord as string) as Order[];
       
    } catch  (error) {
        console.error("Could not read the orders", error);
        return [];

    }

}

export function saveOrder(order: Order): void {
  if (typeof window === 'undefined') {
    return;
  }

  const currentOrders = getOrders()
  const newOrder = [...currentOrders, order] 
    try {
        window.localStorage.setItem(Orders_key, JSON.stringify(newOrder));
    } catch (error) {
        console.error("Can't push the order", error);
        throw new Error("No pudimos guardar tu orden, intentalo de nuevo");
    }    
  
}

// AQUI pongan las funciones que necesiten en el futuro para guardar, modificar o leer las ordenes

//Esta es de uso interno al momento de invocar a updateOrder
function saveAllOrders(orders: Order[]): void {
    try {
        window.localStorage.setItem(Orders_key, JSON.stringify(orders));
    } catch (error) {
        console.error("Can't save the orders", error);
        throw new Error("No pudimos guardar tu orden, inténtalo de nuevo");
    }
}

// Busca una orden por su número.
//  devuelve null si no existe
export function getOrderByNumber(orderNumber: number): Order | null {
    return getOrders().find((order) => order.orderNumber === orderNumber) ?? null;
}


// Mezcla los cambios con la orden existente y la vuelve a guardar
export function updateOrder(
    orderNumber: number,
    changes: Partial<Order>
): Order | null {
    const orders = getOrders();
    const index = orders.findIndex((order) => order.orderNumber === orderNumber);

    if (index === -1) {
        return null;
    }

    const updated: Order = { ...orders[index], ...changes };
    orders[index] = updated;
    saveAllOrders(orders);
    return updated;
}