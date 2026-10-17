import { Hits, useInstantSearch } from "react-instantsearch";
import ProductHit from "./ProductHit";
import ProductCardSkeleton from "../../../components/ProductCardSkeleton";

const SKELETON_COUNT = 6;

export default function SearchResults() {
  const { status, results } = useInstantSearch();
  const isLoadingFirstPage =
    status === "loading" && (results?.hits?.length ?? 0) === 0;

  if (isLoadingFirstPage) {
    return (
      <div role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">Cargando resultados…</span>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Hits
      hitComponent={ProductHit}
      classNames={{
        list: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        item: "rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200",
      }}
    />
  );
}
