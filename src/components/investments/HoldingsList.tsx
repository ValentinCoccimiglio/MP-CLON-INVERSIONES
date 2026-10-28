import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  assetHref,
  formatARS,
  formatPercent,
  holdingTotals,
  instrumentLabels,
  signedARS,
} from "@/lib/investments";
import type { Holding } from "@/types/investments";
export function HoldingCard({
  holding,
  hidden,
}: {
  holding: Holding;
  hidden: boolean;
}) {
  const totals = holdingTotals(holding);
  return (
    <li>
      <Link href={assetHref(holding.asset.ticker)} className="holding-card">
        <span
          className={`asset-monogram asset-${holding.asset.category}`}
          aria-hidden="true"
        >
          {holding.asset.monogram}
        </span>
        <div className="holding-content">
          <h3>{holding.asset.name}</h3>
          <p>
            {instrumentLabels[holding.asset.category]} · {holding.asset.ticker}
          </p>
          <strong>{hidden ? "$ ••••••" : formatARS(totals.current)}</strong>
          <span
            className={
              hidden
                ? "inv-caption"
                : totals.result < 0
                  ? "inv-negative"
                  : "inv-positive"
            }
          >
            {hidden
              ? "Resultado oculto"
              : `${totals.result < 0 ? "Pérdida" : "Ganancia"}: ${signedARS(totals.result)} (${formatPercent(totals.rate)})`}
          </span>
        </div>
        <ChevronRight size={17} aria-hidden="true" />
      </Link>
    </li>
  );
}
export function HoldingsList({
  holdings,
  hidden,
}: {
  holdings: Holding[];
  hidden: boolean;
}) {
  return (
    <section
      className="inv-panel holdings-section"
      aria-labelledby="holdings-title"
    >
      <div className="inv-section-heading">
        <h2 id="holdings-title">Mis inversiones</h2>
        <span className="inv-pill">{holdings.length}</span>
      </div>
      <p className="inv-caption">
        Valor actual y resultado total de cada inversión.
      </p>
      <ul className="holdings-list">
        {holdings.map((holding) => (
          <HoldingCard
            key={holding.asset.ticker}
            holding={holding}
            hidden={hidden}
          />
        ))}
      </ul>
    </section>
  );
}
