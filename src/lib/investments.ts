import type {
  Holding,
  Portfolio,
  PortfolioHistoryPoint,
} from "@/types/investments";
const money = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const percentage = new Intl.NumberFormat("es-AR", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});
export const formatARS = (value: number) => `$ ${money.format(value)}`;
export const formatPercent = (value: number) => percentage.format(value);
export const signedARS = (value: number) =>
  `${value > 0 ? "+" : value < 0 ? "−" : ""}${formatARS(Math.abs(value))}`;
export function changeBetween(current: number, invested: number) {
  const result = current - invested;
  return {
    current,
    invested,
    result,
    rate: invested === 0 ? 0 : result / invested,
  };
}
export function holdingTotals(holding: Holding) {
  return changeBetween(
    holding.quantity * holding.currentPrice,
    holding.costBasisCents !== undefined
      ? holding.costBasisCents / 100
      : holding.quantity * holding.averagePrice,
  );
}
export function portfolioTotals(portfolio: Portfolio) {
  return changeBetween(
    portfolio.holdings.reduce(
      (total, h) => total + holdingTotals(h).current,
      0,
    ),
    portfolio.holdings.reduce(
      (total, h) => total + holdingTotals(h).invested,
      0,
    ),
  );
}
export function periodChange(points: PortfolioHistoryPoint[]) {
  return changeBetween(points.at(-1)?.value ?? 0, points[0]?.value ?? 0);
}
export const assetHref = (ticker: string) =>
  `/inversiones/activo/${encodeURIComponent(ticker)}`;
export const categoryLabels = {
  acciones: "Acciones argentinas",
  cedears: "CEDEARs",
  fondos: "Fondos de inversión",
};
export const instrumentLabels = {
  acciones: "Acción argentina",
  cedears: "CEDEAR",
  fondos: "Fondo de inversión",
};
export function historyDate(date: string, intraday = false) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "UTC",
    ...(intraday
      ? { hour: "2-digit", minute: "2-digit" }
      : { day: "2-digit", month: "short", year: "numeric" }),
  }).format(new Date(date));
}
