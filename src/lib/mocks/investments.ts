import type {
  ChartPeriod,
  Portfolio,
  PortfolioHistoryPoint,
} from "@/types/investments";
import { assets } from "./assets";
import { assetHistory } from "@/lib/investments/catalog";
export { assets } from "./assets";
const holding = (ticker: string, quantity: number, averagePrice: number) => {
  const asset = assets.find((item) => item.ticker === ticker);
  if (!asset) throw new Error(`Activo del mock inexistente: ${ticker}`);
  return { asset, quantity, averagePrice, currentPrice: asset.price };
};
export const portfolio: Portfolio = {
  holdings: [
    holding("AAPL", 20, 27000),
    holding("KO", 30, 13000),
    holding("GGAL", 50, 6400),
  ],
};
export const periods: ChartPeriod[] = ["1D", "1S", "1M", "3M", "1A", "Todo"];
export const periodLabels: Record<ChartPeriod, string> = {
  "1D": "hoy",
  "1S": "la última semana",
  "1M": "el último mes",
  "3M": "los últimos 3 meses",
  "1A": "el último año",
  Todo: "todo el período",
};

// La cartera deriva de las mismas series por unidad que usa cada ficha.
export function historyForPeriod(period: ChartPeriod): PortfolioHistoryPoint[] {
  const series = portfolio.holdings.map((holding) =>
    assetHistory(holding.asset, period),
  );
  return series[0].map((point, index) => ({
    date: point.date,
    value:
      Math.round(
        series.reduce(
          (total, points, holdingIndex) =>
            total +
            points[index].value * portfolio.holdings[holdingIndex].quantity,
          0,
        ) * 100,
      ) / 100,
  }));
}
