import { useAuth } from "../auth/useAuth";
import { tierLabel } from "../auth/roleStyles";
import { B2B_MINIMUM_VEHICLES } from "../cart/b2bEligibility";
import { formatColones } from "../cart/cartTotals";
import { getPriceView, type Priceable, type PriceTier } from "../Catalog/pricing/priceView";
import { getPricingIssues, pricingIssueAdminText } from "../Catalog/pricing/priceValidation";
type Size = "sm" | "md" | "lg";

const AMOUNT_SIZE: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
};

function TierChip({ tier }: { tier: PriceTier }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        tier === "B2B" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"
      }`}
    >
      {tierLabel[tier]}
    </span>
  );
}

/**
 * Precio segun el rol del usuario autenticado. Se usa en catalogo, detalle
 * y carrito para que todos muestren exactamente la misma regla.
 *
 * `appliedTier` solo se pasa en el carrito: indica que tarifa se esta
 * cobrando realmente (B2B solo cuando se cumple el minimo de vehiculos).
 */
export default function PriceTag({
  item,
  appliedTier,
  size = "md",
  showNote = true,
  className = "",
}: {
  item: Priceable;
  appliedTier?: PriceTier;
  size?: Size;
  showNote?: boolean;
  className?: string;
}) {
  const { role } = useAuth();
  const view = getPriceView(item, role, appliedTier);

  if (view.status === "unavailable") {
    return (
      <div className={className}>
        <p className={`font-semibold text-slate-500 ${AMOUNT_SIZE[size]}`}>Precio no disponible</p>
        {showNote && <p className="text-xs text-slate-400">Consulta con un asesor.</p>}
      </div>
    );
  }

    if (view.status === "admin") {
    const issues = getPricingIssues(item);
    return (
      <dl className={`space-y-0.5 text-sm ${className}`}>
        {issues.length > 0 && (
          <dd className="rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-700">
            ⚠ {issues.map((code) => pricingIssueAdminText[code]).join(" · ")}
          </dd>
        )}
        <div className="flex items-center justify-between gap-2">
          <dt><TierChip tier="B2C" /></dt>
          <dd className="font-semibold text-slate-800">{view.b2c === null ? "—" : formatColones(view.b2c)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt><TierChip tier="B2B" /></dt>
          <dd className="font-semibold text-violet-700">{view.b2b === null ? "—" : formatColones(view.b2b)}</dd>
        </div>
      </dl>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <TierChip tier={view.tier} />
        {view.savingsPercent ? (
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
            -{view.savingsPercent}%
          </span>
        ) : null}
      </div>
      <p className={`mt-1 font-bold ${view.tier === "B2B" ? "text-violet-800" : "text-blue-800"} ${AMOUNT_SIZE[size]}`}>
        {formatColones(view.amount)}
      </p>
      {view.compareAt !== undefined && (
        <p className="text-xs text-slate-500">
          Precio regular: <span className="line-through">{formatColones(view.compareAt)}</span>
        </p>
      )}
      {showNote && role === "B2B" && view.tier === "B2B" && appliedTier === undefined && (
        <p className="text-xs text-violet-700">
          Aplica al comprar {B2B_MINIMUM_VEHICLES} o más vehículos.
        </p>
      )}
      {showNote && view.pendingB2B !== undefined && (
        <p className="text-xs text-violet-700">
          Precio B2B {formatColones(view.pendingB2B)} al completar {B2B_MINIMUM_VEHICLES} vehículos.
        </p>
      )}
    </div>
  );
}