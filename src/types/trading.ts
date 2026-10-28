export type TradeSide = "buy" | "sell";
export type OrderStatus =
  "sent" | "pending" | "executed" | "cancelled" | "rejected";
export interface TradeDraft {
  side: TradeSide;
  ticker: string;
  budgetCents?: number;
  quantity?: number;
}
export interface TradeQuote {
  side: TradeSide;
  ticker: string;
  quantity: number;
  priceCents: number;
  feeBps: number;
  subtotalCents: number;
  feeCents: number;
  totalCents: number;
  budgetCents: number | null;
  remainderCents: number;
  revision: number;
  generation: string;
}
export interface PortfolioPosition {
  ticker: string;
  quantity: number;
  costCents: number;
  averageNumerator: number;
  averageDenominator: number;
}
export interface TradeOrder {
  id: string;
  quote: TradeQuote;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
export interface TradeExecution {
  orderId: string;
  date: string;
  releasedCostCents: number;
  realizedCents: number;
  portfolioValueCents: number;
}
export type FinancialEvent =
  | { kind: "submit"; id: string; quote: TradeQuote; date: string }
  | {
      kind: "transition";
      id: string;
      status: Exclude<OrderStatus, "sent">;
      date: string;
    };
export interface FinancialAccountState {
  version: 1;
  generation: string;
  revision: number;
  cashCents: number;
  positions: PortfolioPosition[];
  orders: TradeOrder[];
  executions: TradeExecution[];
  events: FinancialEvent[];
}
