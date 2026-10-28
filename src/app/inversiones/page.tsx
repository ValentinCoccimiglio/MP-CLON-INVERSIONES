import { AppHeader } from "@/components/layout/AppHeader";
import { InvestmentsDashboard } from "@/components/investments/InvestmentsDashboard";
import "./investments.css";
export default function InvestmentsPage() {
  return (
    <>
      <AppHeader title="Tus inversiones" />
      <InvestmentsDashboard />
    </>
  );
}
