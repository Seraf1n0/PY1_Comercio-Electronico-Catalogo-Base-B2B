import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { errorMessages } from "../../lib/errorMessages";

interface UnexpectedErrorProps {
  onRetry?: () => void;
}

export default function UnexpectedError({ onRetry }: UnexpectedErrorProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center animate-fade-in">
      <ExclamationTriangleIcon className="h-16 w-16 text-amber-400" />
      <h2 className="text-xl font-bold text-slate-800">
        {errorMessages.unexpected.title}
      </h2>
      <p className="text-sm text-slate-500">{errorMessages.unexpected.text}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Reintentar
          </button>
        )}
        <Link
          to="/"
          onClick={onRetry}
          className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}
