import assert from "node:assert/strict";
import { test } from "node:test";
import {
  initialAccount,
  quoteTrade,
  placeOrder,
  applyEvent,
  availableCash,
  availableUnits,
  reservedCash,
  financialTotals,
  restoreAccount,
  serializeAccount,
} from "../src/lib/trading/engine";
import { maxBuyQuantity, tradeCosts, parseARS } from "../src/lib/trading/money";
import { getAsset } from "../src/lib/investments/catalog";
const date = "2026-10-28T18:00:00.000Z";
const buy = (budgetCents = 5000000) => ({
  side: "buy" as const,
  ticker: "KO",
  budgetCents,
});
const sell = (quantity: number) => ({
  side: "sell" as const,
  ticker: "KO",
  quantity,
});
test("importes argentinos: centavos exactos y rechazo de entradas inválidas", () => {
  assert.equal(parseARS("50.000,25"), 5000025);
  assert.equal(parseARS("50000"), 5000000);
  assert.equal(parseARS("0,01"), 1);
  for (const input of [
    "",
    "0",
    "-1",
    "abc",
    "1,234",
    "5.00",
    "Infinity",
    "900000000000000000000",
  ])
    assert.throws(() => parseARS(input));
});
test("comisiones: redondeo a centavo, total y neto exactos", () => {
  assert.deepEqual(tradeCosts(100, 1), {
    subtotalCents: 100,
    feeCents: 1,
    buyTotalCents: 101,
    sellNetCents: 99,
  });
  assert.equal(tradeCosts(99, 1).feeCents, 0);
  assert.equal(tradeCosts(1280000, 3).buyTotalCents, 3859200);
  assert.equal(tradeCosts(1280000, 3).sellNetCents, 3820800);
  assert.equal(tradeCosts(1000, 1, 0).feeCents, 0);
});
test("cantidad máxima incluye comisión y respeta lotes mínimos", () => {
  assert.equal(maxBuyQuantity(5000000, 1245000), 3);
  assert.equal(maxBuyQuantity(5000000, 1245000, 0), 4);
  assert.equal(maxBuyQuantity(5000000, 1245000, 50, 2), 2);
  assert.equal(maxBuyQuantity(100, 100), 0);
  assert.equal(maxBuyQuantity(101, 100), 1);
  for (let budget = 0; budget < 20000; budget += 37) {
    const qty = maxBuyQuantity(budget, 127);
    if (qty) assert.ok(tradeCosts(127, qty).buyTotalCents <= budget);
    assert.ok(tradeCosts(127, qty + 1).buyTotalCents > budget);
  }
});
test("validaciones: saldo, mínimo, cantidad, activo y precio", () => {
  const state = initialAccount();
  assert.throws(
    () => quoteTrade(state, buy(state.cashCents + 1)),
    /dinero suficiente/,
  );
  assert.throws(() => quoteTrade(state, buy(1280000)), /no alcanza/);
  for (const quantity of [0, -1, 1.2, NaN, 31])
    assert.throws(() => quoteTrade(state, sell(quantity)));
  assert.throws(() => quoteTrade(state, { ...buy(), ticker: "NO-EXISTE" }));
  assert.throws(() => quoteTrade(state, buy(), 0));
  assert.throws(() => quoteTrade(state, buy(), NaN));
});
test("compra ejecutada: saldo, tenencias, costo ponderado e historial", () => {
  const initial = initialAccount();
  const quote = quoteTrade(initial, buy());
  const next = placeOrder(initial, quote, "buy-1", date);
  assert.equal(quote.quantity, 3);
  assert.equal(quote.remainderCents, 1140800);
  assert.equal(next.cashCents, initial.cashCents - 3859200);
  const position = next.positions.find((p) => p.ticker === "KO")!;
  assert.equal(position.quantity, 33);
  assert.equal(position.costCents, 42859200);
  assert.equal(
    position.averageNumerator / position.averageDenominator,
    42859200 / 33,
  );
  assert.equal(next.executions.length, 1);
  assert.equal(next.orders[0].status, "executed");
  assert.equal(initial.positions.find((p) => p.ticker === "KO")!.quantity, 30);
});
test("venta parcial: neto, costo remanente, promedio y resultado realizado", () => {
  const initial = initialAccount();
  const quote = quoteTrade(initial, sell(10));
  const next = placeOrder(initial, quote, "sell-1", date);
  assert.equal(next.cashCents, initial.cashCents + 12736000);
  const position = next.positions.find((p) => p.ticker === "KO")!;
  assert.equal(position.quantity, 20);
  assert.equal(position.costCents, 26000000);
  assert.equal(
    position.averageNumerator / position.averageDenominator,
    1300000,
  );
  assert.equal(next.executions[0].releasedCostCents, 13000000);
  assert.equal(next.executions[0].realizedCents, -264000);
  assert.equal(financialTotals(next).realizedCents, -264000);
  assert.equal(financialTotals(next).unrealizedCents, 3745000);
});
test("venta total elimina posición y no deja costo residual", () => {
  const initial = initialAccount();
  const next = placeOrder(initial, quoteTrade(initial, sell(30)), "all", date);
  assert.equal(
    next.positions.some((p) => p.ticker === "KO"),
    false,
  );
  assert.equal(next.cashCents, initial.cashCents + 38208000);
  assert.equal(next.executions[0].releasedCostCents, 39000000);
  assert.throws(() => quoteTrade(next, sell(1)));
});
test("ventas sucesivas conservan costo exacto y promedio racional", () => {
  let state = initialAccount();
  state = placeOrder(state, quoteTrade(state, buy()), "buy", date);
  const position = state.positions.find((p) => p.ticker === "KO")!;
  const numerator = position.averageNumerator;
  const denominator = position.averageDenominator;
  let released = 0;
  for (let i = 0; i < 33; i++) {
    state = placeOrder(state, quoteTrade(state, sell(1)), `sell-${i}`, date);
    released += state.executions.at(-1)!.releasedCostCents;
    const remaining = state.positions.find((p) => p.ticker === "KO");
    if (remaining) {
      assert.equal(remaining.averageNumerator, numerator);
      assert.equal(remaining.averageDenominator, denominator);
    }
  }
  assert.equal(released, 42859200);
  assert.equal(availableUnits(state, "KO"), 0);
});
test("reservas: pendientes bloquean saldo y cancelación/rechazo lo liberan", () => {
  const initial = initialAccount();
  const quote = quoteTrade(initial, buy());
  let pending = placeOrder(initial, quote, "pending", date, "pending");
  assert.equal(pending.cashCents, initial.cashCents);
  assert.equal(availableCash(pending), initial.cashCents - quote.totalCents);
  assert.equal(reservedCash(pending), quote.totalCents);
  assert.equal(pending.executions.length, 0);
  assert.throws(() => quoteTrade(pending, buy(initial.cashCents)));
  pending = applyEvent(pending, {
    kind: "transition",
    id: "pending",
    date,
    status: "cancelled",
  });
  assert.equal(availableCash(pending), initial.cashCents);
  assert.equal(pending.executions.length, 0);
  const rejected = placeOrder(initial, quote, "rejected", date, "rejected");
  assert.equal(rejected.cashCents, initial.cashCents);
  assert.equal(reservedCash(rejected), 0);
  assert.deepEqual(rejected.positions, initial.positions);
});
test("reservas de venta, enviada a pendiente a ejecutada y doble ejecución", () => {
  const initial = initialAccount();
  const quote = quoteTrade(initial, sell(20));
  let state = placeOrder(initial, quote, "open", date, "sent");
  assert.equal(availableUnits(state, "KO"), 10);
  assert.throws(() => quoteTrade(state, sell(11)));
  state = applyEvent(state, {
    kind: "transition",
    id: "open",
    date,
    status: "pending",
  });
  state = applyEvent(state, {
    kind: "transition",
    id: "open",
    date,
    status: "executed",
  });
  const again = applyEvent(state, {
    kind: "transition",
    id: "open",
    date,
    status: "executed",
  });
  assert.equal(again, state);
  assert.equal(again.executions.length, 1);
  assert.equal(availableUnits(again, "KO"), 10);
  assert.throws(() =>
    applyEvent(state, {
      kind: "transition",
      id: "open",
      date,
      status: "cancelled",
    }),
  );
});
test("confirmación repetida es idempotente y revisión desactualizada se rechaza", () => {
  const initial = initialAccount();
  const quote = quoteTrade(initial, buy());
  const next = placeOrder(initial, quote, "unique", date);
  assert.equal(placeOrder(next, quote, "unique", date), next);
  assert.throws(() => placeOrder(next, quote, "different", date), /cambiaron/);
  assert.throws(
    () =>
      placeOrder(
        initial,
        { ...quote, totalCents: quote.totalCents - 1 },
        "tamper",
        date,
      ),
    /revisado/,
  );
  assert.throws(
    () =>
      placeOrder(
        initial,
        { ...quote, priceCents: quote.priceCents + 1 },
        "changed",
        date,
      ),
    /precio cambió/,
  );
  assert.throws(
    () => placeOrder(initialAccount("reset-generation"), quote, "reset", date),
    /cambiaron/,
  );
});
test("persistencia versionada reproduce ledger y rechaza datos corruptos", () => {
  let state = initialAccount();
  state = placeOrder(state, quoteTrade(state, buy()), "buy", date);
  state = placeOrder(state, quoteTrade(state, sell(4)), "sell", date);
  assert.deepEqual(restoreAccount(serializeAccount(state)), state);
  for (const raw of [
    "bad",
    "{}",
    "null",
    JSON.stringify({ ...state, version: 2 }),
    JSON.stringify({ ...state, cashCents: state.cashCents + 1 }),
    JSON.stringify({ ...state, positions: [] }),
    JSON.stringify({ ...state, executions: [] }),
  ])
    assert.throws(() => restoreAccount(raw));
  assert.equal(getAsset("KO")!.price, 12800);
});

