import type { OrderBuildErrorCode } from "../orders/buildOrder";

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

  /** Confirmaciones del carrito. */
  cart: {
    removeConfirm: {
      question: "¿Quitar este producto del carrito?",
      hint: "La cantidad llegó a 0 y se eliminará del carrito.",
      confirm: "Sí, quitar",
      cancel: "Cancelar",
    },
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
    saveFailed: "No pudimos guardar tu orden. Inténtalo de nuevo.",
  },

  /** Errores al construir una orden desde el checkout. */
  orderBuild: {
    INVALID_ROLE: "Tu sesión no tiene un rol válido para completar la compra.",
    MISSING_BRANCH: "Selecciona una sucursal para completar la compra.",
    EMPTY_CART: "Tu carrito está vacío. Agrega vehículos para continuar.",
    B2B_MINIMUM_NOT_MET:
      "La compra B2B requiere al menos 4 vehículos en la orden.",
    B2B_COMPANY_MISSING:
      "Tu cuenta B2B no tiene una empresa registrada. Contacta al administrador.",
          B2B_COMPANY_INVALID:
      "Los datos de tu empresa (nombre o cédula jurídica) no son válidos. Contacta al administrador.",
    INVALID_PRICE:
      "Uno de los productos no tiene un precio válido en este momento. Revisa tu carrito.",
  } satisfies Record<OrderBuildErrorCode, string>,

  /** Error inesperado de render manejado por el Error Boundary. */
  unexpected: {
    title: "Algo salió mal",
    text: "Ocurrió un error inesperado. Puedes reintentar o volver al catálogo; tu carrito se conserva.",
  },

    /** Ruta bloqueada por RBAC. */
  accessDenied: {
    title: "Acceso denegado",
    text: "No tienes permiso para ver esta sección.",
    action: "Volver al inicio",
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

  /** Inicio y cierre de sesion. */
  auth: {
    emptyLogin: "Escribe tu correo o nombre de usuario.",
    notFound: "No encontramos un usuario con ese correo o nombre de usuario.",
    inactive: "Este usuario está inactivo. Contacta al administrador.",
    invalidRole: "El rol de este usuario no es válido para el catálogo.",
    invalidRecord: "Los datos de este usuario están incompletos.",
    generic: "No se pudo iniciar sesión. Inténtalo de nuevo.",
    demoTitle: "Usuarios de prueba",
    demoHint: "Toca una tarjeta para entrar sin escribir credenciales.",
    logout: "Cerrar sesión",
    sessionEnded: {
      NOT_FOUND: "Tu sesión se cerró porque el usuario ya no existe.",
      INACTIVE: "Tu sesión se cerró porque tu usuario fue desactivado. Contacta al administrador.",
      INVALID_ROLE: "Tu sesión se cerró porque tu usuario ya no tiene un rol válido.",
      INVALID_RECORD: "Tu sesión se cerró porque los datos de tu usuario están incompletos.",
    },
    blockedTitle: "Usuarios sin acceso (casos de prueba)",
    blockedHint: "Estos usuarios existen pero no pueden iniciar sesión. Tócalos para ver el mensaje.",
    blockedReason: {
      NOT_FOUND: "No existe",
      INACTIVE: "Inactivo",
      INVALID_ROLE: "Rol inválido",
      INVALID_RECORD: "Datos incompletos",
    },
  },
} as const;
