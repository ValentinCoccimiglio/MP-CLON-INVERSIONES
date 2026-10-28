import Link from "next/link";
import {
  assetHref,
  formatARS,
  formatPercent,
  instrumentLabels,
} from "@/lib/investments";
import type { InvestmentAsset } from "@/types/investments";
import { FavoriteButton } from "../FavoriteButton";
export function AssetListItem({ asset }: { asset: InvestmentAsset }) {
  return (
    <li className="catalog-item">
      <Link href={assetHref(asset.ticker)} className="catalog-asset">
        <span
          className={`asset-monogram asset-${asset.category}`}
          aria-hidden="true"
        >
          {asset.monogram}
        </span>
        <div>
          <h3>{asset.name}</h3>
          <p>
            {instrumentLabels[asset.category]} · {asset.ticker}
          </p>
          <strong>
            {formatARS(asset.price)} <small>ARS</small>
          </strong>
          <span
            className={asset.dayChange < 0 ? "inv-negative" : "inv-positive"}
          >
            {asset.dayChange < 0 ? "Bajó" : "Subió"}{" "}
            {formatPercent(asset.dayChange)} hoy
          </span>
        </div>
      </Link>
      <FavoriteButton asset={asset} />
    </li>
  );
}
export function AssetList({ assets }: { assets: InvestmentAsset[] }) {
  return (
    <ul className="asset-catalog">
      {assets.map((asset) => (
        <AssetListItem key={asset.id} asset={asset} />
      ))}
    </ul>
  );
}
