
import {
  useToggleRefinement,
  type UseToggleRefinementProps,
} from "react-instantsearch";
//Para algolia el radio button es complicado, entonces se utiliza un checkbox para filtros de true o false
export default function YesNoFilter(props: UseToggleRefinementProps) {
  const { value, refine } = useToggleRefinement(props);

  return (
    <label>
      <input
        type="checkbox"
        className="checkbox"
        checked={value.isRefined}
        onChange={(event) => {
          refine({ isRefined: !event.target.checked });
        }}
      />

      
    </label>
  );

  //<span>{props.attribute}</span>
}