import type { TradeQuote } from "@/types/trading";
import { formatCents } from "@/lib/trading/money";
export function TradeFeeBreakdown({
  quote,
  available,
}: {
  quote: TradeQuote;
  available: number;
}) {
  return (
    <dl className="trade-breakdown">
      <div>
        <dt>Precio unitario simulado</dt>
        <dd>{formatCents(quote.priceCents)}</dd>
      </div>
      <div>
        <dt>Unidades enteras</dt>
        <dd>{quote.quantity}</dd>
      </div>
      <div>
        <dt>{quote.side === "buy" ? "Subtotal" : "Importe bruto"}</dt>
        <dd>{formatCents(quote.subtotalCents)}</dd>
      </div>
      <div>
        <dt>
          Comisión ficticia (
          {new Intl.NumberFormat("es-AR").format(quote.feeBps / 100)}%)
        </dt>
        <dd>{formatCents(quote.feeCents)}</dd>
      </div>
      <div className="trade-total">
        <dt>
          {quote.side === "buy"
            ? "Total que vas a utilizar"
            : "Importe neto que recibís"}
        </dt>
        <dd>{formatCents(quote.totalCents)}</dd>
      </div>
      <div>
        <dt>Dinero que te queda disponible</dt>
        <dd>
          {formatCents(
            quote.side === "buy"
              ? available - quote.totalCents
              : available + quote.totalCents,
          )}
        </dd>
      </div>
      {quote.side === "buy" && (
        <div>
          <dt>Sobrante de tu presupuesto</dt>
          <dd>{formatCents(quote.remainderCents)}</dd>
        </div>
      )}
    </dl>
  );
}
