export type AssetCategory = "acciones" | "cedears" | "fondos";
export type ChartPeriod = "1D" | "1S" | "1M" | "3M" | "1A" | "Todo";
export interface InvestmentAsset {
  id: string;
  quantityStep: number;
  ticker: string;
  currency: "ARS";
  price: number;
  previousPrice: number;
  description: string;
  education: string;
  risks: string;
  market: string;
  history: AssetPricePoint[];
  name: string;
  category: AssetCategory;
  dayChange: number;
  monogram: string;
}
export interface Holding {
  costBasisCents?: number;
  asset: InvestmentAsset;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
}
export interface Portfolio {
  holdings: Holding[];
}
export interface PortfolioHistoryPoint {
  date: string;
  value: number;
}
export type DemoState = "invested" | "empty" | "loading" | "error";

export type AssetPricePoint = PortfolioHistoryPoint;
export type AssetHistoryPeriod = ChartPeriod;
export type WatchlistItem = InvestmentAsset["id"];
