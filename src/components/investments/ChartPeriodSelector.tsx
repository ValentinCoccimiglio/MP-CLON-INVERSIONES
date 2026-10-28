import { periods, periodLabels } from "@/lib/mocks/investments";
import type { ChartPeriod } from "@/types/investments";
export function ChartPeriodSelector({
  period,
  onChange,
}: {
  period: ChartPeriod;
  onChange: (period: ChartPeriod) => void;
}) {
  return (
    <div
      className="chart-periods"
      role="group"
      aria-label="Período del gráfico"
    >
      {periods.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          aria-pressed={period === item}
          aria-label={`Ver ${periodLabels[item]}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
