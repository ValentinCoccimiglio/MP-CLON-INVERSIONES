import Link from "next/link";
import { SearchX } from "lucide-react";
import { SectionHeader } from "@/components/investments/SectionHeader";
export default function NotFound() {
  return (
    <>
      <SectionHeader title="Inversiones" fallback="/inversiones/explorar" />
      <main id="contenido" className="investments-dashboard">
        <section className="inv-panel catalog-empty">
          <SearchX size={35} />
          <h2>No encontramos este activo</h2>
          <p>
            El enlace puede ser incorrecto o el instrumento no pertenece al
            catálogo de demostración.
          </p>
          <Link className="primary-button" href="/inversiones/explorar">
            Volver a explorar
          </Link>
        </section>
      </main>
    </>
  );
}
