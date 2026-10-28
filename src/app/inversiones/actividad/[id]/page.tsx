import { SectionHeader } from "@/components/investments/SectionHeader";
import { OrderDetail } from "@/components/investments/trading/OrderHistory";
export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <SectionHeader
        title="Detalle de operación"
        fallback="/inversiones/actividad"
      />
      <OrderDetail id={id} />
    </>
  );
}
