import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { appendAudit } from "../../../admin/adminAudit";
import { HIGH_DISCOUNT_WARNING, discountPercent, validatePriceForm } from "../../../admin/priceRules";
import { useAuth } from "../../../auth/useAuth";
import { formatColones } from "../../../cart/cartTotals";
import {
  clearPriceOverride,
  getPriceOverride,
  setPriceOverride,
} from "../../../Catalog/pricing/priceOverrides";
import { isValidPrice } from "../../../Catalog/pricing/priceView";
import type { Product } from "../../../Catalog/types";
import { getProductTitle } from "../../../Catalog/productTitle";

function show(value: number | undefined | null): string {
  return isValidPrice(value) ? formatColones(value) : "Sin precio";
}

/**
 * Operacion simulada "Modificar precio B2C/B2B".
 * Muestra el precio original de Algolia, el vigente y el nuevo antes de guardar.
 */
export default function PriceEditDialog({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const { user } = useAuth();
  const override = getPriceOverride(product.objectID);
  const originalB2C = product.prices?.B2C ?? product.price;
  const originalB2B = product.prices?.B2B;
  const currentB2C = override?.B2C ?? originalB2C;
  const currentB2B = override?.B2B ?? originalB2B;

  const [b2cInput, setB2cInput] = useState(isValidPrice(currentB2C) ? String(currentB2C) : "");
  const [b2bInput, setB2bInput] = useState(isValidPrice(currentB2B) ? String(currentB2B) : "");
  const [saveError, setSaveError] = useState<string | null>(null);

  const { errors, b2c, b2b } = validatePriceForm(b2cInput, b2bInput);
  const hasErrors = Boolean(errors.b2c || errors.b2b);
  const changedB2C = b2c !== null && b2c !== currentB2C;
  const changedB2B = b2b !== null && b2b !== currentB2B;
  const discount = !hasErrors && b2c && b2b ? discountPercent(b2c, b2b) : null;
  const adminName = user?.displayName ?? "Administrador";
  const target = `${getProductTitle(product)} (${product.objectID})`;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const log = (field: string, before: number | undefined, after: number | undefined, reason: string) =>
    appendAudit({
      type: "PRICE",
      adminId: user?.objectID ?? "",
      adminName,
      target,
      field,
      before: show(before),
      after: show(after),
      reason,
    });

  const handleSave = () => {
    if (hasErrors || b2c === null || b2b === null) return;
    if (!setPriceOverride(product.objectID, { B2C: b2c, B2B: b2b }, adminName)) {
      setSaveError("No se pudo guardar el precio. Verifica que el navegador permita almacenamiento local.");
      return;
    }
    if (changedB2C) log("Precio B2C", currentB2C, b2c, "Modificación simulada");
    if (changedB2B) log("Precio B2B", currentB2B, b2b, "Modificación simulada");
    onSaved(
      `Precios actualizados para ${target}: B2C ${show(currentB2C)} → ${show(b2c)}, B2B ${show(currentB2B)} → ${show(b2b)}.`,
    );
  };

  const handleRestore = () => {
    if (!clearPriceOverride(product.objectID)) {
      setSaveError("No se pudo restablecer el precio.");
      return;
    }
    log("Precios B2C/B2B", currentB2B, originalB2B, "Restablecer precio de Algolia");
    onSaved(`Se restableció el precio original de Algolia para ${target}.`);
  };

  const field = (
    id: string,
    label: string,
    value: string,
    setValue: (value: string) => void,
    error: string | undefined,
    original: number | undefined,
  ) => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₡</span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setSaveError(null);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-help`}
          className={`w-full rounded-lg border py-2 pl-7 pr-3 text-sm outline-none focus:ring-2 ${
            error ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:border-amber-500 focus:ring-amber-200"
          }`}
        />
      </div>
      <p id={`${id}-help`} className={`mt-1 text-xs ${error ? "text-red-600" : "text-slate-500"}`}>
        {error ?? `Original en Algolia: ${show(original)}`}
      </p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="price-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              Operación simulada · Modificar precio
            </p>
            <h2 id="price-title" className="mt-1 text-lg font-bold text-slate-900">
              {getProductTitle(product)}
            </h2>
            <p className="text-xs text-slate-500">{product.objectID}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="cursor-pointer rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("price-b2c", "Precio B2C (cliente)", b2cInput, setB2cInput, errors.b2c, originalB2C)}
          {field("price-b2b", "Precio B2B (empresa)", b2bInput, setB2bInput, errors.b2b, originalB2B)}
        </div>

        {!hasErrors && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm" aria-live="polite">
            <p className="font-semibold text-slate-700">Resultado</p>
            <p className="mt-1 text-slate-700">
              B2C: <span className={changedB2C ? "line-through text-slate-400" : ""}>{show(currentB2C)}</span>
              {changedB2C && <strong className="ml-1">→ {show(b2c)}</strong>}
            </p>
            <p className="text-slate-700">
              B2B: <span className={changedB2B ? "line-through text-slate-400" : ""}>{show(currentB2B)}</span>
              {changedB2B && <strong className="ml-1 text-violet-700">→ {show(b2b)}</strong>}
            </p>
            {discount !== null && (
              <p className={`mt-1 text-xs ${discount >= HIGH_DISCOUNT_WARNING ? "font-semibold text-amber-700" : "text-slate-500"}`}>
                Descuento B2B: {discount}%
                {discount >= HIGH_DISCOUNT_WARNING && " · Descuento alto, verifica que sea correcto."}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              El cambio se aplica de inmediato en el catálogo, el carrito y las nuevas órdenes de este navegador.
              Las órdenes ya generadas conservan su precio.
            </p>
          </div>
        )}

        {saveError && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {saveError}
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {override ? (
            <button
              type="button"
              onClick={handleRestore}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
            >
              Restablecer precio de Algolia
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 sm:flex-none"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={hasErrors || (!changedB2C && !changedB2B)}
              onClick={handleSave}
              className="flex-1 cursor-pointer rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              Guardar precios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}