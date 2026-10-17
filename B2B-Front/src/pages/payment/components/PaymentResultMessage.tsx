import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { errorMessages } from "../../../lib/errorMessages";

type Props = {
  kind: "declined" | "error";
  detail?: string;            // motivo del rechazo (solo para "declined")
  onRetry: () => void;
  disabled?: boolean;
};

const CONTENT = {
  declined: {
    title: errorMessages.paymentDeclined.title,
    hint: errorMessages.paymentDeclined.hint,
    Icon: XCircleIcon,
    style: "border-red-200 bg-red-50 text-red-800",
  },
  error: {
    title: errorMessages.paymentServiceError.title,
    hint: errorMessages.paymentServiceError.hint,
    Icon: ExclamationTriangleIcon,
    style: "border-amber-200 bg-amber-50 text-amber-800",
  },
} as const;

// Mensaje para el rechazo (problema de la tarjeta) y para el error del sistema
// 
export default function PaymentResultMessage({ kind, detail, onRetry, disabled }: Props) {
  const { title, hint, Icon, style } = CONTENT[kind];

  return (
    <div role="alert" className={`rounded-xl border p-4 ${style}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-6 w-6 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{title}</p>
          {kind === "declined" && detail && (
            <p className="mt-1 text-sm font-semibold">Motivo: {detail}</p>
          )}
          <p className="mt-1 text-sm">{hint}</p>
          <button
            type="button"
            onClick={onRetry}
            disabled={disabled}
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-current transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Intentar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
}