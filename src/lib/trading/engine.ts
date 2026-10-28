import type {
  FinancialAccountState,
  FinancialEvent,
  OrderStatus,
  TradeDraft,
  TradeQuote,
} from "@/types/trading";
import type { Portfolio } from "@/types/investments";
import { account } from "@/lib/mocks/account";
import { portfolio } from "@/lib/mocks/investments";
import { getAsset } from "@/lib/investments/catalog";
import {
  integer,
  maxBuyQuantity,
  roundRatio,
  toCents,
  tradeCosts,
  TRADE_CONFIG,
} from "./money";
export const MAX_LEDGER_EVENTS = 10000;
export const statusLabels: Record<OrderStatus, string> = {
  sent: "Enviada",
  pending: "Pendiente",
  executed: "Ejecutada",
  cancelled: "Cancelada",
  rejected: "Rechazada",
};
export function initialAccount(
  generation = "initial-v1",
): FinancialAccountState {
  return {
    version: 1,
    generation,
    revision: 0,
    cashCents: toCents(account.balance),
    positions: portfolio.holdings.map((h) => ({
      ticker: h.asset.ticker,
      quantity: h.quantity,
      costCents: toCents(h.averagePrice) * h.quantity,
      averageNumerator: toCents(h.averagePrice) * h.quantity,
      averageDenominator: h.quantity,
    })),
    orders: [],
    executions: [],
    events: [],
  };
}
export const isOpen = (status: OrderStatus) =>
  status === "sent" || status === "pending";
