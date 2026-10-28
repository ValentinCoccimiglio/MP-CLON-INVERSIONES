import { ChevronDown, ShieldAlert, BookOpen } from "lucide-react";
import type { InvestmentAsset } from "@/types/investments";
import { instrumentLabels } from "@/lib/investments";
export function AssetInformation({ asset }: { asset: InvestmentAsset }) {
  return (
    <>
      <section className="inv-panel asset-more">
        <details>
          <summary>
            Más información <ChevronDown size={18} />
          </summary>
          <dl>
            <div>
              <dt>Nombre</dt>
              <dd>{asset.name}</dd>
            </div>
            <div>
              <dt>Símbolo local</dt>
              <dd>{asset.ticker}</dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>{instrumentLabels[asset.category]}</dd>
            </div>
            <div>
              <dt>Mercado</dt>
              <dd>{asset.market}</dd>
            </div>
            <div>
              <dt>Moneda del precio</dt>
              <dd>Pesos argentinos (ARS)</dd>
            </div>
            <div>
              <dt>Unidad</dt>
              <dd>
                {asset.category === "cedears"
                  ? "Un certificado CEDEAR"
                  : asset.category === "fondos"
                    ? "Una cuotaparte"
                    : "Una acción"}
              </dd>
            </div>
            <div>
              <dt>Datos de precio</dt>
              <dd>Simulados al 28/10/2026, sin comisiones ni impuestos.</dd>
            </div>
          </dl>
          <p className="inv-caption">
            Información educativa. No es una ficha oficial ni acredita
            disponibilidad comercial.
          </p>
        </details>
      </section>
    </>
  );
}
export function AssetEducation({ asset }: { asset: InvestmentAsset }) {
  return (
    <section className="education-card asset-education">
      <div className="education-heading">
        <span>
          <BookOpen size={22} />
        </span>
        <h2>¿En qué estás invirtiendo?</h2>
      </div>
      <p>{asset.education}</p>
    </section>
  );
}
export function AssetRiskNotice({ asset }: { asset: InvestmentAsset }) {
  return (
    <aside className="asset-risk">
      <ShieldAlert size={21} aria-hidden="true" />
      <div>
        <h2>Antes de invertir</h2>
        <p>{asset.risks}</p>
      </div>
    </aside>
  );
}
