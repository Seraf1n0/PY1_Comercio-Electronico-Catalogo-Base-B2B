import { useState } from "react";
import {
  useRefinementList,
  type UseRefinementListProps,
} from "react-instantsearch";

export default function ToggleFilterWithSearchBox(
  props: UseRefinementListProps,
) {
  const { items, refine, searchForItems } = useRefinementList(props);
  const [query, setQuery] = useState("");

  //Con el input se filtra, es parte del componente y no veo que valga la pena traer elotro componente además que no sabría como implementarlo de momento se queda así
  //https://www.algolia.com/doc/api-reference/widgets/refinement-list/react

  const clearSearch = () => {
    setQuery("");
    searchForItems("");
  };

  //Ver en cuanto es bueno el overflow
  return (
    <>
      <div className="p-2 flex flex-col gap-2">
        <input
          type="search"
          className="input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={512}
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            searchForItems(event.currentTarget.value);
          }}
        />
        <div className="h-48 overflow-y-auto ">
          <ul>
            {items.map((item) => (
              <li key={item.label}>
                <label>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={item.isRefined}
                    onChange={() => {
                      refine(item.value);
                      clearSearch();
                    }}
                  />
                  <span>
                    {item.label} ({item.count})
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
