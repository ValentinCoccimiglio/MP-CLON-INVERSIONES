"use client";
import Link from "next/link";
import { useState } from "react";
import { getAsset } from "@/lib/investments/catalog";
import { statusLabels, isOpen, reservedCash } from "@/lib/trading/engine";
import { formatCents } from "@/lib/trading/money";
import { changeOrderStatus, useFinancialAccount } from "@/lib/trading/store";
import {
  AvailableBalance,
  FinancialRecovery,
  ResetDemoDialog,
} from "./AccountControls";
const orderDate = (date: string) =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(date));
export function OrderHistory() {
  const { state, error, hydrated } = useFinancialAccount();
  return (
    <main id="contenido" className="investments-dashboard">
      <p className="asset-demo-note">
        Operaciones simuladas · Sin dinero real.
      </p>
      {!hydrated ? <p role="status">Cargando tus operaciones guardadas…</p> : error ? (
        <FinancialRecovery />
      ) : (
        <>
          <AvailableBalance />
          {state.orders.length ? (
            <ul className="order-list">
              {[...state.orders].reverse().map((order) => (
                <li key={order.id}>
                  <Link href={`/inversiones/actividad/${order.id}`}>
                    <div className="inv-section-heading">
                      <h2>{getAsset(order.quote.ticker)?.name}</h2>
                      <span className={`order-status order-${order.status}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <p>
                      {order.quote.side === "buy" ? "Compra" : "Venta"} ·{" "}
                      {order.quote.quantity} unidades
                    </p>
                    <strong>{formatCents(order.quote.totalCents)}</strong>
                    <p>{orderDate(order.createdAt)}</p>
                    <span className="order-id">Orden {order.id}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <section className="inv-panel catalog-empty">
              <h2>Todavía no hay operaciones</h2>
              <p>
                Las compras y ventas simuladas aparecerán acá, junto con su
                estado.
              </p>
              <Link className="primary-button" href="/inversiones/explorar">
                Explorar inversiones
              </Link>
            </section>
          )}
          <ResetDemoDialog />
        </>
      )}
    </main>
  );
}
export function OrderDetail({ id }: { id: string }) {
  const { state, error, hydrated } = useFinancialAccount();
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const order = state.orders.find((item) => item.id === id);
  const execution = state.executions.find((item) => item.orderId === id);
  async function transition(
    status: "executed" | "pending" | "cancelled" | "rejected",
  ) {
    setBusy(true);
    setActionError("");
    try {
      await changeOrderStatus(id, status);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "No se pudo actualizar la orden.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="contenido" className="investments-dashboard">
      {!hydrated ? <p role="status">Cargando tus operaciones guardadas…</p> : error ? (
        <FinancialRecovery />
      ) : !order ? (
        <section className="inv-panel catalog-empty">
          <h2>No encontramos esta operación</h2>
          <p>Puede pertenecer a una demo restablecida o a otro navegador.</p>
          <Link href="/inversiones/actividad" className="primary-button">
            Volver al historial
          </Link>
        </section>
      ) : (
        <>
          <section className="inv-panel">
            <span className={`order-status order-${order.status}`}>
              {statusLabels[order.status]}
            </span>
            <h2>
              {order.quote.side === "buy" ? "Compra" : "Venta"} de{" "}
              {getAsset(order.quote.ticker)?.name}
            </h2>
            <p className="order-id">Orden {order.id}</p>
            <p className="inv-subtitle">
              {orderDate(order.createdAt)} · Hora de Argentina
            </p>
            <dl className="trade-breakdown">
              <div>
                <dt>Instrumento</dt>
                <dd>{order.quote.ticker}</dd>
              </div>
              <div>
                <dt>Unidades</dt>
                <dd>{order.quote.quantity}</dd>
              </div>
              <div>
                <dt>Precio fijo por unidad</dt>
                <dd>{formatCents(order.quote.priceCents)}</dd>
              </div>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatCents(order.quote.subtotalCents)}</dd>
              </div>
              <div>
                <dt>Comisión ficticia</dt>
                <dd>{formatCents(order.quote.feeCents)}</dd>
              </div>
              <div className="trade-total">
                <dt>
                  {order.quote.side === "buy"
                    ? "Total de compra"
                    : "Neto de venta"}
                </dt>
                <dd>{formatCents(order.quote.totalCents)}</dd>
              </div>
              {execution && order.quote.side === "sell" && (
                <div>
                  <dt>Resultado realizado</dt>
                  <dd>{formatCents(execution.realizedCents)}</dd>
                </div>
              )}
            </dl>
            <p className="inv-subtitle">
              {order.status === "executed"
                ? "Ejecutada una única vez a precio fijo simulado."
                : isOpen(order.status)
                  ? order.quote.side === "buy"
                    ? `${formatCents(order.quote.totalCents)} reservados. El saldo todavía no se debitó.`
                    : `${order.quote.quantity} unidades reservadas. Todavía no se acreditó dinero.`
                  : "No se ejecutó. Las reservas fueron liberadas."}
            </p>
            <p className="inv-caption">
              Sin ejecución bursátil ni liquidación bancaria real.
            </p>
          </section>
          {isOpen(order.status) && (
            <section className="inv-panel">
              <h2>Gestionar escenario de prueba</h2>
              <p className="inv-subtitle">
                La orden queda abierta hasta que elijas un resultado. El precio
                revisado permanece fijo.
              </p>
              {actionError && (
                <p role="alert" className="trade-error">
                  {actionError}
                </p>
              )}
              <button
                disabled={busy}
                className="primary-button"
                onClick={() => transition("executed")}
              >
                Ejecutar orden simulada
              </button>
              {order.status === "sent" && (
                <button
                  disabled={busy}
                  className="inv-secondary-button"
                  onClick={() => transition("pending")}
                >
                  Pasar a pendiente
                </button>
              )}
              <button
                disabled={busy}
                className="inv-secondary-button"
                onClick={() => transition("cancelled")}
              >
                Cancelar orden simulada
              </button>
              <button
                disabled={busy}
                className="text-button"
                onClick={() => transition("rejected")}
              >
                Simular rechazo
              </button>
            </section>
          )}
          <AvailableBalance />
          <p className="inv-caption">
            Reservas totales de compra: {formatCents(reservedCash(state))}.
          </p>
          <Link className="text-button" href="/inversiones/actividad">
            Volver al historial →
          </Link>
        </>
      )}
    </main>
  );
}
