"use client";
import { useEffect, useRef, useState } from "react";
import { resetFinancialDemo, useFinancialAccount } from "@/lib/trading/store";
import { availableCash, reservedCash } from "@/lib/trading/engine";
import { formatCents } from "@/lib/trading/money";
export function ResetDemoDialog() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) ref.current?.showModal();
  }, [open]);
  async function reset() {
    setBusy(true);
    setError("");
    try {
      await resetFinancialDemo();
      ref.current?.close();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo restablecer.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        className="text-button reset-demo-button"
        onClick={() => setOpen(true)}
      >
        Restablecer demo
      </button>
      {open && (
        <dialog
          className="reset-dialog"
          ref={ref}
          aria-labelledby="reset-title"
          onCancel={(event) => {
            if (busy) event.preventDefault();
            else setOpen(false);
          }}
          onClose={() => setOpen(false)}
        >
          <h2 id="reset-title">¿Restablecer la demo?</h2>
          <p>
            Se borrarán las órdenes y operaciones simuladas. El saldo volverá a
            $ 245.850,00 y se recuperarán las tres posiciones iniciales. Tus
            favoritos se conservan.
          </p>
          {error && <p role="alert">{error}</p>}
          <button
            className="inv-secondary-button"
            disabled={busy}
            onClick={() => {
              ref.current?.close();
              setOpen(false);
            }}
          >
            Conservar mis datos
          </button>
          <button className="primary-button" disabled={busy} onClick={reset}>
            {busy ? "Restableciendo…" : "Sí, restablecer demo"}
          </button>
        </dialog>
      )}
    </>
  );
}
export function FinancialRecovery() {
  const { error } = useFinancialAccount();
  return error ? (
    <section className="inv-panel" role="alert">
      <h2>No pudimos cargar tu demo</h2>
      <p className="inv-subtitle">{error}</p>
      <ResetDemoDialog />
    </section>
  ) : null;
}
export function AvailableBalance({ hidden = false }: { hidden?: boolean }) {
  const { state, error } = useFinancialAccount();
  if (error) return <FinancialRecovery />;
  return (
    <div className="available-balance">
      <span>Dinero disponible</span>
      <strong>{hidden ? "$ ••••••" : formatCents(availableCash(state))}</strong>
      {reservedCash(state) > 0 && (
        <small>
          {hidden ? "$ ••••••" : formatCents(reservedCash(state))} reservados
          para órdenes abiertas.
        </small>
      )}
    </div>
  );
}
