import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act } from "react";
import { getAsset } from "../src/lib/investments/catalog";
import {
  accountPortfolio,
  initialAccount,
  quoteTrade,
  restoreAccount,
} from "../src/lib/trading/engine";
import {
  ACCOUNT_KEY,
  confirmTrade,
  getFinancialSnapshot,
  resetFinancialDemo,
  useFinancialAccount,
} from "../src/lib/trading/store";
import { HoldingsList } from "../src/components/investments/HoldingsList";
function ObservedHoldings() {
  const { state } = useFinancialAccount();
  return (
    <HoldingsList holdings={accountPortfolio(state).holdings} hidden={false} />
  );
}
function setup() {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: "http://localhost:3000/inversiones/comprar/KO",
    pretendToBeVisual: true,
  });
  Object.defineProperty(dom.window.navigator, "locks", {configurable: true, value: { request: (_name: string, callback: () => unknown) => Promise.resolve().then(callback) }});
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    self: dom.window,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  dom.window.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  dom.window.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new dom.window.Event("close"));
  };
  return dom;
}
test("recorrido compra y venta: revisión, Home, cartera, historial y persistencia", async () => {
  const dom = setup();
  const { createRoot } = await import("react-dom/client");
  const { TradeFlow } =
    await import("../src/components/investments/trading/TradeFlow");
  const { BalanceCard } = await import("../src/components/home/BalanceCard");
  const { OrderHistory } =
    await import("../src/components/investments/trading/OrderHistory");
  const { DemoProvider } = await import("../src/components/ui/DemoProvider");
  const root = createRoot(document.getElementById("root")!);
  const button = (text: string) =>
    Array.from(document.querySelectorAll("button")).find(
      (el) => el.textContent?.trim() === text,
    );
  const click = async (el: Element | undefined | null) => {
    assert.ok(el, "el control existe");
    await act(async () => {
      (el as HTMLButtonElement).click();
    });
  };
  const input = async (value: string) => {
    const field = document.getElementById("trade-input")!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        dom.window.HTMLInputElement.prototype,
        "value",
      )!.set!.call(field, value);
      field.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    });
  };
  try {
    await act(async () =>
      root.render(
        <DemoProvider>
          <BalanceCard />
          <TradeFlow key="buy" asset={getAsset("KO")!} side="buy" />
          <ObservedHoldings />
          <OrderHistory />
        </DemoProvider>,
      ),
    );
    assert.match(
      document.querySelector(".balance")!.textContent!,
      /245\.850,00/,
    );
    await click(button("Continuar"));
    assert.match(
      document.querySelector("#trade-validation")!.textContent!,
      /Ingresá/,
    );
    await input("50.000,00");
    await click(button("Continuar"));
    assert.match(
      document.querySelector(".trade-flow")!.textContent!,
      /38\.592,00/,
    );
    await click(button("Volver y modificar"));
    assert.equal(
      (document.getElementById("trade-input") as HTMLInputElement).value,
      "50.000,00",
    );
    await click(button("Continuar"));
    await act(async () => {
      button("Confirmar compra simulada")!.click();
      button("Confirmar compra simulada")!.click();
    });
    const bought = getFinancialSnapshot().state;
    assert.equal(bought.cashCents, 20725800);
    assert.equal(bought.positions.find((p) => p.ticker === "KO")?.quantity, 33);
    assert.equal(bought.orders.length, 1);
    assert.equal(bought.executions.length, 1);
    assert.match(
      document.querySelector(".trade-result")!.textContent!,
      /se ejecutó correctamente/,
    );
    assert.match(
      document.querySelector(".balance")!.textContent!,
      /207\.258,00/,
    );
    assert.equal(document.querySelectorAll(".order-list li").length, 1);
    assert.match(
      document.querySelector(".holdings-list")!.textContent!,
      /422\.400,00/,
    );
    await act(async () =>
      root.render(
        <DemoProvider>
          <BalanceCard />
          <TradeFlow key="sell" asset={getAsset("KO")!} side="sell" />
          <ObservedHoldings />
          <OrderHistory />
        </DemoProvider>,
      ),
    );
    await click(button("Vender todo"));
    assert.equal(
      (document.getElementById("trade-input") as HTMLInputElement).value,
      "33",
    );
    await click(button("Continuar"));
    await click(button("Confirmar venta simulada"));
    const sold = getFinancialSnapshot().state;
    assert.equal(sold.cashCents, 62754600);
    assert.equal(
      sold.positions.some((p) => p.ticker === "KO"),
      false,
    );
    assert.equal(sold.orders.length, 2);
    assert.equal(sold.executions.length, 2);
    assert.equal(document.querySelectorAll(".order-list li").length, 2);
    assert.doesNotMatch(
      document.querySelector(".holdings-list")!.textContent!,
      /Coca-Cola/,
    );
    assert.match(
      document.querySelector(".balance")!.textContent!,
      /627\.546,00/,
    );
    const saved = window.localStorage.getItem(ACCOUNT_KEY)!;
    assert.deepEqual(restoreAccount(saved), sold);
    await act(async () => root.render(<BalanceCard />));
    assert.match(
      document.querySelector(".balance")!.textContent!,
      /627\.546,00/,
    );
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
  }
});
test("datos corruptos bloquean operaciones; restablecer requiere confirmar y preserva favoritos", async () => {
  const dom = setup();
  window.localStorage.setItem(ACCOUNT_KEY, "{broken");
  window.localStorage.setItem("mp-demo-watchlist-v1", '["ar-cedears-ko"]');
  const { createRoot } = await import("react-dom/client");
  const { FinancialRecovery } =
    await import("../src/components/investments/trading/AccountControls");
  const root = createRoot(document.getElementById("root")!);
  try {
    await act(async () => root.render(<FinancialRecovery />));
    assert.match(document.body.textContent!, /dañados/);
    await assert.rejects(
      confirmTrade(
        quoteTrade(initialAccount(), {
          side: "buy",
          ticker: "KO",
          budgetCents: 5000000,
        }),
        "corrupt",
      ),
      /dañados/,
    );
    await act(async () => {
      document.querySelector("button")!.click();
    });
    assert.equal(window.localStorage.getItem(ACCOUNT_KEY), "{broken");
    assert.ok(document.querySelector("dialog[open]"));
    await act(async () => {
      Array.from(document.querySelectorAll("button"))
        .find((el) => el.textContent === "Sí, restablecer demo")!
        .click();
    });
    assert.equal(getFinancialSnapshot().error, null);
    assert.equal(getFinancialSnapshot().state.cashCents, 24585000);
    assert.equal(getFinancialSnapshot().state.orders.length, 0);
    assert.equal(
      window.localStorage.getItem("mp-demo-watchlist-v1"),
      '["ar-cedears-ko"]',
    );
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
  }
});
test("falla de persistencia no aplica cambios y confirmaciones concurrentes son idempotentes", async () => {
  const dom = setup();
  try {
    await resetFinancialDemo();
    const before = getFinancialSnapshot().state;
    const quote = quoteTrade(before, {
      side: "buy",
      ticker: "KO",
      budgetCents: 5000000,
    });
    const original = dom.window.Storage.prototype.setItem;
    dom.window.Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    await assert.rejects(
      confirmTrade(quote, "write-failed"),
      /No se aplicó ningún cambio/,
    );
    assert.equal(getFinancialSnapshot().state, before);
    dom.window.Storage.prototype.setItem = original;
    await Promise.all([
      confirmTrade(quote, "same"),
      confirmTrade(quote, "same"),
    ]);
    assert.equal(getFinancialSnapshot().state.orders.length, 1);
    assert.equal(getFinancialSnapshot().state.executions.length, 1);
  } finally {
    dom.window.close();
  }
});

