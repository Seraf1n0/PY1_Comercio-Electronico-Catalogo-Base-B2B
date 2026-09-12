import { useState, useEffect } from "react";
import { useRange, type UseRangeProps } from "react-instantsearch";
import { RangeSlider as SpectrumRangeSlider } from "@adobe/react-spectrum";

//Tipo para recibir los parámetros
type RangeSliderFilterProps = {
  pLabel: string;
  rangeProps: UseRangeProps;
  formatValue?: (value: number) => string;
};

//Range slider genérico.
export default function RangeSliderFilter({
  pLabel,
  rangeProps,
  formatValue = (v) => v.toLocaleString("es-CR"),
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
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{formatValue(value.start)}</span>
        <span className="text-sm text-slate-500">{formatValue(value.end)}</span>
      </div>

      <SpectrumRangeSlider
        aria-label={pLabel}
        minValue={min}
        maxValue={max}
        value={value}
        onChange={setValue}
        onChangeEnd={({ start, end }) => refine([start, end])}
        isDisabled={!canRefine}
        UNSAFE_className="my-range-slider"
        UNSAFE_style={{ width: "100%" }}
      />

      {!canRefine && (
        <span className="text-xs text-slate-400">Sin opciones disponibles</span>
      )}
    </div>
  );
}