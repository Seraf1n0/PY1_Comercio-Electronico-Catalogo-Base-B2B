import { Link } from "react-router-dom";

const informationLinks = [
  { label: "Términos y condiciones", section: "terminos" },
  { label: "Devoluciones y garantía", section: "devoluciones" },
  { label: "Política de envíos", section: "envios" },
  { label: "Política de privacidad", section: "privacidad" },
  { label: "Preguntas frecuentes", section: "faq" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-blue-950 text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-2 md:items-center">
        <div>
          <Link to="/" className="text-xl font-bold text-white hover:text-blue-200">
            Bombocars
          </Link>
          <p className="mt-2 max-w-md text-sm text-blue-100">
            Catálogo de vehículos y atención para nuestros clientes en Costa Rica.
          </p>
        </div>

        <nav aria-label="Información comercial" className="md:justify-self-end">
          <h2 className="font-semibold text-white">Información comercial</h2>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {informationLinks.map(({ label, section }) => (
              <li key={section}>
                <Link
                  to={`/terminos-y-condiciones#${section}`}
                  className="text-blue-100 underline-offset-4 hover:text-white hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-blue-800 px-4 py-4 text-center text-xs text-blue-200">
        © {new Date().getFullYear()} Bombocars. Todos los derechos reservados.
      </div>
    </footer>
  );
}
