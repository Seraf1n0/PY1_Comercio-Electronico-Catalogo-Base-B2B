import { useAuth } from "../auth/useAuth";

export default function B2BMinimumNotice({ className = "" }: { className?: string }) {
  const { role } = useAuth();

  if (role !== "B2B") return null;

  return (
    <p
      role="note"
      className={`rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900 ${className}`}
    >
      Para aplicar precio mayorista debe comprar 4 vehículos sin importar el modelo.
    </p>
  );
}
