import { AppHeader } from "@/components/layout/AppHeader";
import { PortfolioSkeleton } from "@/components/investments/PortfolioSkeleton";
import "./investments.css";
export default function LoadingInvestments() {
  return (
    <>
      <AppHeader title="Tus inversiones" />
      <main id="contenido" className="investments-dashboard">
        <PortfolioSkeleton />
      </main>
    </>
  );
}
