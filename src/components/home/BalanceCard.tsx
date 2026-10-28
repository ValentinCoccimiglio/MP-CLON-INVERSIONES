"use client";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { formatMoney } from "@/lib/mocks/account";
import { useFinancialAccount } from "@/lib/trading/store";
import { availableCash, reservedCash } from "@/lib/trading/engine";
import { FinancialRecovery } from "@/components/investments/trading/AccountControls";
import { QuickActions } from "./QuickActions";
import { DemoButton } from "@/components/ui/DemoButton";
export function BalanceCard() {
  const { state, error } = useFinancialAccount();
  const balance = availableCash(state) / 100;
  const [visible, setVisible] = useState(true);
  return (
    <section className="balance-section" aria-labelledby="balance-title">
      <nav className="account-tabs" aria-label="Secciones de tu dinero">
        <span className="account-tab selected" aria-current="page">
          Pesos
        </span>
        <DemoButton label="Dólares" className="account-tab">
          Dólares
        </DemoButton>
        <DemoButton label="Reservas" className="account-tab">
          Reservas
        </DemoButton>
        <Link href="/inversiones" className="account-tab">
          Inversiones
        </Link>
      </nav>
      <div className="card balance-card">
        <div className="balance-heading">
          <h2 id="balance-title">Dinero disponible</h2>
          <DemoButton label="Datos de tu cuenta" className="text-button">
            Entrar <ArrowRight size={17} />
          </DemoButton>
        </div>
        <div className="balance-row">
          <p className="balance" aria-live="polite">
            {error ? (
              "No disponible"
            ) : visible ? (
              <>
                <span className="currency">$</span>{" "}
                {formatMoney(balance).split(",")[0]}
                <span className="cents">
                  ,{formatMoney(balance).split(",")[1]}
                </span>
              </>
            ) : (
              <span aria-label="Saldo oculto">$ ••••••</span>
            )}
          </p>
          <button
            className="icon-button balance-toggle"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Ocultar saldo" : "Mostrar saldo"}
            aria-pressed={!visible}
          >
            {visible ? <Eye size={21} /> : <EyeOff size={21} />}
          </button>
        </div>
        <p className="balance-note">
          <ShieldCheck size={14} aria-hidden="true" /> Tu dinero, siempre a mano
        </p>
        {!error && reservedCash(state) > 0 && (
          <p className="balance-note">
            {visible
              ? `$ ${formatMoney(reservedCash(state) / 100)}`
              : "$ ••••••"}{" "}
            reservados en órdenes abiertas.
          </p>
        )}
        {error && <FinancialRecovery />}
        <QuickActions />
      </div>
    </section>
  );
}
