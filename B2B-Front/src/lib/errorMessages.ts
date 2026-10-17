/**
 * Catalogo central de mensajes para el usuario.
 *
 * Reglas:
 * - Basicamente errores para validaciones, estados, etc.
 * - UNICAMENTE Texto, no HTML ni componentes o saltos de linea, porque se usan para mostrar en plano en el UI.
 */
export const errorMessages = {
  /** Errores de validacion de formularios (checkout y pago). */
  validation: {
    required: "Este campo es obligatorio",
    nameTooShort: "El nombre es demasiado corto",
    nameInvalid: "El nombre solo puede contener letras",
    emailTooShort: "El correo electrónico es demasiado corto",
    emailInvalid: "Ingresa un correo electrónico válido",
    phoneTooShort: "El teléfono debe tener 8 dígitos",
    phoneInvalid: "Ingresa un teléfono válido de 8 dígitos",
    addressTooShort: "La dirección debe tener al menos 10 caracteres",
    provinceRequired: "Selecciona una provincia",
    cantonRequired: "Selecciona un cantón",
  },

  /** Carrito vacio. */
  emptyCart: {
    title: "Tu carrito está vacío",
    text: "Explora el catálogo y agrega vehículos para continuar con tu compra.",
  },

  /** Pago rechazado por el emisor (problema de la tarjeta). */
  paymentDeclined: {
    title: "Tu pago no fue aprobado",
    hint: "Tu orden sigue pendiente y no se realizó ningún cobro. Verifica los datos de la tarjeta e inténtalo de nuevo.",
  },

  /** El servicio de pagos no respondió (error del servicio). */
  paymentServiceError: {
    title: "No pudimos procesar tu pago",
    hint: "Ocurrió un problema con el servicio de pagos. Tu compra no fue completada y no se realizó ningún cobro. Puedes intentarlo de nuevo.",
  },

  /** Estados de una orden que no se puede mostrar. */
  order: {
    notFound: {
      title: "No encontramos tu orden",
      text: "Revisa el enlace o vuelve al catálogo.",
      action: "Volver al catálogo",
    },
    cancelled: {
      title: "Esta orden fue cancelada",
      text: "Puedes volver a tu carrito para iniciar una nueva compra.",
      action: "Ir al carrito",
    },
    notConfirmed: {
      title: "Tu compra aún no está confirmada",
      text: "El pago de esta orden no se ha completado.",
    },
  },

  /** Error inesperado de render manejado por el Error Boundary. */
  unexpected: {
    title: "Algo salió mal",
    text: "Ocurrió un error inesperado. Puedes reintentar o volver al catálogo; tu carrito se conserva.",
  },

  /** Ruta inexistente. */
  notFoundPage: {
    title: "Página no encontrada",
    text: "La página que buscas no existe o fue movida.",
    action: "Volver al catálogo",
  },

  /** Catalogo de productos. */
  catalog: {
    productNotFound: "Producto no encontrado",
    productLoadError: "Ocurrió un error al buscar el producto",
  },
} as const;
