import { useClearRefinements } from "react-instantsearch";

export default function ClearFiltersButton() {
  const { refine, canRefine } = useClearRefinements();
  if (!canRefine) return null;

  return (
    <button
      type="button"
      onClick={() => refine()}
      className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
    >
      Borrar filtros
    </button>
  );
}