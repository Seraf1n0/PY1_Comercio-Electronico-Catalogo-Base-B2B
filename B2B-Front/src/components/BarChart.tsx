export interface BarChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  ariaLabel: string;
}

export default function BarChart({ data, ariaLabel }: BarChartProps) {

  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <ul aria-label={ariaLabel} className="flex flex-col gap-3">
      {data.map((item) => (
        <li
          key={item.label}
          className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 sm:grid-cols-[11rem_1fr_3rem]"
        >
          {/* Nombre */}
          <span className="truncate text-xs font-medium text-slate-600 sm:text-sm">
            {item.label}
          </span>

          {/* Barra */}
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>

          {/* Número */}
          <span className="text-right text-sm font-bold tabular-nums text-slate-800">
            {item.value}
          </span>
        </li>
      ))}
    </ul>
  );
}