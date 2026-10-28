import Link from "next/link";
import {
  CreditCard,
  ChevronRight,
  LockKeyhole,
  ArrowRight,
  Sparkles,
  Coffee,
  ShoppingBag,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { BalanceCard } from "@/components/home/BalanceCard";
import { InvestmentsEntry } from "@/components/home/InvestmentsEntry";
import { ServicesSection } from "@/components/home/ServicesSection";
import { CollectionTools } from "@/components/home/CollectionTools";
import { ActivitySection } from "@/components/home/ActivitySection";
import { DemoButton } from "@/components/ui/DemoButton";
export default function Home() {
  return (
    <>
      <AppHeader />
      <main id="contenido" className="home-content">
        <BalanceCard />
        <DemoButton
          label="Ver tarjetas de demostración"
          className="payment-card"
        >
          <CreditCard size={24} />
          <span>Tarjetas</span>
          <ChevronRight size={23} />
        </DemoButton>
        <CollectionTools />
        <InvestmentsEntry />
        <section className="credits-section">
          <h2>Créditos</h2>
          <DemoButton label="Consultar créditos" className="text-button">
            Consultar <ArrowRight size={18} />
          </DemoButton>
          <DemoButton label="Detalle de créditos" className="outlined-row">
            Consultá el detalle de tus créditos
          </DemoButton>
        </section>
        <section className="benefits-section" aria-labelledby="benefits-title">
          <h2 id="benefits-title">Beneficios</h2>
          <DemoButton label="Conocer beneficios" className="text-button">
            Conocer todos <ArrowRight size={18} />
          </DemoButton>
          <div className="benefits-grid">
            <article className="benefit-tile">
              <span className="benefit-tag">DEMO</span>
              <h3>
                Una pausa
                <br />
                para disfrutar
              </h3>
              <Coffee
                className="benefit-art"
                size={49}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <DemoButton
                label="Beneficio en cafeterías"
                className="text-button"
              >
                Ver beneficio <ArrowRight size={16} />
              </DemoButton>
            </article>
            <article className="benefit-tile">
              <span className="benefit-tag">DEMO</span>
              <h3>
                Más para tus
                <br />
                compras
              </h3>
              <ShoppingBag
                className="benefit-art"
                size={49}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <DemoButton label="Beneficio en compras" className="text-button">
                Ver beneficio <ArrowRight size={16} />
              </DemoButton>
            </article>
          </div>
        </section>
        <ActivitySection />
        <ServicesSection />
        <section className="suggestions-section">
          <h2>Sugerencias</h2>
          <div className="suggestion-card">
            <span className="eyebrow">DESCUBRÍ LO QUE VIENE</span>
            <h3>
              Un nuevo paso
              <br />
              para tu dinero.
            </h3>
            <p>Conocé el espacio de inversiones.</p>
            <Link className="text-button" href="/inversiones">
              Explorar <ArrowRight size={18} />
            </Link>
            <Sparkles size={90} className="suggestion-art" aria-hidden="true" />
          </div>
        </section>
        <p className="demo-footer">
          <LockKeyhole size={13} /> Proyecto educativo · Datos ficticios
          <br />
          Sin vinculación oficial con Mercado Pago.
        </p>
      </main>
    </>
  );
}
