import type {
  AssetCategory,
  ChartPeriod,
  InvestmentAsset,
} from "@/types/investments";
import { assets } from "@/lib/mocks/assets";
import { categoryLabels, instrumentLabels } from "@/lib/investments";
export const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
export function getAsset(ticker: string): InvestmentAsset | undefined {
  return assets.find((asset) => asset.ticker === ticker.trim().toUpperCase());
}
export function filterAssets(
  catalog: InvestmentAsset[],
  query: string,
  category: AssetCategory | "all",
  favorites?: readonly string[],
) {
  const words = normalizeSearch(query).split(" ").filter(Boolean);
  return catalog.filter(
    (asset) =>
      (category === "all" || asset.category === category) &&
      (!favorites || favorites.includes(asset.id)) &&
      words.every((word) =>
        normalizeSearch(
          `${asset.name} ${asset.ticker} ${categoryLabels[asset.category]} ${instrumentLabels[asset.category]}`,
        ).includes(word),
      ),
  );
}
export function assetHistory(asset: InvestmentAsset, period: ChartPeriod) {
  const starts: Record<ChartPeriod, string> = {
    "1D": "2026-10-28",
    "1S": "2026-10-21",
    "1M": "2026-09-28",
    "3M": "2026-07-28",
    "1A": "2025-10-28",
    Todo: "2025-04-28",
  };
  return asset.history.filter(
    (point) => point.date.slice(0, 10) >= starts[period],
  );
}
