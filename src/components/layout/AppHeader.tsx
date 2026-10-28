import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CircleHelp,
  Handshake,
  Search,
} from "lucide-react";
import { account } from "@/lib/mocks/account";
import { DemoButton } from "@/components/ui/DemoButton";
export function AppHeader({ title }: { title?: string }) {
  return (
    <header className={`app-header ${title ? "compact" : ""}`}>
      <div className="header-row">
        {title ? (
          <div className="header-title">
            <Link
              className="icon-button"
              href="/"
              aria-label="Volver al inicio"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1>{title}</h1>
          </div>
        ) : (
          <div className="greeting">
            <span className="brand-mark" aria-hidden="true">
              <Handshake size={24} />
            </span>
            <h1>Hola, {account.name}</h1>
          </div>
        )}
        <div className="header-tools">
          <DemoButton label="Buscar en la app" className="icon-button">
            <Search size={23} />
          </DemoButton>
          <DemoButton label="Notificaciones" className="icon-button">
            <Bell size={23} />
          </DemoButton>
        </div>
      </div>
      <div className="brand-row">
        <DemoButton label="Ayuda" className="help-button">
          <CircleHelp size={15} /> Ayuda
        </DemoButton>
        <span className="demo-badge">Demo no oficial</span>
      </div>
      {!title && (
        <aside className="header-banner">
          <h2>Tu dinero, en un solo lugar</h2>
          <p>
            Transferí, pagá y descubrí todo lo que podés hacer desde tu cuenta.
          </p>
          <DemoButton label="Conocer mi cuenta" className="primary-button">
            Conocer mi cuenta <ArrowRight size={17} />
          </DemoButton>
        </aside>
      )}
    </header>
  );
}
