import { ChartNoAxesCombined, ArrowDown } from "lucide-react";
export function PortfolioEmptyState() {
  return (
    <section className="inv-panel portfolio-empty">
      <span className="portfolio-empty-icon">
        <ChartNoAxesCombined size={39} strokeWidth={1.6} />
      </span>
      <span className="inv-eyebrow">A TU RITMO</span>
      <h2>Empezá a conocer el mundo de las inversiones.</h2>
      <p>
        Descubrí cómo funcionan las acciones y los CEDEARs. No necesitás saber
        todo para empezar a aprender.
      </p>
      <a className="primary-button" href="#explore-title">
        Explorar inversiones <ArrowDown size={17} />
      </a>
      <p className="inv-caption">
        Invertir implica riesgos. El valor de tu inversión puede subir o bajar.
      </p>
    </section>
  );
}
