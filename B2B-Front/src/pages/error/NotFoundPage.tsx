import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <p className="text-6xl font-extrabold text-slate-300">404</p>
      <h2 className="text-xl font-bold text-slate-800">Página no encontrada</h2>
      <p className="text-sm text-slate-500">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
      >
        Volver al catálogo
      </Link>
    </div>
  );
}
