"use client";
import { useState } from "react";
import { SearchX, Star, CircleAlert, Inbox } from "lucide-react";
import type { AssetCategory } from "@/types/investments";
import { assets } from "@/lib/mocks/assets";
import { filterAssets } from "@/lib/investments/catalog";
import { useWatchlist } from "@/lib/investments/watchlist";
import { InvestmentSearch } from "./InvestmentSearch";
import { AssetCategoryFilter } from "./AssetCategoryFilter";
import { AssetList } from "./AssetList";
import { PortfolioSkeleton } from "../PortfolioSkeleton";
type CatalogState = "ready" | "loading" | "error" | "empty";
export function AssetExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AssetCategory | "all">("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [state, setState] = useState<CatalogState>("ready");
  const { favorites, storageFailed } = useWatchlist();
  const filtered = filterAssets(
    assets,
    query,
    category,
    onlyFavorites ? favorites : undefined,
  );
  const reset = () => {
    setQuery("");
    setCategory("all");
    setOnlyFavorites(false);
    setState("ready");
  };
  return (
    <main id="contenido" className="investments-dashboard asset-explorer">
      <div>
        <h2>Encontrá tu próxima inversión</h2>
        <p className="inv-subtitle">
          Conocé empresas y alternativas, a tu ritmo.
        </p>
      </div>
      <p className="asset-demo-note">
        Precios simulados en ARS · Escenario al 28/10/2026.
        <br />
        No son cotizaciones actuales ni recomendaciones.
      </p>
      <section className="explorer-filters" aria-label="Buscar y filtrar">
        <InvestmentSearch value={query} onChange={setQuery} />
        <AssetCategoryFilter value={category} onChange={setCategory} />
        <button
          className="watchlist-filter"
          aria-pressed={onlyFavorites}
          onClick={() => setOnlyFavorites(!onlyFavorites)}
        >
          <Star size={17} fill={onlyFavorites ? "currentColor" : "none"} /> Mis
          favoritos <span>{favorites.length}</span>
        </button>
        <p className="inv-caption">
          Tu lista de seguimiento no representa inversiones compradas.
        </p>
        {storageFailed && (
          <p role="status" className="inv-caption">
            No se pudo guardar en este navegador. Tus favoritos se conservan
            durante esta sesión.
          </p>
        )}
      </section>
      <details className="demo-controls">
        <summary>Probar estados del catálogo</summary>
        <div role="group" aria-label="Estado del catálogo">
          {(
            [
              { value: "ready", label: "Catálogo" },
              { value: "loading", label: "Cargando activos" },
              { value: "error", label: "Error de carga" },
              { value: "empty", label: "Catálogo vacío" },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              aria-pressed={state === item.value}
              onClick={() => setState(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </details>
      {state === "loading" ? (
        <>
          <PortfolioSkeleton />
          <button
            className="inv-secondary-button"
            onClick={() => setState("ready")}
          >
            Finalizar carga simulada
          </button>
        </>
      ) : state === "error" ? (
        <section className="inv-panel catalog-empty" role="alert">
          <CircleAlert size={32} />
          <h2>No pudimos cargar los activos</h2>
          <p>Es un error simulado. Podés volver a intentarlo.</p>
          <button className="primary-button" onClick={() => setState("ready")}>
            Reintentar
          </button>
        </section>
      ) : state === "empty" ? (
        <section className="inv-panel catalog-empty">
          <Inbox size={32} />
          <h2>El catálogo está vacío</h2>
          <p>No hay instrumentos en este escenario de prueba.</p>
          <button className="primary-button" onClick={reset}>
            Restaurar catálogo de demo
          </button>
        </section>
      ) : (
        <>
          <p className="inv-caption" role="status">
            {filtered.length}{" "}
            {filtered.length === 1 ? "instrumento" : "instrumentos"} encontrados
          </p>
          {filtered.length ? (
            <AssetList assets={filtered} />
          ) : (
            <section className="inv-panel catalog-empty">
              {onlyFavorites && favorites.length === 0 ? (
                <>
                  <Star size={32} />
                  <h2>Todavía no tenés favoritos</h2>
                  <p>
                    Tocá la estrella de un instrumento para seguirlo acá.
                    Agregarlo no realiza una compra.
                  </p>
                </>
              ) : (
                <>
                  <SearchX size={32} />
                  <h2>No encontramos resultados</h2>
                  <p>
                    Probá con el nombre, el símbolo o una categoría distinta.
                  </p>
                </>
              )}
              <button className="primary-button" onClick={reset}>
                Ver todos los instrumentos
              </button>
            </section>
          )}
        </>
      )}
      <p className="demo-footer">
        Demo no oficial · Sin afiliación a Mercado Pago.
        <br />
        Todos los precios e históricos son ficticios.
      </p>
    </main>
  );
}
