import {
  useRefinementList,
  type UseRefinementListProps,
} from "react-instantsearch";
//Filtros de checkbox, ponen la lista de filtros disponibles a partir del atributo elegido
export default function ToggleFilter(props: UseRefinementListProps) {
  const { items, refine } = useRefinementList(props);

  return (
    <ul>
      {items.map((item) => (
        <li key={item.label}>
          <label>
            <input
              type="checkbox"
              className="checkbox"
              checked={item.isRefined}
              onChange={() => refine(item.value)}
            />
            <span>
              {item.label} ({item.count})
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}