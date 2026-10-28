"use client";
import { useState } from "react";
import {
  ArrowDown,
  CircleAlert,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useFinancialAccount } from "@/lib/trading/store";
import { accountPortfolio, financialTotals } from "@/lib/trading/engine";
import { operationHistory } from "@/lib/trading/history";
import { formatCents } from "@/lib/trading/money";
import {
  FinancialRecovery,
  AvailableBalance,
  ResetDemoDialog,
} from "./trading/AccountControls";
import type { DemoState } from "@/types/investments";
import { PortfolioSummary } from "./PortfolioSummary";
import { PortfolioChart } from "./PortfolioChart";
import { HoldingsList } from "./HoldingsList";
import { ExploreInvestments } from "./ExploreInvestments";
import { InvestmentEducationCard } from "./InvestmentEducationCard";
import { PortfolioEmptyState } from "./PortfolioEmptyState";
import { PortfolioSkeleton } from "./PortfolioSkeleton";
const states: { value: DemoState; label: string }[] = [
  { value: "invested", label: "Con inversiones" },
  { value: "empty", label: "Sin inversiones" },
  { value: "loading", label: "Cargando" },
  { value: "error", label: "Error" },
];
export function InvestmentsDashboard() {
  const { state: financial, error: financialError } = useFinancialAccount();
  const portfolio = accountPortfolio(financial);
  const totals = financialTotals(financial);
  const [state, setState] = useState<DemoState>("invested");
  const [hidden, setHidden] = useState(false);
  return (
    <main id="contenido" className="investments-dashboard">
      <div className="inv-welcome">
        <p>Tu futuro, un paso a la vez</p>
        <span>Datos ficticios · En pesos argentinos</span>
      </div>
      <Link className="inv-secondary-button" href="/inversiones/actividad">
        Ver operaciones simuladas →
      </Link>
      {!financialError && <AvailableBalance hidden={hidden} />}
      <details className="demo-controls">
        <summary>
          <SlidersHorizontal size={15} /> Probar estados de la demo{" "}
          <span>{states.find((item) => item.value === state)?.label}</span>
        </summary>
        <div role="group" aria-label="Estado de la demo">
          {states.map((item) => (
            <button
              key={item.value}
              aria-pressed={state === item.value}
              onClick={() => setState(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p>Estas vistas de prueba no modifican tu cuenta ni tus operaciones.</p>
      </details>
      {financialError ? (
        <FinancialRecovery />
      ) : state === "loading" ? (
        <>
          <PortfolioSkeleton />
          <button
            className="inv-secondary-button"
            onClick={() => setState("invested")}
          >
            Finalizar carga simulada
          </button>
        </>
      ) : state === "error" ? (
        <section className="inv-panel portfolio-error" role="alert">
          <CircleAlert size={34} />
          <h2>No pudimos mostrar tus inversiones</h2>
          <p>Es un error simulado. Tus datos de ejemplo siguen disponibles.</p>
          <button
            className="primary-button"
            onClick={() => setState("invested")}
          >
            <RotateCcw size={17} /> Reintentar
          </button>
        </section>
      ) : (
        <>
          {state === "empty" || portfolio.holdings.length === 0 ? (
            <PortfolioEmptyState />
          ) : (
            <>
              <div className="inv-panel portfolio-panel">
                <PortfolioSummary
                  portfolio={portfolio}
                  hidden={hidden}
                  onToggle={() => setHidden(!hidden)}
                />
                {financial.executions.length ? (
                  <PortfolioChart
                    hidden={hidden}
                    getHistory={(period) => operationHistory(financial, period)}
                    heading="Valor tras tus operaciones"
                    description="Incluye compras y ventas. Este cambio de valor NO es rentabilidad. Los resultados realizados y no realizados se muestran por separado."
                  />
                ) : (
                  <PortfolioChart hidden={hidden} />
                )}
                <a className="inv-explore-link" href="#explore-title">
                  Explorar inversiones <ArrowDown size={17} />
                </a>
              </div>
              <HoldingsList holdings={portfolio.holdings} hidden={hidden} />
            </>
          )}
          {(state !== "empty" || financial.executions.length > 0) && (
            <section className="inv-panel">
              <h2>Resultado realizado</h2>
              <p className="portfolio-value">
                {hidden ? "$ ••••••" : formatCents(totals.realizedCents)}
              </p>
              <p className="inv-caption">
                Ganancias o pérdidas de ventas ejecutadas, descontando las
                comisiones ficticias. No incluye el resultado de posiciones
                abiertas.
              </p>
            </section>
          )}
          <ExploreInvestments />
          <InvestmentEducationCard />
        </>
      )}
      <ResetDemoDialog />
      <p className="demo-footer">
        Demo no oficial · Sin operaciones reales.
        <br />
        Escenario al 28/10/2026, no son cotizaciones actuales.
        <br />
        Operaciones locales con comisión ficticia. Sin impuestos simulados.
      </p>
    </main>
  );
}
