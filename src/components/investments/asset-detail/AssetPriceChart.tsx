"use client";
import { useState } from "react";
import type { InvestmentAsset } from "@/types/investments";
import { assetHistory } from "@/lib/investments/catalog";
import { PortfolioChart } from "../PortfolioChart";
import { AssetDetailSkeleton } from "./AssetDetailSkeleton";
export function AssetPriceChart({ asset }: { asset: InvestmentAsset }) {
  const [state, setState] = useState<"ready" | "loading" | "error">("ready");
  return (
    <>
      <details className="demo-controls chart-demo-controls">
        <summary>Probar estados del gráfico</summary>
        <div>
          <button
            onClick={() => setState("ready")}
            aria-pressed={state === "ready"}
          >
            Ver gráfico
          </button>
          <button
            onClick={() => setState("loading")}
            aria-pressed={state === "loading"}
          >
            Cargar gráfico
          </button>
          <button
            onClick={() => setState("error")}
            aria-pressed={state === "error"}
          >
            Error de gráfico
          </button>
        </div>
      </details>
      {state === "ready" ? (
        <PortfolioChart
          hidden={false}
          assetMode
          getHistory={(period) => assetHistory(asset, period)}
        />
      ) : state === "loading" ? (
        <>
          <AssetDetailSkeleton />
          <button
            className="inv-secondary-button"
            onClick={() => setState("ready")}
          >
            Finalizar carga del gráfico
          </button>
        </>
      ) : (
        <div className="catalog-empty" role="alert">
          <h2>No pudimos cargar el gráfico</h2>
          <p>
            Es un error de demostración. El precio mostrado también es ficticio.
          </p>
          <button
            className="inv-secondary-button"
            onClick={() => setState("ready")}
          >
            Reintentar gráfico
          </button>
        </div>
      )}
    </>
  );
}
