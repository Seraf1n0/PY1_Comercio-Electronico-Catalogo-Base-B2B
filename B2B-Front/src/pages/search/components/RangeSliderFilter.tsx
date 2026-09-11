import { useState, useEffect } from "react";
import { useRange, type UseRangeProps } from "react-instantsearch";
import { RangeSlider as SpectrumRangeSlider } from "@adobe/react-spectrum";

//Tipo para recibir los dos parámetros
type RangeSliderFilterProps = {
  pLabel: string;
  rangeProps: UseRangeProps;
};

export default function RangeSliderFilter({
  pLabel,
  rangeProps,
}: RangeSliderFilterProps) {
  const { start, range, canRefine, refine } = useRange(rangeProps);

  const min = (range.min as number) || 0;
  const max = (range.max as number) || 0;

  const [value, setValue] = useState({ start: min, end: max });

  const from = Math.max(
    min,
    Number.isFinite(start[0] as number) ? (start[0] as number) : min
  );
  const to = Math.min(
    max,
    Number.isFinite(start[1] as number) ? (start[1] as number) : max
  );

  useEffect(() => {
    setValue({ start: from, end: to });
  }, [from, to]);
  
  
  return (
    <SpectrumRangeSlider
      label={pLabel}
      minValue={min}
      maxValue={max}
      value={value}
      onChange={setValue}
      onChangeEnd={({ start, end }) => refine([start, end])}
      isDisabled={!canRefine}
      UNSAFE_className="my-range-slider"
    />
  );
}