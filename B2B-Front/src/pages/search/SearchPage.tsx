import {
  InstantSearch,
  SearchBox,
  Hits,
  HitsPerPage,
} from "react-instantsearch";
import { searchClient, algoliaIndex } from "../../lib/algolia";
import CartPreview from "../../components/CartPreview";
import Pagination from "./components/Pagination";
import FiltersList from "./components/FiltersList";
import MobileFiltersDrawer from "./components/MobileFiltersDrawer";
import ClearFiltersButton from "./components/ClearFiltersButton";
import ProductHit from "./components/ProductHit";

// Vista completa de la página de búsqueda
export default function SearchPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid grid-cols-3 items-center bg-white px-4 sm:px-6 py-4 shadow-md">
        <div />
        <h1 className="text-center text-xl font-bold tracking-tight text-blue-800 sm:text-2xl truncate">
          Bombocars
        </h1>

        <div className="flex justify-end">
          <CartPreview />
        </div>
      </div>

      <InstantSearch searchClient={searchClient} indexName={algoliaIndex}>
        <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col gap-4">
          <div className="mb-2 flex items-center gap-2">
            <MobileFiltersDrawer />

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
              <FiltersList collapsible/>
            </aside>

            <main className="flex flex-1 flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                <span className="text-sm text-slate-500">Resultados</span>
                <div className="flex items-center gap-4">
                  <ClearFiltersButton />
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
              </div>

              <Hits
                hitComponent={ProductHit}
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