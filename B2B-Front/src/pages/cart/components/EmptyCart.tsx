import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { errorMessages } from "../../../lib/errorMessages";

export default function EmptyCart() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <ShoppingCartIcon className="h-16 w-16 text-slate-300" />
      <h2 className="text-xl font-bold text-slate-800">
        {errorMessages.emptyCart.title}
      </h2>
      <p className="text-sm text-slate-500">{errorMessages.emptyCart.text}</p>
      <Link
        to="/"
        className="mt-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
      >
        Volver al catálogo
      </Link>
    </div>
  );
}
