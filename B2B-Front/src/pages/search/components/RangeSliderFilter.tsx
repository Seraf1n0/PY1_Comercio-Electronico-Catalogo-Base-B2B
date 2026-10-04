import { useState, useEffect } from "react";
import { useRange, type UseRangeProps } from "react-instantsearch";

type RangeSliderFilterProps = {
  pLabel: string;
  rangeProps: UseRangeProps;
  formatValue?: (value: number) => string;
};

export default function RangeSliderFilter({
  pLabel,
  rangeProps,
  formatValue = (v) => v.toLocaleString("es-CR"),
}: RangeSliderFilterProps) {
  const { start, range, canRefine, refine } = useRange(rangeProps);

  const min = (range.min as number) || 0;
  const max = (range.max as number) || 0;

  const from = Math.max(
    min,
    Number.isFinite(start[0] as number) ? (start[0] as number) : min
  );
  const to = Math.min(
    max,
    Number.isFinite(start[1] as number) ? (start[1] as number) : max
  );

  const [value, setValue] = useState({ start: from, end: to });

  useEffect(() => {
    setValue({ start: from, end: to });
  }, [from, to]);

  const span = max - min || 1;
  const leftPct = ((value.start - min) / span) * 100;
  const rightPct = ((value.end - min) / span) * 100;

  const commit = () => refine([value.start, value.end]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{formatValue(value.start)}</span>
        <span className="text-sm text-slate-500">{formatValue(value.end)}</span>
      </div>

      <div className="dual-range">
        {/* Track gris + parte seleccionada */}
        <div className="dual-range-track" />
        <div
          className="dual-range-selected"
          style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
        />

        <input
          type="range"
          aria-label={`${pLabel} mínimo`}
          min={min}
          max={max}
          value={value.start}
          disabled={!canRefine}
          onChange={(e) =>
            setValue((v) => ({
              ...v,
              start: Math.min(Number(e.target.value), v.end),
            }))
          }
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
        />
        <input
          type="range"
          aria-label={`${pLabel} máximo`}
          min={min}
          max={max}
          value={value.end}
          disabled={!canRefine}
          onChange={(e) =>
            setValue((v) => ({
              ...v,
              end: Math.max(Number(e.target.value), v.start),
            }))
          }
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
        />
      </div>

      {!canRefine && (
        <span className="text-xs text-slate-400">Sin opciones disponibles</span>
      )}
    </div>
  );
}