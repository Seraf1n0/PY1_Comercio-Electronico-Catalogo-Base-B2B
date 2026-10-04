import { useInstantSearch } from "react-instantsearch";

export default function NoResults() {
  const { results, status } = useInstantSearch();

  if (status !== "idle" || results.nbHits > 0) return null;

  return (
    <p className="text-center text-slate-500">No se encontraron resultados</p>
  );
}