import { Eye, EyeOff, TrendingDown, TrendingUp } from "lucide-react";
import { formatARS, formatPercent, portfolioTotals } from "@/lib/investments";
import type { Portfolio } from "@/types/investments";
export function PortfolioSummary({
  portfolio,
  hidden,
  onToggle,
}: {
  portfolio: Portfolio;
  hidden: boolean;
  onToggle: () => void;
}) {
  const totals = portfolioTotals(portfolio);
  const negative = totals.result < 0;
  const Trend = negative ? TrendingDown : TrendingUp;
  return (
    <section className="portfolio-summary" aria-labelledby="portfolio-title">
      <div className="inv-section-heading">
        <h2 id="portfolio-title">Tu dinero invertido</h2>
        <button
          className="icon-button"
          onClick={onToggle}
          aria-label={hidden ? "Mostrar importes" : "Ocultar importes"}
          aria-pressed={hidden}
        >
          {hidden ? <EyeOff size={21} /> : <Eye size={21} />}
        </button>
      </div>
      <p className="portfolio-value" aria-live="polite">
        {hidden ? (
          <span aria-label="Importe oculto">$ ••••••</span>
        ) : (
          formatARS(totals.current)
        )}
      </p>
      <p
        className={`portfolio-result ${hidden ? "" : negative ? "inv-negative" : "inv-positive"}`}
      >
        <Trend size={17} aria-hidden="true" />
        {hidden
          ? "Resultado oculto"
          : `${negative ? "Perdiste" : totals.result === 0 ? "Sin cambios:" : "Ganaste"} ${formatARS(Math.abs(totals.result))} en posiciones abiertas (${formatPercent(totals.rate)})`}
      </p>
      <div className="portfolio-capital">
        <span>Capital en posiciones abiertas</span>
        <strong>{hidden ? "$ ••••••" : formatARS(totals.invested)}</strong>
      </div>
      <p className="inv-caption">
        Resultado no realizado: valor actual menos costo de adquisición de las
        posiciones abiertas. Las compras nuevas incluyen la comisión ficticia.
      </p>
    </section>
  );
}
