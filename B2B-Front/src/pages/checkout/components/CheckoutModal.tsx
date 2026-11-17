import { useEffect, useRef, useState } from "react";
import type { CartItem } from "../../../cart/types";
import {
  getProductSubtotal,
  getIva,
  getOrderTotal,
  formatColones,
} from "../../../cart/cartTotals";
import { getShippingCost } from "../../../cart/shipping";
import { useAnalytics } from "../../../analytics/useAnalytics";
import { useAuth } from "../../../auth/useAuth";
import { useBranch } from "../../../branch/useBranch";
import type { Buyer, Delivery } from "../../../orders/types";
import { saveOrder } from "../../../orders/ordersStorage";
import { buildOrder, OrderBuildError } from "../../../orders/buildOrder";
import { errorMessages } from "../../../lib/errorMessages";
import Spinner from "../../../components/Spinner";
import { Link, useNavigate } from "react-router-dom";
import BuyerForm from "./BuyerForm";
import type {
  BuyerField,
  BuyerFormValues,
  BuyerFormErrors,
} from "./BuyerForm";

// Espera breve para que el spinner sea perceptible antes de navegar al pago.
const CONFIRM_DELAY_MS = 350;

function splitDisplayName(displayName: string): { name: string; lastName: string } {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  return { name: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
};

type CheckoutSteps = "PERSONAL" | "ENTREGA" | "RESUMEN";

const checkoutSteps: { id: CheckoutSteps; label: string }[] = [
  { id: "PERSONAL", label: "Información" },
  { id: "ENTREGA", label: "Entrega" },
  { id: "RESUMEN", label: "Resumen" },
];

const cantonsByProvince: Record<string, string[]> = {
  "San José": [
    "San José",
    "Escazú",
    "Desamparados",
    "Puriscal",
    "Tarrazú",
    "Aserrí",
    "Mora",
    "Goicoechea",
    "Santa Ana",
    "Alajuelita",
    "Vázquez de Coronado",
    "Acosta",
    "Tibás",
    "Moravia",
    "Montes de Oca",
    "Turrubares",
    "Dota",
    "Curridabat",
    "Pérez Zeledón",
    "León Cortés Castro",
  ],
  Alajuela: [
    "Alajuela",
    "San Ramón",
    "Grecia",
    "San Mateo",
    "Atenas",
    "Naranjo",
    "Palmares",
    "Poás",
    "Orotina",
    "San Carlos",
    "Zarcero",
    "Sarchí",
    "Upala",
    "Los Chiles",
    "Guatuso",
    "Río Cuarto",
  ],
  Cartago: [
    "Cartago",
    "Paraíso",
    "La Unión",
    "Jiménez",
    "Turrialba",
    "Alvarado",
    "Oreamuno",
    "El Guarco",
  ],
  Heredia: [
    "Heredia",
    "Barva",
    "Santo Domingo",
    "Santa Bárbara",
    "San Rafael",
    "San Isidro",
    "Belén",
    "Flores",
    "San Pablo",
    "Sarapiquí",
  ],
  Guanacaste: [
    "Liberia",
    "Nicoya",
    "Santa Cruz",
    "Bagaces",
    "Carrillo",
    "Cañas",
    "Abangares",
    "Tilarán",
    "Nandayure",
    "La Cruz",
    "Hojancha",
  ],
  Puntarenas: [
    "Puntarenas",
    "Esparza",
    "Buenos Aires",
    "Montes de Oro",
    "Osa",
    "Quepos",
    "Golfito",
    "Coto Brus",
    "Parrita",
    "Corredores",
    "Garabito",
    "Monteverde",
  ],
  Limón: ["Limón", "Pococí", "Siquirres", "Talamanca", "Matina", "Guácimo"],
};

export default function CheckoutModal({ isOpen, onClose, items }: ModalProps) {
  const navigate = useNavigate();
  const isSubmitting = useRef(false);
  const { track } = useAnalytics();
  const { user } = useAuth();
  const { selectedBranch } = useBranch();
  const checkoutTracked = useRef(false);

  const [activeStep, setActiveStep] = useState<CheckoutSteps>("PERSONAL");
  const initialBuyer = splitDisplayName(user?.displayName ?? "");
  const [name, setName] = useState(initialBuyer.name);
  const [lastName, setLastName] = useState(initialBuyer.lastName);
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  const [province, setProvince] = useState("");
  const [canton, setCanton] = useState("");
  const [isCantonOpen, setIsCantonOpen] = useState(false);
  const cantonDropdownRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState("");

  const [nameError, setNameError] = useState("");
  const [LastnameError, setLastnameError] = useState("");
  const [EmailError, setEmailError] = useState("");
  const [PhoneError, setPhoneError] = useState("");

  const [provinceError, setProvinceError] = useState("");
  const [cantonError, setCantonError] = useState("");
  const [addressError, setAddressError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const provinces = Object.keys(cantonsByProvince);

  const availableCantons = cantonsByProvince[province] || [];
  const activeStepIndex = checkoutSteps.findIndex(
    (step) => step.id === activeStep,
  );
  const subtotalGeneral = getProductSubtotal(items);
  const ivaTotal = getIva(subtotalGeneral);
  const shippingTotal = getShippingCost(items);
  const orderTotal = getOrderTotal(items);
  const buyerCompany = user?.role === "B2B" ? user.company : undefined;

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errorTerms, setErrorTerms] = useState("");

  useEffect(() => {
    if (!isCantonOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !cantonDropdownRef.current?.contains(event.target)
      ) {
        setIsCantonOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsCantonOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCantonOpen]);

  // Registra una sola vez cada apertura del checkout con carrito valido.
  useEffect(() => {
    if (!isOpen) {
      checkoutTracked.current = false;
      return;
    }

    if (checkoutTracked.current || items.length === 0) {
      return;
    }

    checkoutTracked.current = true;
    track("CHECKOUT_START", {
      itemsCount: items.length,
      totalUnits: items.reduce((sum, item) => sum + item.quantity, 0),
      total: getOrderTotal(items),
    });
  }, [isOpen, items, track]);

  const nameAndLastNameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[2-8][0-9]{7}$/;

  const validateName = (value: string) => {
    if (!value.trim()) return errorMessages.validation.required;
    if (value.trim().length < 2) return errorMessages.validation.nameTooShort;
    if (!nameAndLastNameRegex.test(value.trim()))
      return errorMessages.validation.nameInvalid;
    return "";
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) return errorMessages.validation.required;
    if (value.trim().length < 2)
      return errorMessages.validation.emailTooShort;
    if (!emailRegex.test(value.trim()))
      return errorMessages.validation.emailInvalid;
    return "";
  };

  const validatePhone = (value: string) => {
    if (!value.trim()) return errorMessages.validation.required;
    if (value.trim().length < 8) return errorMessages.validation.phoneTooShort;
    if (!phoneRegex.test(value.trim()))
      return errorMessages.validation.phoneInvalid;
    return "";
  };

  const validateAddress = (value: string) => {
    if (!value.trim()) return errorMessages.validation.required;
    if (value.trim().length < 10)
      return errorMessages.validation.addressTooShort;
    return "";
  };

  const handleBuyerChange = (field: BuyerField, value: string) => {
    switch (field) {
      case "name": setName(value); break;
      case "lastName": setLastName(value); break;
      case "email": setEmail(value); break;
      case "phone": setPhone(value); break;
    }
  };

  const handleBuyerBlur = (field: BuyerField) => {
    switch (field) {
      case "name": setNameError(validateName(name)); break;
      case "lastName": setLastnameError(validateName(lastName)); break;
      case "email": setEmailError(validateEmail(email)); break;
      case "phone": setPhoneError(validatePhone(phone)); break;
    }
  };

  const handleNextStep = () => {
    if (activeStep === "PERSONAL") {
      const nameError = validateName(name);
      const lastNameError = validateName(lastName);
      const emailError = validateEmail(email);
      const phoneError = validatePhone(phone);

      setNameError(nameError);
      setLastnameError(lastNameError);
      setEmailError(emailError);
      setPhoneError(phoneError);
      if (
        nameError === "" &&
        lastNameError === "" &&
        emailError === "" &&
        phoneError === ""
      ) {
        setActiveStep("ENTREGA");
      }
    }
  };

  const handleNextStepEntrega = () => {
    const nextProvinceError = province
      ? ""
      : errorMessages.validation.provinceRequired;
    const nextCantonError = canton
      ? ""
      : errorMessages.validation.cantonRequired;
    const nextAddressError = validateAddress(address);

    setProvinceError(nextProvinceError);
    setCantonError(nextCantonError);
    setAddressError(nextAddressError);

    if (!nextProvinceError && !nextCantonError && !nextAddressError) {
      setActiveStep("RESUMEN");
    }
  };

  const confirmOrder = async () => {
    if (!acceptTerms) {
      setErrorTerms("Debes aceptar los términos y condiciones para continuar.");
      return;
    }
    setErrorTerms("");

    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setSubmitting(true);
    setSubmitError("");

    const orderBranchId = selectedBranch ?? user?.defaultBranch ?? null;
    const buyer: Buyer = { name, lastName, email, phone };
    const delivery: Delivery = { address, province, canton, additionalAddress: null };

    try {
      const order = buildOrder({
        user,
        branchId: orderBranchId,
        buyer,
        delivery,
        items,
      });

      // Pequeña espera para que el usuario perciba el estado de carga.
      await new Promise((resolve) => window.setTimeout(resolve, CONFIRM_DELAY_MS));

      saveOrder(order);

      // La orden queda PENDING/PENDING y el usuario pasa a la pantalla de pago.
      navigate(`/pago/${order.orderNumber}`, { replace: true });
    } catch (error) {
      if (error instanceof OrderBuildError) {
        setSubmitError(errorMessages.orderBuild[error.code]);
      } else {
        console.error("No se pudo guardar la orden", error);
        setSubmitError(errorMessages.order.saveFailed);
      }

      isSubmitting.current = false;   // permite reintentar si no se pudo guardar
      setSubmitting(false);
      return;
    }
  };

  const buyerFormValues: BuyerFormValues = { name, lastName, email, phone };
  const buyerFormErrors: BuyerFormErrors = {
    name: nameError,
    lastName: LastnameError,
    email: EmailError,
    phone: PhoneError,
  };

  return isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 animate-fade-in sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl animate-scale-in sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Checkout
            </p>
            <h2
              id="checkout-modal-title"
              className="mt-1 text-2xl font-bold text-slate-900"
            >
              Finalizar compra
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            Cerrar
          </button>
        </div>

        <ol
          aria-label="Progreso del checkout"
          className="mt-7 grid grid-cols-3 gap-2 sm:gap-4"
        >
          {checkoutSteps.map((step, index) => {
            const isCurrent = step.id === activeStep;
            const isComplete = index < activeStepIndex;

            return (
              <li key={step.id}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={index > activeStepIndex}
                    onClick={() => setActiveStep(step.id)}
                    aria-current={isCurrent ? "step" : undefined}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isComplete
                          ? "bg-emerald-100 text-emerald-700"
                          : isCurrent
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isComplete ? "✓" : index + 1}
                    </span>
                    <span
                      className={`text-xs font-semibold sm:text-sm ${
                        isCurrent
                          ? "text-indigo-700"
                          : isComplete
                            ? "text-emerald-700"
                            : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                </div>
                <div
                  className={`mt-2 h-1 rounded-full ${isComplete || isCurrent ? "bg-indigo-600" : "bg-slate-100"}`}
                />
              </li>
            );
          })}
        </ol>

        {activeStep === "PERSONAL" && (
          <div className="mt-8 space-y-6 animate-fade-in-up">
            <BuyerForm
              value={buyerFormValues}
              errors={buyerFormErrors}
              company={buyerCompany}
              onChange={handleBuyerChange}
              onBlur={handleBuyerBlur}
            />

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={handleNextStep}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {activeStep === "ENTREGA" && (
          <div className="mt-8 space-y-6 animate-fade-in-up">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Datos de entrega
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Indica dónde recibirás tu pedido.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="checkout-province"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Provincia
                </label>
                <select
                  id="checkout-province"
                  value={province}
                  onChange={(event) => {
                    setProvince(event.target.value);
                    setCanton("");
                    setIsCantonOpen(false);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecciona una provincia</option>
                  {provinces.map((provinceName) => (
                    <option key={provinceName} value={provinceName}>
                      {provinceName}
                    </option>
                  ))}
                </select>
                {provinceError && (
                  <p className="text-sm text-red-600">{provinceError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  id="checkout-canton-label"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Cantón
                </label>
                <div ref={cantonDropdownRef} className="relative">
                  <button
                    id="checkout-canton"
                    type="button"
                    aria-labelledby="checkout-canton-label"
                    aria-haspopup="listbox"
                    aria-expanded={isCantonOpen}
                    aria-controls="checkout-canton-options"
                    disabled={!province}
                    onClick={() => setIsCantonOpen((open) => !open)}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <span
                      className={canton ? "text-slate-900" : "text-slate-400"}
                    >
                      {canton || "Selecciona un cantón"}
                    </span>
                    <span aria-hidden="true" className="ml-2 text-slate-500">
                      ⌄
                    </span>
                  </button>
                  {isCantonOpen && (
                    <div
                      id="checkout-canton-options"
                      role="listbox"
                      aria-labelledby="checkout-canton-label"
                      className="absolute left-0 top-full z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                    >
                      {availableCantons.map((cantonName) => (
                        <button
                          key={cantonName}
                          type="button"
                          role="option"
                          aria-selected={canton === cantonName}
                          onClick={() => {
                            setCanton(cantonName);
                            setIsCantonOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm transition hover:bg-indigo-50 ${
                            canton === cantonName
                              ? "bg-indigo-50 font-semibold text-indigo-700"
                              : "text-slate-700"
                          }`}
                        >
                          {cantonName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {cantonError && (
                  <p className="text-sm text-red-600">{cantonError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="checkout-address"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Dirección de entrega
                </label>
                <textarea
                  id="checkout-address"
                  name="address"
                  rows={4}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  onBlur={() => setAddressError(validateAddress(address))}
                  aria-invalid={Boolean(addressError)}
                  aria-describedby={
                    addressError ? "checkout-address-error" : undefined
                  }
                  placeholder="Ejemplo: Avenida Central, casa 25, barrio..."
                  className="min-h-28 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {addressError && (
                  <p
                    id="checkout-address-error"
                    className="text-sm text-red-600"
                  >
                    {addressError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={() => setActiveStep("PERSONAL")}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={handleNextStepEntrega}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
        {activeStep === "RESUMEN" && (
          <div className="mt-8 space-y-6 animate-fade-in-up">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Revisa tu pedido
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Confirma los productos y el total antes de finalizar.
              </p>
            </div>

            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-nowrap sm:gap-4 sm:p-4"
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="h-14 w-16 shrink-0 rounded-lg bg-slate-100 object-cover sm:h-20 sm:w-24"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      Cantidad: {item.quantity}
                    </p>
                    <p className="text-sm text-slate-500">
                      Precio unitario: {formatColones(item.price)}
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-between border-t border-slate-100 pt-2 sm:w-auto sm:shrink-0 sm:justify-end sm:border-0 sm:pt-0 sm:text-right">
                    <p className="text-xs text-slate-500 sm:hidden">Subtotal</p>
                    <div>
                      <p className="hidden text-xs text-slate-500 sm:block">
                        Subtotal
                      </p>
                      <p className="text-sm font-bold text-slate-900 sm:mt-1">
                        {formatColones(item.subtotal)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <section
              aria-label="Desglose del pedido"
              className="rounded-xl bg-slate-50 p-4 sm:p-5"
            >
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Subtotal general</span>
                  <span className="font-medium text-slate-900">
                    {formatColones(subtotalGeneral)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>IVA (13%)</span>
                  <span className="font-medium text-slate-900">
                    {formatColones(ivaTotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Costo de envío</span>
                  <span className="font-medium text-slate-900">
                    {formatColones(shippingTotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span>{formatColones(orderTotal)}</span>
                </div>
              </div>
            </section>

            {submitError && (
              <p role="alert" className="text-sm font-semibold text-red-600">
                {submitError}
              </p>

            )}
              <div className="space-y-2"> 
                <label htmlFor="accept-terms" className="flex items-start gap-2">
                  <input type="checkbox"
                    id="accept-terms"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked)
                      if (e.target.checked) setErrorTerms("")
                    }}
                    className="mt-1 h-4 w-4"
                  />
                  <span>He leído y acepto los términos y condiciones</span>
                </label>

                <p className="text-sm">
                  <Link to="/terminos-y-condiciones" 
                  className="text-indigo-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Leer los terminos completos</Link>
                </p>
              { errorTerms && (
                <p role="alert" className="text-sm font-semibold text-red-600">{errorTerms}</p>
              )}                

              </div> 

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setActiveStep("ENTREGA")}
                className="w-full rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer sm:w-auto"
              >
                Atrás
              </button>

              <button
                type="button"
                onClick={() => void confirmOrder()}
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer sm:ml-auto sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Creando tu orden…
                  </>
                ) : (
                  "Confirmar pedido"
                )}
              </button>
            </div>           
          </div>
        )}
      </div>
    </div>
  ) : null;
}
