import { useAuth } from "../auth/useAuth";
import { B2B_MINIMUM_VEHICLES } from "../cart/b2bEligibility";

export default function B2BMinimumNotice({ className = "" }: { className?: string }) {
  const { role } = useAuth();

  if (role !== "B2B") return null;

  return (
    <p
      role="note"
      className={`rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-900 ${className}`}
    >
      Condición B2B: el precio mayorista se aplica al comprar {B2B_MINIMUM_VEHICLES} o más vehículos en la misma orden, sin importar el modelo.
    </p>
  );
}