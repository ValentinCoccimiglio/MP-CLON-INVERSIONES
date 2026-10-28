import { SectionHeader } from "@/components/investments/SectionHeader";
import { PortfolioSkeleton } from "@/components/investments/PortfolioSkeleton";
export default function Loading() {
  return (
    <>
      <SectionHeader title="Explorar inversiones" fallback="/inversiones" />
      <main id="contenido" className="investments-dashboard">
        <PortfolioSkeleton />
      </main>
    </>
  );
}
