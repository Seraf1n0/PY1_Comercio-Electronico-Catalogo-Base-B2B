import { useMenu } from "react-instantsearch";


//Código extraído de https://www.algolia.com/doc/api-reference/widgets/menu-select/react
export default function DropdownFilter({ pAtribute }: {pAtribute: string}) {
  const { items, refine } = useMenu({ attribute: pAtribute, limit: 50 }); // Atributo dinámico. El limite está colocado en 50 para que muestre todas.
  const { value: selectedValue } = items.find((item) => item.isRefined) || {
    value: "",
  };
  
  return (
    <select value={selectedValue} onChange={(event) => refine(event.target.value)}>
      <option value="">Todas</option>
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label} ({item.count})
        </option>
      ))}
    </select>
  );
}