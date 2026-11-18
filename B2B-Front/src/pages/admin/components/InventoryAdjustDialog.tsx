import { MinusIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { appendAudit } from "../../../admin/adminAudit";
import { useAuth } from "../../../auth/useAuth";
import type { BranchId } from "../../../auth/types";
import { branches, getBranchInfo } from "../../../branch/branches";
import type { Product } from "../../../Catalog/types";
import { MAX_STOCK, validateStockInput } from "../../../admin/stockRules";
import {
  getBaseStock,
  getBranchStock,
  getStockAdjustment,
  setBranchStock,
} from "../../../inventory/inventoryOverrides";

const REASONS = [
  "Recepción de mercadería",
  "Venta en sala / fuera de línea",
  "Corrección de conteo físico",
  "Traslado entre sucursales",
  "Unidad dañada o retirada",
];

export type AdjustResult = { message: string };

/**
 * Dialogo de la operacion simulada "Modificar inventario".
 * Muestra el antes y el despues antes de confirmar, y registra el cambio en la bitacora.
 */
export default function InventoryAdjustDialog({
  product,
  initialBranch,
  onClose,
  onSaved,
}: {
  product: Product;
  initialBranch: BranchId;
  onClose: () => void;
  onSaved: (result: AdjustResult) => void;
}) {
  const { user } = useAuth();
  const [branchId, setBranchId] = useState<BranchId>(initialBranch);
  const current = getBranchStock(product, branchId);
  const base = getBaseStock(product, branchId);
  const adjustment = getStockAdjustment(product.objectID, branchId);
  const [input, setInput] = useState(String(current));
  const [reason, setReason] = useState(REASONS[0]);
  const [saveError, setSaveError] = useState<string | null>(null);

  const validation = validateStockInput(input);
  const next = validation === null ? Number(input) : null;
  const delta = next === null ? 0 : next - current;
  const branchLabel = getBranchInfo(branchId).label;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const changeBranch = (id: BranchId) => {
    setBranchId(id);
    setInput(String(getBranchStock(product, id)));
    setSaveError(null);
  };

  const step = (amount: number) => {
    const value = Number.isInteger(Number(input)) ? Number(input) : current;
    setInput(String(Math.min(MAX_STOCK, Math.max(0, value + amount))));
  };

  const save = (target: number, label: string) => {
    if (!setBranchStock(product, branchId, target)) {
      setSaveError("No se pudo guardar el ajuste. Verifica que el navegador permita almacenamiento local.");
      return;
    }
    appendAudit({
      type: "INVENTORY",
      adminId: user?.objectID ?? "",
      adminName: user?.displayName ?? "Administrador",
      target: `${product.title} (${product.objectID})`,
      field: `Stock ${branchLabel}`,
      before: String(current),
      after: String(target),
      reason: label,
    });
    onSaved({
      message: `Inventario actualizado: ${product.title} en ${branchLabel} pasó de ${current} a ${target} unidades.`,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="adjust-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              Operación simulada · Modificar inventario
            </p>
            <h2 id="adjust-title" className="mt-1 text-lg font-bold text-slate-900">
              {product.title}
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

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-slate-700">Sucursal</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {branches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                aria-pressed={branch.id === branchId}
                onClick={() => changeBranch(branch.id)}
                className={`cursor-pointer rounded-lg px-2 py-2 text-sm font-semibold ring-1 transition ${
                  branch.id === branchId
                    ? "bg-amber-400 text-slate-900 ring-amber-400"
                    : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"
                }`}
              >
                {branch.label}
              </button>
            ))}
          </div>
        </fieldset>

        <dl className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center text-sm">
          <div>
            <dt className="text-xs text-slate-500">Base (Algolia)</dt>
            <dd className="font-semibold text-slate-800">{base}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Ajuste vigente</dt>
            <dd className="font-semibold text-violet-700">
              {adjustment > 0 ? `+${adjustment}` : adjustment}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Stock actual</dt>
            <dd className="font-bold text-slate-900">{current}</dd>
          </div>
        </dl>

        <label htmlFor="new-stock" className="mt-4 block text-sm font-semibold text-slate-700">
          Nuevo stock en {branchLabel}
        </label>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Restar una unidad"
            className="cursor-pointer rounded-lg p-2 ring-1 ring-slate-300 hover:bg-slate-50"
          >
            <MinusIcon className="h-5 w-5" />
          </button>
          <input
            id="new-stock"
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_STOCK}
            step={1}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setSaveError(null);
            }}
            aria-invalid={validation !== null}
            aria-describedby="stock-feedback"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-lg font-semibold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Sumar una unidad"
            className="cursor-pointer rounded-lg p-2 ring-1 ring-slate-300 hover:bg-slate-50"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>

        <div id="stock-feedback" className="mt-2 text-sm" aria-live="polite">
          {validation ? (
            <p className="text-red-600">{validation}</p>
          ) : delta === 0 ? (
            <p className="text-slate-500">Sin cambios respecto al stock actual.</p>
          ) : (
            <p className="text-slate-700">
              Resultado: <strong>{current}</strong> → <strong>{next}</strong>{" "}
              <span className={delta > 0 ? "text-emerald-600" : "text-red-600"}>
                ({delta > 0 ? `+${delta}` : delta} unidades)
              </span>
              {next === 0 && (
                <span className="block text-amber-700">
                  El producto quedará sin stock en {branchLabel} y los clientes no podrán comprarlo ahí.
                </span>
              )}
            </p>
          )}
        </div>

        <label htmlFor="adjust-reason" className="mt-4 block text-sm font-semibold text-slate-700">
          Motivo
        </label>
        <select
          id="adjust-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
        >
          {REASONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        {saveError && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {saveError}
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {adjustment !== 0 ? (
            <button
              type="button"
              onClick={() => save(base, "Restablecer al stock base")}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
            >
              Restablecer a base ({base})
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
              disabled={validation !== null || delta === 0}
              onClick={() => next !== null && save(next, reason)}
              className="flex-1 cursor-pointer rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              Guardar ajuste
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}