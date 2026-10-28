import { notFound } from "next/navigation";
import { getAsset } from "@/lib/investments/catalog";
import { assets } from "@/lib/mocks/assets";
import { SectionHeader } from "@/components/investments/SectionHeader";
import { TradeFlow } from "@/components/investments/trading/TradeFlow";
export function generateStaticParams() {
  return assets.map((asset) => ({ ticker: asset.ticker }));
}
export default async function BuyPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const asset = getAsset(ticker);
  if (!asset) notFound();
  return (
    <>
      <SectionHeader
        title="Comprar inversión"
        fallback={`/inversiones/activo/${asset.ticker}`}
      />
      <TradeFlow key={`buy-${asset.id}`} asset={asset} side="buy" />
    </>
  );
}
