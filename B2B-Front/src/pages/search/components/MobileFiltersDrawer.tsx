import FiltersList from "./FiltersList";

// Drawer lateral (daisyUI) con los filtros, solo visible en móvil
export default function MobileFiltersDrawer() {
  return (
    <div className="drawer w-auto md:hidden">
      <input id="my-drawer-1" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content">
        <label
          htmlFor="my-drawer-1"
          aria-label="Abrir filtros"
          className="btn btn-square shrink-0 rounded-lg border border-slate-300 bg-white text-blue-800 shadow-sm hover:bg-slate-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </label>
      </div>

      <div className="drawer-side z-30">
        <label
          htmlFor="my-drawer-1"
          aria-label="Cerrar filtros"
          className="drawer-overlay"
        ></label>
        <ul className="menu min-h-full w-80 gap-3 bg-white p-4 text-slate-700">
          <FiltersList />
        </ul>
      </div>
    </div>
  );
}