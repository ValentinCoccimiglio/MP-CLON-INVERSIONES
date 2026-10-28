import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { assets } from "../src/lib/mocks/assets";
import {
  portfolio,
  periods,
  historyForPeriod,
} from "../src/lib/mocks/investments";
import {
  assetHistory,
  filterAssets,
  getAsset,
  normalizeSearch,
} from "../src/lib/investments/catalog";
import { periodChange, portfolioTotals } from "../src/lib/investments";
import {
  WATCHLIST_KEY,
  parseWatchlist,
} from "../src/lib/investments/watchlist";
import { AssetExplorer } from "../src/components/investments/explore/AssetExplorer";
import { AssetDetail } from "../src/components/investments/asset-detail/AssetDetail";

test("catálogo: 12 identidades únicas y obtención segura por ticker", () => {
  assert.equal(assets.length, 12);
  assert.equal(new Set(assets.map((a) => a.id)).size, 12);
  assert.equal(new Set(assets.map((a) => a.ticker)).size, 12);
  assert.equal(getAsset(" aapl ")?.name, "Apple");
  assert.equal(getAsset("KO")?.name, "Coca-Cola");
  assert.equal(getAsset("desconocido"), undefined);
  for (const asset of assets) {
    assert.equal(asset.currency, "ARS");
    assert.ok(asset.price > 0);
    assert.ok(asset.education);
    assert.ok(asset.risks);
  }
});
test("búsqueda: nombre, ticker, acentos, mayúsculas, puntuación y filtros combinados", () => {
  assert.equal(normalizeSearch("  PÁMPA   Energía "), "pampa energia");
  for (const query of ["Apple", " aapl ", "ÁPPlE"])
    assert.equal(filterAssets(assets, query, "all")[0]?.ticker, "AAPL");
  assert.equal(filterAssets(assets, "coca cola", "all")[0]?.ticker, "KO");
  assert.equal(filterAssets(assets, "galicia", "all")[0]?.ticker, "GGAL");
  assert.equal(filterAssets(assets, "MERCADOLIBRE", "all")[0]?.ticker, "MELI");
  assert.equal(filterAssets(assets, "CEDEAR", "all").length, 7);
  assert.equal(filterAssets(assets, "", "acciones").length, 4);
  assert.equal(filterAssets(assets, "", "fondos").length, 1);
  assert.equal(filterAssets(assets, "Apple", "acciones").length, 0);
  assert.equal(filterAssets(assets, "no existe", "all").length, 0);
  assert.equal(filterAssets([], "", "all").length, 0);
  assert.equal(
    filterAssets(assets, "", "all", [assets[1].id])[0]?.ticker,
    "KO",
  );
  assert.equal(filterAssets(assets, "", "all", []).length, 0);
});
test("series por unidad, cambios diarios y cartera usan exactamente los mismos precios", () => {
  for (const asset of assets)
    for (const period of periods) {
      const points = assetHistory(asset, period);
      assert.ok(points.length >= 2);
      assert.equal(points.at(-1)?.value, asset.price);
      assert.ok(
        points.every(
          (p, i) => p.value > 0 && (i === 0 || p.date > points[i - 1].date),
        ),
      );
      if (period === "1D") {
        assert.equal(points[0].value, asset.previousPrice);
        assert.equal(periodChange(points).rate, asset.dayChange);
      }
    }
  for (const holding of portfolio.holdings) {
    assert.equal(holding.currentPrice, getAsset(holding.asset.ticker)?.price);
    assert.equal(holding.asset, getAsset(holding.asset.ticker));
  }
  for (const period of periods) {
    const history = historyForPeriod(period);
    const series = portfolio.holdings.map((h) => assetHistory(h.asset, period));
    history.forEach((point, i) => {
      const sum = portfolio.holdings.reduce(
        (total, h, j) => total + h.quantity * series[j][i].value,
        0,
      );
      assert.ok(Math.abs(point.value - sum) < 0.001);
    });
  }
  assert.equal(portfolioTotals(portfolio).current, 1285450);
  assert.equal(portfolioTotals(portfolio).result, 35450);
});
test("favoritos: rechaza JSON inválido, desconocidos y duplicados", () => {
  assert.deepEqual(parseWatchlist("no es JSON"), []);
  assert.deepEqual(parseWatchlist("{}"), []);
  assert.deepEqual(
    parseWatchlist(
      JSON.stringify([assets[0].id, assets[0].id, "unknown", 3, null]),
    ),
    [assets[0].id],
  );
});
function setup() {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: "http://localhost:3000/inversiones/explorar",
    pretendToBeVisual: true,
  });
  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    self: dom.window,
    HTMLElement: dom.window.HTMLElement,
    ResizeObserver: Observer,
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  Object.assign(dom.window, { ResizeObserver: Observer });
  return dom;
}
test("explorador y detalle: filtros, favoritos persistentes, acceso a operaciones y errores", async () => {
  const dom = setup();
  const container = document.getElementById("root")!;
  let root = createRoot(container);
  const click = async (element: Element | null | undefined) => {
    assert.ok(element);
    await act(async () => {
      (element as HTMLButtonElement).click();
    });
  };
  const button = (label: string) =>
    Array.from(container.querySelectorAll("button")).find(
      (item) => item.textContent?.trim() === label,
    );
  try {
    await act(async () => root.render(<AssetExplorer />));
    assert.equal(container.querySelectorAll(".catalog-item").length, 12);
    await click(button("CEDEARs"));
    assert.equal(container.querySelectorAll(".catalog-item").length, 7);
    await click(button("Acciones argentinas"));
    assert.equal(container.querySelectorAll(".catalog-item").length, 4);
    await click(button("Todos"));
    await click(
      container.querySelector('[aria-label="Agregar Coca-Cola a favoritos"]'),
    );
    assert.deepEqual(JSON.parse(window.localStorage.getItem(WATCHLIST_KEY)!), [
      getAsset("KO")!.id,
    ]);
    await click(container.querySelector(".watchlist-filter"));
    assert.equal(container.querySelectorAll(".catalog-item").length, 1);
    await act(async () => root.unmount());
    root = createRoot(container);
    await act(async () => root.render(<AssetDetail asset={getAsset("KO")!} />));
    assert.ok(
      container.querySelector(
        '[aria-label="Quitar Coca-Cola de favoritos"][aria-pressed="true"]',
      ),
    );
    assert.match(container.textContent!, /Precio simulado por CEDEAR/);
    assert.match(container.textContent!, /ratio de conversión/);
    assert.match(container.textContent!, /Podés perder parte o la totalidad/);
    assert.ok(container.querySelector('a[href="/inversiones/comprar/KO"]'));
    assert.ok(container.querySelector('a[href="/inversiones/vender/KO"]'));
    for (const period of periods) {
      await click(
        Array.from(container.querySelectorAll(".chart-periods button")).find(
          (el) => el.textContent === period,
        ),
      );
      assert.equal(
        container.querySelectorAll(".chart-data tbody tr").length,
        assetHistory(getAsset("KO")!, period).length,
      );
    }
    await click(button("Error de gráfico"));
    assert.ok(container.querySelector('[role="alert"]'));
    await click(button("Reintentar gráfico"));
    assert.ok(container.querySelector(".chart-periods"));
    await click(button("Cargar gráfico"));
    assert.ok(container.querySelector('[aria-busy="true"]'));
    await click(button("Finalizar carga del gráfico"));
    assert.ok(container.querySelector(".chart-periods"));
    await click(
      container.querySelector('[aria-label="Quitar Coca-Cola de favoritos"]'),
    );
    assert.deepEqual(
      JSON.parse(window.localStorage.getItem(WATCHLIST_KEY)!),
      [],
    );
    await act(async () => root.render(<AssetExplorer />));
    await click(container.querySelector(".watchlist-filter"));
    assert.match(container.textContent!, /Todavía no tenés favoritos/);
    await click(button("Ver todos los instrumentos"));
    await click(button("Catálogo vacío"));
    assert.match(container.textContent!, /El catálogo está vacío/);
    await click(button("Restaurar catálogo de demo"));
    assert.equal(container.querySelectorAll(".catalog-item").length, 12);
    await click(button("Error de carga"));
    assert.ok(container.querySelector('[role="alert"]'));
    await click(button("Reintentar"));
    assert.equal(container.querySelectorAll(".catalog-item").length, 12);
    await click(button("Cargando activos"));
    assert.ok(container.querySelector('[aria-busy="true"]'));
    await click(button("Finalizar carga simulada"));
    assert.equal(container.querySelectorAll(".catalog-item").length, 12);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
  }
});
test("favoritos guardados hidratan sin discrepancias con el HTML del servidor", async () => {
  const dom = setup();
  window.localStorage.setItem(
    WATCHLIST_KEY,
    JSON.stringify([getAsset("AAPL")!.id]),
  );
  const container = document.getElementById("root")!;
  container.innerHTML = renderToString(<AssetExplorer />);
  const errors: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, <AssetExplorer />, {
        onRecoverableError: (error) => errors.push(error),
      });
    });
    assert.equal(errors.length, 0);
    assert.ok(
      container.querySelector(
        '[aria-label="Quitar Apple de favoritos"][aria-pressed="true"]',
      ),
    );
  } finally {
    await act(async () => root?.unmount());
    dom.window.close();
  }
});
