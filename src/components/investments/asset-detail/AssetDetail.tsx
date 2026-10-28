"use client";
import Link from "next/link";
import { useFinancialAccount } from "@/lib/trading/store";
import { availableUnits } from "@/lib/trading/engine";

import type { InvestmentAsset } from "@/types/investments";
import {
  formatARS,
  formatPercent,
  instrumentLabels,
  changeBetween,
  signedARS,
} from "@/lib/investments";
import { useWatchlist } from "@/lib/investments/watchlist";
import { FavoriteButton } from "../FavoriteButton";
import { AssetPriceChart } from "./AssetPriceChart";
import {
  AssetEducation,
  AssetInformation,
  AssetRiskNotice,
} from "./AssetInformation";
export function AssetDetail({ asset }: { asset: InvestmentAsset }) {
  const { state, error: accountError } = useFinancialAccount();
  const units = accountError ? 0 : availableUnits(state, asset.ticker);
  const { storageFailed } = useWatchlist();
  const change = changeBetween(asset.price, asset.previousPrice);
  return (
    <main id="contenido" className="investments-dashboard asset-detail">
      <section className="inv-panel">
        <div className="asset-detail-identity">
          <span
            className={`asset-monogram asset-${asset.category}`}
            aria-hidden="true"
          >
            {asset.monogram}
          </span>
          <div>
            <h2>{asset.name}</h2>
            <p>
              {instrumentLabels[asset.category]} · {asset.ticker}
            </p>
          </div>
          <FavoriteButton asset={asset} />
        </div>
        {storageFailed && (
          <p className="inv-caption" role="status">
            No se pudo guardar el favorito. Se conserva solo durante esta
            sesión.
          </p>
        )}
        <p className="asset-unit">
          Precio simulado por{" "}
          {asset.category === "cedears"
            ? "CEDEAR"
            : asset.category === "fondos"
              ? "cuotaparte"
              : "acción"}
        </p>
        <p className="portfolio-value">
          {formatARS(asset.price)} <small>ARS</small>
        </p>
        <p
          className={`asset-daily-change ${change.result < 0 ? "inv-negative" : "inv-positive"}`}
        >
          {change.result < 0 ? "Bajó" : "Subió"} {signedARS(change.result)} (
          {formatPercent(change.rate)}) hoy
        </p>
        <p className="inv-caption">
          Es el cambio del precio, no tu ganancia personal.
        </p>
        <AssetPriceChart asset={asset} />
      </section>
      <section className="inv-panel asset-description">
        <h2>
          {asset.category === "fondos"
            ? "Conocé este fondo"
            : "Conocé esta empresa"}
        </h2>
        <p>{asset.description}</p>
      </section>
      <AssetEducation asset={asset} />
      <AssetInformation asset={asset} />
      <AssetRiskNotice asset={asset} />
      <p className="demo-footer">
        Demo no oficial · Sin afiliación a Mercado Pago.
        <br />
        Precios e históricos ficticios al 28/10/2026.
        <br />
        No son cotizaciones actuales.
      </p>
      <div className="asset-buy-bar">
        <div className="asset-trade-actions">
          <Link
            className="primary-button"
            href={`/inversiones/comprar/${asset.ticker}`}
          >
            Comprar
          </Link>
          {units > 0 && (
            <Link
              className="inv-secondary-button"
              href={`/inversiones/vender/${asset.ticker}`}
            >
              Vender
            </Link>
          )}
        </div>
        <span>Demo · Operaciones simuladas</span>
      </div>
    </main>
  );
}
