"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { assets } from "@/lib/mocks/investments";
import {
  assetHref,
  categoryLabels,
  formatPercent,
  instrumentLabels,
} from "@/lib/investments";
import type { AssetCategory } from "@/types/investments";
export function ExploreInvestments() {
  const [category, setCategory] = useState<AssetCategory | "all">("all");
  const filtered = assets.filter(
    (asset) => category === "all" || asset.category === category,
  );
  return (
    <section
      id="explorar"
      className="inv-panel explore-section"
      aria-labelledby="explore-title"
    >
      <h2 id="explore-title" tabIndex={-1}>
        Explorá inversiones
      </h2>
      <p className="inv-subtitle">Conocé distintas formas de invertir.</p>
      <Link className="text-button" href="/inversiones/explorar">
        Buscar y ver todos los instrumentos →
      </Link>
      <div
        className="category-filters"
        role="group"
        aria-label="Filtrar inversiones por categoría"
      >
        <button
          aria-pressed={category === "all"}
          onClick={() => setCategory("all")}
        >
          Todas
        </button>
        {(Object.keys(categoryLabels) as AssetCategory[]).map((key) => (
          <button
            key={key}
            aria-pressed={category === key}
            onClick={() => setCategory(key)}
          >
            {categoryLabels[key]}
          </button>
        ))}
      </div>
      <p className="inv-caption" role="status">
        {filtered.length} instrumentos · Variación diaria ilustrativa
      </p>
      <ul className="explore-list">
        {filtered.slice(0, 5).map((asset) => {
          const Trend = asset.dayChange < 0 ? TrendingDown : TrendingUp;
          return (
            <li key={asset.ticker}>
              <Link href={assetHref(asset.ticker)} className="explore-asset">
                <span
                  className={`asset-monogram asset-${asset.category}`}
                  aria-hidden="true"
                >
                  {asset.monogram}
                </span>
                <div>
                  <h3>{asset.name}</h3>
                  <p>
                    {asset.ticker} · {instrumentLabels[asset.category]}
                  </p>
                  <span
                    className={
                      asset.dayChange < 0 ? "inv-negative" : "inv-positive"
                    }
                  >
                    <Trend size={14} aria-hidden="true" />
                    {asset.dayChange < 0 ? "Bajó" : "Subió"}{" "}
                    {formatPercent(asset.dayChange)}
                  </span>
                </div>
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="inv-caption">
        Precios y variaciones ficticios en pesos. Estos ejemplos no son
        recomendaciones de inversión.
      </p>
    </section>
  );
}
