"use client";
import { useId, useState, useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LockKeyhole } from "lucide-react";
import {
  formatARS,
  formatPercent,
  historyDate,
  periodChange,
  signedARS,
} from "@/lib/investments";
import { historyForPeriod, periodLabels } from "@/lib/mocks/investments";
import type { ChartPeriod, PortfolioHistoryPoint } from "@/types/investments";
import { ChartPeriodSelector } from "./ChartPeriodSelector";
function subscribeMotion(onChange: () => void) {
  if (!window.matchMedia) return () => {};
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
const motionSnapshot = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? true;
const serverMotionSnapshot = () => true;
export function PortfolioChart({
  hidden,
  getHistory = historyForPeriod,
  assetMode = false,
  heading,
  description,
}: {
  hidden: boolean;
  getHistory?: (period: ChartPeriod) => PortfolioHistoryPoint[];
  assetMode?: boolean;
  heading?: string;
  description?: string;
}) {
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    motionSnapshot,
    serverMotionSnapshot,
  );
  const [period, setPeriod] = useState<ChartPeriod>(assetMode ? "1D" : "1M");
  const points = getHistory(period);
  const padding = Math.max(...points.map((point) => point.value)) * 0.003;
  const change = periodChange(points);
  const gradientId = useId().replace(/:/g, "");
  const negative = change.result < 0;
  return (
    <section className="portfolio-chart" aria-labelledby="chart-title">
      <div className="inv-section-heading">
        <h2 id="chart-title">
          {heading ??
            (assetMode ? "Evolución del precio" : "Cómo viene tu inversión")}
        </h2>
        <span className="inv-pill">ARS</span>
      </div>
      <p className="chart-change" aria-live="polite">
        {hidden ? (
          "Variación oculta"
        ) : (
          <>
            <strong className={negative ? "inv-negative" : "inv-positive"}>
              {negative ? "Bajó" : "Subió"} {signedARS(change.result)} (
              {formatPercent(change.rate)})
            </strong>
            <span> en {periodLabels[period]}</span>
          </>
        )}
      </p>
      {hidden ? (
        <div className="chart-private">
          <LockKeyhole size={25} />
          <p>Mostrá los importes para ver la evolución.</p>
        </div>
      ) : (
        <>
          <div
            className="portfolio-chart-canvas"
            role="group"
            aria-label={`Evolución en pesos argentinos en ${periodLabels[period]}`}
          >
            <ResponsiveContainer
              width="100%"
              height={190}
              minWidth={0}
              initialDimension={{ width: 280, height: 190 }}
            >
              <AreaChart
                data={points}
                margin={{ top: 10, right: 6, bottom: 0, left: 0 }}
                accessibilityLayer
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4c48ed" stopOpacity={0.2} />
                    <stop
                      offset="100%"
                      stopColor="#4c48ed"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#ececf4"
                  strokeDasharray="3 5"
                />
                <XAxis dataKey="date" hide />
                <YAxis
                  hide
                  domain={[
                    (min: number) => min - padding,
                    (max: number) => max + padding,
                  ]}
                />
                <Tooltip
                  formatter={(value) => [
                    formatARS(Number(value)),
                    assetMode
                      ? "Precio por unidad (ARS)"
                      : "Valor de la cartera",
                  ]}
                  labelFormatter={(label) =>
                    historyDate(String(label), period === "1D")
                  }
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e4e4f1",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="linear"
                  dataKey="value"
                  stroke="#4c48ed"
                  strokeWidth={2.5}
                  fill={`url(#${gradientId})`}
                  isAnimationActive={!reducedMotion}
                  animationDuration={220}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-dates">
            <span>{historyDate(points[0].date, period === "1D")}</span>
            <span>
              {historyDate(points[points.length - 1].date, period === "1D")}
            </span>
          </div>
        </>
      )}
      <ChartPeriodSelector period={period} onChange={setPeriod} />
      <p className="inv-caption">
        {description ??
          (assetMode
            ? "Variación del precio por unidad en el período seleccionado. No es tu ganancia personal. Serie simulada en ARS."
            : "Variación del período, distinta del resultado total. Serie ficticia sin aportes ni retiros intermedios.")}
      </p>
      {!hidden && (
        <details className="chart-data">
          <summary>Ver valores del gráfico</summary>
          <div
            className="chart-table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Tabla de evolución"
          >
            <table>
              <caption>Evolución ficticia · Pesos argentinos</caption>
              <thead>
                <tr>
                  <th scope="col">{period === "1D" ? "Hora" : "Fecha"}</th>
                  <th scope="col">Valor</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point) => (
                  <tr key={point.date}>
                    <td>{historyDate(point.date, period === "1D")}</td>
                    <td>{formatARS(point.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}
