import Link from "next/link";
import { ArrowUpRight, ChartNoAxesCombined, ChevronRight } from "lucide-react";
export function InvestmentsEntry() {
  return (
    <section
      className="card investments-entry"
      aria-labelledby="investments-title"
    >
      <div className="investment-top">
        <span className="eyebrow">UN NUEVO PASO PARA TU DINERO</span>
        <span className="new-badge">Nuevo</span>
      </div>
      <div className="investment-body">
        <div>
          <h2 id="investments-title">Inversiones</h2>
          <p>
            Tus próximos proyectos
            <br />
            empiezan con una inversión.
          </p>
        </div>
        <div className="investment-art" aria-hidden="true">
          <ChartNoAxesCombined size={43} strokeWidth={1.6} />
          <span>
            <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
      <Link className="investment-link" href="/inversiones">
        Conocer inversiones <ChevronRight size={19} />
      </Link>
    </section>
  );
}