test("límite del historial conserva espacio de cierre e idempotencia", () => {
  const initial = initialAccount();
  const quote = quoteTrade(initial, buy());
  const sent = placeOrder(initial, quote, "limit", date, "sent");
  // Synthetic boundary fixture: tests capacity rules without 10,000 unrelated events.
  const full = { ...sent, events: Array(10000).fill(sent.events[0]) };
  assert.equal(placeOrder(full, quote, "limit", date, "sent"), full);
  assert.throws(() => placeOrder(full, quoteTrade(full, buy()), "new", date), /límite/);
  assert.throws(() => applyEvent(full, {kind:"transition",id:"limit",date,status:"pending"}), /espacio/);
  for (const status of ["executed", "cancelled", "rejected"] as const) {
    const closed = applyEvent(full, {kind:"transition",id:"limit",date,status});
    assert.equal(closed.orders[0].status, status);
    assert.equal(reservedCash(closed), 0);
  }
  const near = { ...initial, events: Array(9998).fill(sent.events[0]) };
  assert.equal(placeOrder(near, quoteTrade(near, buy()), "last", date).events.length, 10000);
});

test("gráfico de operaciones mantiene el orden con fechas repetidas o reloj atrasado", async () => {
  const { operationHistory } = await import("../src/lib/trading/history");
  let state = initialAccount();
  for (const [i, time] of [date, date, "2026-10-27T18:00:00.000Z"].entries())
    state = placeOrder(state, quoteTrade(state, buy()), `chart-${i}`, time);
  const points = operationHistory(state, "Todo");
  assert.equal(points.length, 4);
  for(let i=1;i<points.length;i++) assert.ok(Date.parse(points[i].date)>Date.parse(points[i-1].date));
  assert.deepEqual(points.slice(1).map(p=>p.value),state.executions.map(e=>e.portfolioValueCents/100));
});
