import type { ChartPeriod, PortfolioHistoryPoint } from "@/types/investments";
import type { FinancialAccountState } from "@/types/trading";
import { initialAccount, portfolioValue } from "./engine";
export function operationHistory(
  state: FinancialAccountState,
  period: ChartPeriod,
): PortfolioHistoryPoint[] {
  const executions = state.executions;
  const first = executions[0];
  if (!first) return [];
  let timestamp = Date.parse(first.date) - 1;
  const points = [{ date: new Date(timestamp).toISOString(), value: portfolioValue(initialAccount()) / 100 }];
  for (const execution of executions) {
    timestamp = Math.max(Date.parse(execution.date), timestamp + 1);
    points.push({ date: new Date(timestamp).toISOString(), value: execution.portfolioValueCents / 100 });
  }
  const days: Record<ChartPeriod, number> = {
    "1D": 1,
    "1S": 7,
    "1M": 30,
    "3M": 90,
    "1A": 365,
    Todo: Infinity,
  };
  const end = Date.parse(points[points.length - 1].date);
  const cutoff = end - days[period] * 86400000;
  const before = points
    .filter((point) => Date.parse(point.date) < cutoff)
    .at(-1);
  const current = points.filter((point) => Date.parse(point.date) >= cutoff);
  return before
    ? [{ ...before, date: new Date(cutoff).toISOString() }, ...current]
    : points;
}
