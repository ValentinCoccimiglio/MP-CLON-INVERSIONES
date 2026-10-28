"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { InvestmentAsset } from "@/types/investments";
import type { TradeQuote, TradeSide } from "@/types/trading";
import { instrumentLabels } from "@/lib/investments";
import {
  availableCash,
  availableUnits,
  quoteTrade,
  statusLabels,
} from "@/lib/trading/engine";
import {
  formatCents,
  parseARS,
  toCents,
  TRADE_CONFIG,
} from "@/lib/trading/money";
import { confirmTrade, useFinancialAccount } from "@/lib/trading/store";
import { AvailableBalance, FinancialRecovery } from "./AccountControls";
import { TradeFeeBreakdown } from "./TradeEstimate";
type Scenario = "immediate" | "sent" | "pending" | "rejected";
export function TradeFlow({
  asset,
  side,
}: {
  asset: InvestmentAsset;
  side: TradeSide;
}) {
  const { state, error: accountError } = useFinancialAccount();
  const [input, setInput] = useState("");
  const [review, setReview] = useState<{
    quote: TradeQuote;
    id: string;
    available: number;
    scenario: Scenario;
  } | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [scenario, setScenario] = useState<Scenario>("immediate");
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const advanced = useRef(false);
  useEffect(() => {
    if (review || resultId) {
      advanced.current = true;
      stepHeading.current?.focus();
    } else if (advanced.current)
      document.getElementById("trade-input")?.focus();
  }, [review, resultId]);
  const buying = side === "buy";
  const units = availableUnits(state, asset.ticker);
  let estimate: TradeQuote | null = null;
  let validation = "";
  if (input) {
    try {
      estimate = quoteTrade(state, {
        side,
        ticker: asset.ticker,
        ...(buying
          ? { budgetCents: parseARS(input) }
          : { quantity: /^\d+$/.test(input) ? Number(input) : NaN }),
      });
    } catch (e) {
      validation = e instanceof Error ? e.message : "Revisá el importe.";
    }
  }
  function continueTrade() {
    setError("");
    if (!estimate) {
      setError(
        validation ||
          (buying
            ? "Ingresá cuánto querés invertir."
            : "Ingresá una cantidad válida de unidades."),
      );
      return;
    }
    setReview({
      quote: estimate,
      id: crypto.randomUUID(),
      available: availableCash(state),
      scenario,
    });
  }
  async function confirm() {
    if (!review || busy) return;
    setBusy(true);
    setError("");
    try {
      await confirmTrade(review.quote, review.id, review.scenario);
      setResultId(review.id);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No pudimos confirmar. Volvé a revisar la operación.",
      );
    } finally {
      setBusy(false);
    }
  }
  const result = state.orders.find((order) => order.id === resultId);
  return (
    <main id="contenido" className="investments-dashboard trade-flow">
      <div className="asset-detail-identity">
        <span className={`asset-monogram asset-${asset.category}`}>
          {asset.monogram}
        </span>
        <div>
          <h2>{asset.name}</h2>
          <p>
            {instrumentLabels[asset.category]} · {asset.ticker}
          </p>
        </div>
      </div>
      <p className="asset-demo-note">
        Esta es una operación simulada. No se utilizará dinero real.
        <br />
        Precio fijo local, sin ejecución de mercado ni conexión a un broker.
      </p>
      {accountError ? (
        <FinancialRecovery />
      ) : result ? (
        <section className="inv-panel trade-result" role="status">
          <span className={`order-status order-${result.status}`}>
            {statusLabels[result.status]}
          </span>
          <h2 ref={stepHeading} tabIndex={-1}>
            {result.status === "executed"
              ? `Tu ${buying ? "compra" : "venta"} simulada se ejecutó correctamente.`
              : result.status === "rejected"
                ? "La orden simulada fue rechazada."
                : result.status === "cancelled"
                  ? "La orden simulada fue cancelada."
                  : "Tu orden simulada todavía no se ejecutó."}
          </h2>
          <p>
            {result.status === "executed"
              ? `${result.quote.quantity} unidades · ${formatCents(result.quote.totalCents)} ${buying ? "debitados" : "acreditados"}.`
              : result.status === "sent" || result.status === "pending"
                ? "Se reservaron los fondos o unidades necesarios. Podés gestionar esta orden desde su detalle."
                : "No se modificaron tu saldo ni tus posiciones."}
          </p>
          <p className="order-id">Orden {result.id}</p>
          <Link className="primary-button" href="/inversiones">
            Ver mis inversiones
          </Link>
          <Link
            className="text-button"
            href={`/inversiones/actividad/${result.id}`}
          >
            Ver detalle de la operación →
          </Link>
        </section>
      ) : resultId ? (
        <section className="inv-panel">
          <h2>La demo fue restablecida</h2>
          <p>Esta orden ya no está disponible.</p>
          <Link href="/inversiones" className="text-button">
            Volver a mis inversiones
          </Link>
        </section>
      ) : review ? (
        <section className="inv-panel">
          <p className="inv-eyebrow">PASO 2 DE 3 · REVISAR</p>
          <h2 ref={stepHeading} tabIndex={-1}>
            Revisá tu {buying ? "compra" : "venta"}
          </h2>
          <TradeFeeBreakdown
            quote={review.quote}
            available={review.available}
          />
          <p className="inv-subtitle">
            Las inversiones pueden subir o bajar de valor y podés perder dinero.
            En esta demo se usa el precio de referencia revisado. Si cambia
            antes de confirmar, deberás revisar de nuevo.
          </p>
          <p className="inv-caption">
            Comisión ilustrativa, no es una tarifa oficial. Sin otros cargos ni
            impuestos simulados. Escenario:{" "}
            {review.scenario === "immediate"
              ? "ejecución inmediata"
              : review.scenario === "sent"
                ? "enviada"
                : review.scenario === "pending"
                  ? "pendiente"
                  : "rechazada"}
            .
          </p>
          {error && (
            <p className="trade-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button" disabled={busy} onClick={confirm}>
            {busy
              ? "Confirmando…"
              : `Confirmar ${buying ? "compra" : "venta"} simulada`}
          </button>
          <button
            className="inv-secondary-button"
            disabled={busy}
            onClick={() => {
              setReview(null);
              setError("");
            }}
          >
            Volver y modificar
          </button>
        </section>
      ) : (
        <>
          <AvailableBalance />
          <section className="inv-panel">
            <p className="inv-eyebrow">PASO 1 DE 3 · ELEGIR</p>
            <h2>
              {buying
                ? "¿Cuánto querés invertir?"
                : "¿Cuántas unidades querés vender?"}
            </h2>
            <p className="inv-subtitle">
              Precio por unidad: {formatCents(toCents(asset.price))} ARS.
            </p>
            {!buying && (
              <p className="inv-subtitle">
                Unidades disponibles: <strong>{units}</strong>
              </p>
            )}
            <label className="trade-input-label" htmlFor="trade-input">
              {buying
                ? "Presupuesto en pesos (ARS)"
                : "Cantidad de unidades enteras"}
            </label>
            <input
              id="trade-input"
              className="trade-input"
              inputMode={buying ? "decimal" : "numeric"}
              type="text"
              autoComplete="off"
              placeholder={buying ? "50.000,00" : "1"}
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setError("");
              }}
              aria-invalid={!!(error || validation)}
              aria-describedby="trade-hint trade-validation"
            />
            {!buying && (
              <button
                className="text-button"
                onClick={() => {
                  setInput(String(units));
                  setError("");
                }}
              >
                Vender todo
              </button>
            )}
            <p id="trade-hint" className="inv-caption">
              {buying
                ? "El presupuesto incluye la comisión. El sobrante no se debita."
                : "La comisión se descuenta del importe de venta."}{" "}
              Solo unidades enteras, en múltiplos de {asset.quantityStep}.
              Comisión ficticia:{" "}
              {new Intl.NumberFormat("es-AR").format(TRADE_CONFIG.feeBps / 100)}
              %.
            </p>
            <p id="trade-validation" className="trade-error" role="alert">
              {error || validation}
            </p>
            {estimate && (
              <TradeFeeBreakdown
                quote={estimate}
                available={availableCash(state)}
              />
            )}
            <button className="primary-button" onClick={continueTrade}>
              Continuar
            </button>
          </section>
          <details className="demo-controls">
            <summary>Escenario de orden · Solo pruebas</summary>
            <div role="group" aria-label="Escenario de ejecución">
              {(
                [
                  { value: "immediate", label: "Inmediata" },
                  { value: "sent", label: "Enviada" },
                  { value: "pending", label: "Pendiente" },
                  { value: "rejected", label: "Rechazada" },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  aria-pressed={scenario === item.value}
                  onClick={() => setScenario(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </details>
        </>
      )}
      <p className="demo-footer">
        Demo no oficial · Sin dinero real.
        <br />
        Precios y costos ficticios.
      </p>
    </main>
  );
}
