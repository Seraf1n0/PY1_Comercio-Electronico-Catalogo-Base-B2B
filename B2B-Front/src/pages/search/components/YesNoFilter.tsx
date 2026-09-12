
import {
  useToggleRefinement,
  type UseToggleRefinementProps,
} from "react-instantsearch";

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