import  { useState, useEffect } from "react";
import { useRange } from "react-instantsearch";
import { RangeSlider as SpectrumRangeSlider } from "@adobe/react-spectrum";

// …

export default function PriceRange() {
  const { start, range, canRefine, refine } = useRange({ attribute: "price"});
  const min = (range.min as number) || 0;
  const max = (range.max as number) || 0;
  const [value, setValue] = useState({
    start: min,
    end: max,
  });

  const from = Math.max(min, Number.isFinite(start[0] as number) ? (start[0] as number): min);
  const to = Math.min(max, Number.isFinite(start[1] as number) ? (start[1] as number) : max);

  useEffect(() => {
    setValue({ start: from, end: to });
  }, [from, to]);

  return (
    <SpectrumRangeSlider
      label="Price range"
      minValue={min}
      maxValue={max}
      value={value}
      onChange={setValue}
      onChangeEnd={({ start, end }) => refine([start, end])}
      isDisabled={!canRefine}
    />
  );
}