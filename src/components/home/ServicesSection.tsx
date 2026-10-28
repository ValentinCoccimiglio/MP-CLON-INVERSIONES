import {
  Smartphone,
  ReceiptText,
  BusFront,
  TvMinimal,
  ChevronRight,
} from "lucide-react";
import { DemoButton } from "@/components/ui/DemoButton";
const services = [
  { label: "Recargar celular", icon: Smartphone, color: "blue" },
  { label: "Pagar servicios", icon: ReceiptText, color: "purple" },
  { label: "Cargar transporte", icon: BusFront, color: "green" },
  { label: "Suscripciones", icon: TvMinimal, color: "orange" },
];
export function ServicesSection() {
  return (
    <section className="card services" aria-labelledby="services-title">
      <div className="section-heading">
        <h2 id="services-title">Tu día a día, más simple</h2>
      </div>
      <div className="services-grid">
        {services.map(({ label, icon: Icon, color }) => (
          <DemoButton key={label} label={label} className="service">
            <span className={`service-icon ${color}`}>
              <Icon size={25} strokeWidth={1.7} />
            </span>
            <span>{label}</span>
          </DemoButton>
        ))}
      </div>
      <DemoButton label="Ver todos los servicios" className="card-footer">
        Ver todos los servicios <ChevronRight size={18} />
      </DemoButton>
    </section>
  );
}
