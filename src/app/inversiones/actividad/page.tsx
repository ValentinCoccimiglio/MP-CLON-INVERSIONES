import { SectionHeader } from "@/components/investments/SectionHeader";
import { OrderHistory } from "@/components/investments/trading/OrderHistory";
export default function ActivityPage() {
  return (
    <>
      <SectionHeader title="Tus operaciones" fallback="/inversiones" />
      <OrderHistory />
    </>
  );
}
