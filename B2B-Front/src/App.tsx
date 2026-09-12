import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import {
  InstantSearch,
  SearchBox,
  Hits,
  HitsPerPage,
} from "react-instantsearch";

import RangeSliderFilter from "./pages/search/components/RangeSliderFilter";
import Pagination from "./pages/search/components/Pagination";
import type { Product } from "./Catalog/types";
import DropdownFilter from "./pages/search/components/DropdownFilter";
import ToggleFilter from "./pages/search/components/ToggleFilter";
import YesNoFilter from "./pages/search/components/YesNoFilter";
import ToggleFilterWithSearchBox from "./pages/search/components/ToggleFilterWithSearchBox";
import ProductDetailPage from "./pages/productDetail/ProductDetailPage";

const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY,
);

//Índice de algolia para que ahora provenga de las variables de entorno
const algoliaIndex: string = import.meta.env.VITE_ALGOLIA_INDEX_NAME;

// Esto es para poder mostrar resultados
function Hit({ hit }: { hit: Product }) {
  return (
    <Link to={`/producto/${hit.objectID}`}>
      <article>
        <img src={hit.images_urls?.[0]} alt={hit.title} />
        <p>{hit.categories?.[0] ?? "Sin categoría"}</p>
        <h1>{hit.title ?? "Sin título"}</h1>
        <p>₡{hit.price?.toLocaleString("es-CR") ?? "N/D"}</p>
      </article>
    </Link>
  );
}

function FiltersList() {
  return (
    <>
      <div>
        <p className="font-semibold">Marca</p>
        <ToggleFilterWithSearchBox attribute="brand" limit={50} />
      </div>

      <div>
        <p className="font-semibold">Categoría</p>
        <ToggleFilterWithSearchBox attribute="categories" limit={50} />
      </div>

      <div>
        <p className="font-semibold">Precio</p>
        <RangeSliderFilter
          pLabel="Precio"
          rangeProps={{ attribute: "price" }}
        />
      </div>

      <div>
        <p className="font-semibold">Color</p>
        <ToggleFilterWithSearchBox attribute="facets.color" limit={50} />
      </div>

      <div>
        <p className="font-semibold"># de puertas</p>
        <ToggleFilter attribute="facets.doors" limit={50} />
      </div>

      <div>
        <p className="font-semibold">Drivetrain</p>
        <ToggleFilterWithSearchBox attribute="facets.drivetrain" limit={50} />
      </div>

      <div>
        <p className="font-semibold">Motor</p>
        <ToggleFilterWithSearchBox attribute="facets.engine" limit={50} />
      </div>

      <div>
        <p className="font-semibold">Tipo de combustible</p>
        <ToggleFilter attribute="facets.fuel_type" />
      </div>

      <div>
        <p className="font-semibold">Capacidad de tanque</p>
        <RangeSliderFilter
          pLabel="Capacidad de Tanque"
          rangeProps={{ attribute: "facets.fuel_capacity_int_value" }}
        />
      </div>

      <div>
        <p className="font-semibold">Velocidad máxima</p>
        <RangeSliderFilter
          pLabel="Velocidad Máxima"
          rangeProps={{ attribute: "facets.max_speed_int_value" }}
        />
      </div>

      <div>
        <p className="font-semibold">CV de potencia</p>
        <RangeSliderFilter
          pLabel="CV"
          rangeProps={{ attribute: "facets.power_int_value" }}
        />
      </div>

      <div>
        <p className="font-semibold">Torque</p>
        <DropdownFilter pAtribute="facets.torque" />
      </div>

      <div>
        <p className="font-semibold">Tracción</p>
        <ToggleFilter attribute="facets.traction" />
      </div>

      <div>
        <p className="font-semibold">Transmisión</p>
        <ToggleFilterWithSearchBox attribute="facets.transmission" limit={50} />
      </div>

      <div>
        <p className="font-semibold">Año</p>
        <RangeSliderFilter
          pLabel="Año"
          rangeProps={{ attribute: "facets.year" }}
        />
      </div>

      <div>
        <p className="font-semibold">En stock</p>
        <YesNoFilter attribute="in_stock" />
      </div>
    </>
  );
}

function SearchView() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-800/90 py-6 shadow-md">
        <h1 className="text-center text-xl font-bold tracking-tight text-white sm:text-2xl">
          Proyecto 1 - Comercio Electronico - Catalogo Base B2B
        </h1>
      </header>

      <InstantSearch searchClient={searchClient} indexName={algoliaIndex}>
        <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col gap-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="drawer w-auto md:hidden">
              <input
                id="my-drawer-1"
                type="checkbox"
                className="drawer-toggle"
              />
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
                  aria-label="close sidebar"
                  className="drawer-overlay"
                ></label>
                <ul className="menu min-h-full w-80 gap-3 bg-white p-4 text-slate-700">
                  <FiltersList />
                </ul>
              </div>
            </div>
            <div className="flex-1">
              <SearchBox
                classNames={{
                  root: "w-full",
                  form: "relative",
                  input:
                    "w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
                  submitIcon:
                    "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-slate-400",
                  resetIcon:
                    "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-slate-400",
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row">
            <aside className="hidden md:flex md:flex-col gap-4 w-72 shrink-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 h-fit">
              <FiltersList />
            </aside>

            <main className="flex flex-1 flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                <span className="text-sm text-slate-500">Resultados</span>
                <HitsPerPage
                  classNames={{
                    root: "container-option",
                    select:
                      "rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-indigo-500",
                  }}
                  items={[
                    { label: "16 por página", value: 16, default: true },
                    { label: "32 por página", value: 32 },
                    { label: "64 por página", value: 64 },
                  ]}
                />
              </div>

              <Hits
                hitComponent={Hit}
                classNames={{
                  list: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
                  item: "rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200",
                }}
              />

              <div className="flex justify-center pt-4">
                <Pagination />
              </div>
            </main>
          </div>
        </div>
      </InstantSearch>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SearchView />} />
        <Route path="/producto/:id" element={<ProductDetailPage />} />
      </Routes>
    </HashRouter>
  );
}
export default App;