export function reservedCash(state: FinancialAccountState) {
  return state.orders
    .filter((o) => isOpen(o.status) && o.quote.side === "buy")
    .reduce((sum, o) => sum + o.quote.totalCents, 0);
}
export function availableCash(state: FinancialAccountState) {
  return state.cashCents - reservedCash(state);
}
export function availableUnits(state: FinancialAccountState, ticker: string) {
  return (
    (state.positions.find((p) => p.ticker === ticker)?.quantity ?? 0) -
    state.orders
      .filter(
        (o) =>
          isOpen(o.status) &&
          o.quote.side === "sell" &&
          o.quote.ticker === ticker,
      )
      .reduce((sum, o) => sum + o.quote.quantity, 0)
  );
}
export function portfolioValue(state: FinancialAccountState) {
  return state.positions.reduce(
    (sum, p) => sum + p.quantity * toCents(getAsset(p.ticker)!.price),
    0,
  );
}
export function financialTotals(state: FinancialAccountState) {
  const current = portfolioValue(state);
  const cost = state.positions.reduce((sum, p) => sum + p.costCents, 0);
  return {
    currentCents: current,
    costCents: cost,
    unrealizedCents: current - cost,
    realizedCents: state.executions.reduce(
      (sum, e) => sum + e.realizedCents,
      0,
    ),
  };
}
export function accountPortfolio(state: FinancialAccountState): Portfolio {
  return {
    holdings: state.positions.map((p) => ({
      asset: getAsset(p.ticker)!,
      quantity: p.quantity,
      averagePrice: p.averageNumerator / p.averageDenominator / 100,
      currentPrice: getAsset(p.ticker)!.price,
      costBasisCents: p.costCents,
    })),
  };
}
export function quoteTrade(
  state: FinancialAccountState,
  draft: TradeDraft,
  priceOverride?: number,
  feeBps: number = TRADE_CONFIG.feeBps,
): TradeQuote {
  if (!["buy", "sell"].includes(draft.side)) throw new Error("Operación inválida.");
  const asset = getAsset(draft.ticker);
  if (!asset) throw new Error("No encontramos este instrumento.");
  const priceCents = priceOverride ?? toCents(asset.price);
  integer(priceCents, "precio", true);
  const budget =
    draft.side === "buy"
      ? integer(draft.budgetCents ?? 0, "importe", true)
      : null;
  if (budget !== null && budget > availableCash(state))
    throw new Error("No tenés dinero suficiente para esta compra.");
  const quantity =
    budget !== null
      ? maxBuyQuantity(budget, priceCents, feeBps, asset.quantityStep)
      : integer(draft.quantity ?? 0, "cantidad", true);
  if (quantity === 0)
    throw new Error("El monto no alcanza para una unidad y su comisión.");
  if (quantity % asset.quantityStep !== 0)
    throw new Error(`Ingresá unidades en múltiplos de ${asset.quantityStep}.`);
  if (draft.side === "sell" && quantity > availableUnits(state, asset.ticker))
    throw new Error(
      "No tenés esa cantidad de unidades disponibles para vender.",
    );
  const costs = tradeCosts(priceCents, quantity, feeBps);
  const totalCents =
    draft.side === "buy" ? costs.buyTotalCents : costs.sellNetCents;
  if (totalCents <= 0)
    throw new Error("La operación no deja un importe neto positivo.");
  return {
    side: draft.side,
    ticker: asset.ticker,
    quantity,
    priceCents,
    feeBps,
    subtotalCents: costs.subtotalCents,
    feeCents: costs.feeCents,
    totalCents,
    budgetCents: budget,
    remainderCents: budget === null ? 0 : budget - totalCents,
    revision: state.revision,
    generation: state.generation,
  };
}
function validateQuote(
  state: FinancialAccountState,
  quote: TradeQuote,
  replay: boolean,
) {
  if (
    quote.generation !== state.generation ||
    quote.revision !== state.revision
  )
    throw new Error(
      "Tu saldo o tus posiciones cambiaron. Revisá nuevamente la operación.",
    );
  if (!["buy", "sell"].includes(quote.side))
    throw new Error("Operación inválida.");
  const asset = getAsset(quote.ticker);
  if (!asset) throw new Error("No encontramos este instrumento.");
  if (!replay && quote.priceCents !== toCents(asset.price))
    throw new Error("El precio cambió. Volvé a revisar antes de confirmar.");
  if (!replay && quote.feeBps !== TRADE_CONFIG.feeBps)
    throw new Error("Los costos cambiaron. Revisá nuevamente la operación.");
  const expected = quoteTrade(
    state,
    {
      side: quote.side,
      ticker: quote.ticker,
      budgetCents: quote.budgetCents ?? undefined,
      quantity: quote.quantity,
    },
    replay ? quote.priceCents : undefined,
    replay ? quote.feeBps : TRADE_CONFIG.feeBps,
  );
  if (JSON.stringify(expected) !== JSON.stringify(quote))
    throw new Error(
      "El importe revisado cambió. Volvé a revisar la operación.",
    );
}
export function applyEvent(
  state: FinancialAccountState,
  event: FinancialEvent,
  replay = false,
): FinancialAccountState {
  if (
    typeof event.id !== "string" ||
    typeof event.date !== "string" ||
    !event.id ||
    event.id.length > 100 ||
    !Number.isFinite(Date.parse(event.date))
  )
    throw new Error("Identificador o fecha de orden no válidos.");
  if (event.kind === "submit") {
    const existing = state.orders.find((o) => o.id === event.id);
    if (existing) {
      if (JSON.stringify(existing.quote) !== JSON.stringify(event.quote))
        throw new Error("Ese identificador ya pertenece a otra orden.");
      return state;
    }
    // Reserve one future ledger event for closing every open order.
    if (!replay && state.events.length + 2 + state.orders.filter(o => isOpen(o.status)).length > MAX_LEDGER_EVENTS) throw new Error("La demo alcanzó su límite de nuevas órdenes. Podés cerrar las abiertas o restablecer la demo.");
    validateQuote(state, event.quote, replay);
    return {
      ...state,
      revision: state.revision + 1,
      orders: [
        ...state.orders,
        {
          id: event.id,
          quote: event.quote,
          status: "sent",
          createdAt: event.date,
          updatedAt: event.date,
        },
      ],
      events: [...state.events, event],
    };
  }
  const order = state.orders.find((o) => o.id === event.id);
  if (!order) throw new Error("No encontramos esta orden.");
  if (order.status === event.status) return state;
  if (!isOpen(order.status)) throw new Error("Esta orden ya está cerrada.");
  if (!["pending", "executed", "cancelled", "rejected"].includes(event.status))
    throw new Error("Estado de orden no válido.");
  if (!replay && event.status === "pending" && state.events.length + 1 + state.orders.filter(o => isOpen(o.status)).length > MAX_LEDGER_EVENTS) throw new Error("No hay espacio para otra transición. Podés ejecutar, cancelar o rechazar esta orden.");
  if (Date.parse(event.date) < Date.parse(order.updatedAt))
    throw new Error("La fecha de la orden no es válida.");
  let cashCents = state.cashCents;
  let positions = state.positions.map((p) => ({ ...p }));
  let executions = state.executions;
  if (event.status === "executed") {
    const q = order.quote;
    const position = positions.find((p) => p.ticker === q.ticker);
    let releasedCostCents = 0;
    let realizedCents = 0;
    if (q.side === "buy") {
      if (cashCents < q.totalCents)
        throw new Error("No tenés dinero suficiente para esta compra.");
      cashCents -= q.totalCents;
      const quantity = (position?.quantity ?? 0) + q.quantity;
      const costCents = (position?.costCents ?? 0) + q.totalCents;
      integer(quantity, "cantidad", true);
      integer(costCents);
      positions = positions.filter((p) => p.ticker !== q.ticker);
      positions.push({
        ticker: q.ticker,
        quantity,
        costCents,
        averageNumerator: costCents,
        averageDenominator: quantity,
      });
    } else {
      if (!position || position.quantity < q.quantity)
        throw new Error(
          "No tenés esa cantidad de unidades disponibles para vender.",
        );
      const remaining = position.quantity - q.quantity;
      const remainingCost = remaining
        ? roundRatio(
            BigInt(position.averageNumerator) * BigInt(remaining),
            BigInt(position.averageDenominator),
          )
        : 0;
      releasedCostCents = position.costCents - remainingCost;
      realizedCents = q.totalCents - releasedCostCents;
      cashCents = integer(cashCents + q.totalCents);
      position.quantity = remaining;
      position.costCents = remainingCost;
      positions = positions.filter((p) => p.quantity > 0);
    }
    executions = [
      ...executions,
      {
        orderId: order.id,
        date: event.date,
        releasedCostCents,
        realizedCents,
        portfolioValueCents: portfolioValue({ ...state, positions }),
      },
    ];
  }
  return {
    ...state,
    revision: state.revision + 1,
    cashCents,
    positions,
    executions,
    orders: state.orders.map((o) =>
      o.id === order.id
        ? { ...o, status: event.status, updatedAt: event.date }
        : o,
    ),
    events: [...state.events, event],
  };
}
export function placeOrder(
  state: FinancialAccountState,
  quote: TradeQuote,
  id: string,
  date: string,
  scenario: "immediate" | "sent" | "pending" | "rejected" = "immediate",
) {
  const existing = state.orders.find((o) => o.id === id);
  if (existing) {
    if (JSON.stringify(existing.quote) !== JSON.stringify(quote))
      throw new Error("La orden ya existe con otros datos.");
    return state;
  }
  let next = applyEvent(state, { kind: "submit", quote, id, date });
  if (scenario === "sent") return next;
  next = applyEvent(next, {
    kind: "transition",
    id,
    date,
    status: scenario === "immediate" ? "executed" : scenario,
  });
  return next;
}
export function serializeAccount(state: FinancialAccountState) {
  return JSON.stringify(state);
}
export function restoreAccount(raw: string): FinancialAccountState {
  const data: unknown = JSON.parse(raw);
  if (
    !data ||
    typeof data !== "object" ||
    !("version" in data) ||
    data.version !== 1 ||
    !("events" in data) ||
    !Array.isArray(data.events) ||
    data.events.length > MAX_LEDGER_EVENTS * 2
  )
    throw new Error("Datos de demo incompatibles o dañados.");
  if (
    !("generation" in data) ||
    typeof data.generation !== "string" ||
    !data.generation.length ||
    data.generation.length > 100
  )
    throw new Error("Versión de cuenta inválida.");
  let state = initialAccount(data.generation);
  for (const value of data.events) {
    if (
      !value ||
      typeof value !== "object" ||
      !["submit", "transition"].includes(value.kind)
    )
      throw new Error("Historial dañado.");
    state = applyEvent(state, value as FinancialEvent, true);
  }
  if (JSON.stringify(state) !== JSON.stringify(data))
    throw new Error("Los datos guardados no coinciden con el historial.");
  return state;
}
