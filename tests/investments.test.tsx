import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import {
  assets,
  historyForPeriod,
  periods,
  portfolio,
} from "../src/lib/mocks/investments";
import {
  assetHref,
  formatARS,
  formatPercent,
  holdingTotals,
  periodChange,
  portfolioTotals,
} from "../src/lib/investments";
import { InvestmentsDashboard } from "../src/components/investments/InvestmentsDashboard";
import { PortfolioSummary } from "../src/components/investments/PortfolioSummary";

test("los nominales y precios suman exactamente el capital y valor pedidos", () => {
  const totals = portfolioTotals(portfolio);
  assert.equal(totals.current, 1285450);
  assert.equal(totals.invested, 1250000);
  assert.equal(totals.result, 35450);
  assert.equal(formatPercent(totals.rate), "+2,84%");
  assert.ok(
    portfolio.holdings.some((holding) => holdingTotals(holding).result < 0),
  );
  assert.equal(
    portfolio.holdings.reduce(
      (total, holding) => total + holdingTotals(holding).result,
      0,
    ),
    totals.result,
  );
});

test("los seis períodos son consistentes y comparten valores en fechas coincidentes", () => {
  const all = historyForPeriod("Todo");
  const lookup = new Map(all.map((point) => [point.date, point.value]));
  for (const period of periods) {
    const points = historyForPeriod(period);
    assert.ok(points.length >= 2);
    assert.equal(points.at(-1)?.value, portfolioTotals(portfolio).current);
    assert.ok(
      points.every(
        (point, index) =>
          point.value > 0 &&
          (index === 0 || point.date > points[index - 1].date),
      ),
    );
    if (period !== "1D")
      for (const point of points)
        assert.equal(point.value, lookup.get(point.date));
  }
  assert.equal(periodChange(all).result, portfolioTotals(portfolio).result);
  const previousTotal = portfolio.holdings.reduce(
    (total, holding) =>
      total +
      (holding.quantity * holding.currentPrice) / (1 + holding.asset.dayChange),
    0,
  );
  assert.ok(Math.abs(previousTotal - historyForPeriod("1D")[0].value) < 0.001);
  assert.ok(periodChange(historyForPeriod("1S")).result < 0);
  assert.notEqual(
    periodChange(historyForPeriod("1D")).result,
    periodChange(historyForPeriod("1M")).result,
  );
});

test("las pérdidas totales se comunican con texto, signo y porcentaje", () => {
  const losingPortfolio = {
    holdings: [{ ...portfolio.holdings[0], currentPrice: 26000 }],
  };
  const html = renderToStaticMarkup(
    <PortfolioSummary
      portfolio={losingPortfolio}
      hidden={false}
      onToggle={() => {}}
    />,
  );
  assert.match(html, /Perdiste/);
  assert.match(html, /20\.000,00/);
  assert.match(html, /-3,70/);
});

test("cada activo tiene una ruta única preparada para su futura ficha", () => {
  assert.equal(
    new Set(assets.map((asset) => assetHref(asset.ticker))).size,
    assets.length,
  );
  for (const asset of assets)
    assert.match(assetHref(asset.ticker), /^\/inversiones\/activo\/[A-Z-]+$/);
});

test("dashboard: privacidad, períodos, categorías, vacío, carga y recuperación de error", async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: "http://localhost:3000/inversiones",
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
  const container = document.getElementById("root")!;
  const root = createRoot(container);
  const click = async (button: Element | null) => {
    assert.ok(button, "el control debe existir");
    await act(async () => (button as HTMLButtonElement).click());
  };
  const buttonWithText = (label: string) =>
    Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === label,
    ) ?? null;
  try {
    await act(async () => root.render(<InvestmentsDashboard />));
    assert.match(
      container.querySelector(".portfolio-value")!.textContent!,
      /1\.285\.450,00/,
    );
    assert.equal(container.querySelectorAll(".holding-card").length, 3);
    assert.equal(container.querySelectorAll(".explore-asset").length, 5);
    for (const period of periods) {
      await click(
        Array.from(container.querySelectorAll(".chart-periods button")).find(
          (button) => button.textContent === period,
        ) ?? null,
      );
      assert.match(
        container.querySelector(".chart-change")!.textContent!,
        new RegExp(
          formatARS(
            Math.abs(periodChange(historyForPeriod(period)).result),
          ).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        ),
      );
      assert.equal(
        container.querySelector('.chart-periods [aria-pressed="true"]')!
          .textContent,
        period,
      );
      assert.equal(
        container.querySelectorAll(".chart-data tbody tr").length,
        historyForPeriod(period).length,
      );
    }
    await click(container.querySelector('[aria-label="Ocultar importes"]'));
    assert.doesNotMatch(
      container.textContent!,
      /1\.285\.450|1\.250\.000|35\.450|581\.000|384\.000|320\.450/,
    );
    assert.equal(container.querySelector(".recharts-wrapper"), null);
    assert.equal(container.querySelector(".chart-data"), null);
    await click(container.querySelector('[aria-label="Mostrar importes"]'));
    assert.match(
      container.querySelector(".portfolio-value")!.textContent!,
      /1\.285\.450,00/,
    );
    for (const [label, count] of [
      ["CEDEARs", 5],
      ["Acciones argentinas", 4],
      ["Fondos de inversión", 1],
      ["Todas", 5],
    ] as const) {
      await click(buttonWithText(label));
      assert.equal(container.querySelectorAll(".explore-asset").length, count);
    }
    await click(buttonWithText("Sin inversiones"));
    assert.ok(container.querySelector(".portfolio-empty"));
    assert.equal(container.querySelector(".portfolio-chart"), null);
    assert.equal(container.querySelector(".portfolio-value"), null);
    assert.ok(container.querySelector('a[href="#explore-title"]'));
    assert.equal(
      container.querySelectorAll(".education-card details").length,
      4,
    );
    await click(buttonWithText("Cargando"));
    assert.ok(container.querySelector('[aria-busy="true"]'));
    await click(buttonWithText("Finalizar carga simulada"));
    assert.ok(container.querySelector(".portfolio-value"));
    await click(buttonWithText("Error"));
    assert.match(
      container.querySelector('[role="alert"]')!.textContent!,
      /error simulado/,
    );
    await click(buttonWithText("Reintentar"));
    assert.equal(container.querySelector('[role="alert"]'), null);
    assert.ok(container.querySelector(".portfolio-value"));
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
  }
});