test("saldo persistido hidrata sin errores y reemplaza el saldo inicial", async () => {
  const dom = setup();
  const { placeOrder } = await import("../src/lib/trading/engine");
  const { renderToString } = await import("react-dom/server");
  const { hydrateRoot } = await import("react-dom/client");
  const { BalanceCard } = await import("../src/components/home/BalanceCard");
  const initial = initialAccount();
  const saved = placeOrder(
    initial,
    quoteTrade(initial, { side: "buy", ticker: "KO", budgetCents: 5000000 }),
    "hydrate-order",
    "2026-10-28T18:00:00.000Z",
  );
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(saved));
  const container = document.getElementById("root")!;
  container.innerHTML = renderToString(<BalanceCard />);
  assert.match(container.textContent!, /245\.850,00/);
  const errors: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, <BalanceCard />, {
        onRecoverableError: (error) => errors.push(error),
      });
    });
    assert.equal(errors.length, 0);
    assert.match(
      container.querySelector(".balance")!.textContent!,
      /207\.258,00/,
    );
  } finally {
    await act(async () => root?.unmount());
    dom.window.close();
  }
});

test("sin Web Locks se impide escribir y se conserva la cuenta", async () => {
  const dom = setup();
  try {
    await resetFinancialDemo();
    const saved = window.localStorage.getItem(ACCOUNT_KEY);
    const before = getFinancialSnapshot().state;
    Object.defineProperty(dom.window.navigator, "locks", {configurable:true,value:undefined});
    await assert.rejects(confirmTrade(quoteTrade(before,{side:"buy",ticker:"KO",budgetCents:5000000}),"no-lock"),/Web Locks/);
    assert.equal(window.localStorage.getItem(ACCOUNT_KEY),saved);
    assert.equal(getFinancialSnapshot().state,before);
  } finally { dom.window.close(); }
});
