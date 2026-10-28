import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/investments/SectionHeader";
import { AssetDetail } from "@/components/investments/asset-detail/AssetDetail";
import { assets } from "@/lib/mocks/assets";
import { getAsset } from "@/lib/investments/catalog";
export function generateStaticParams() {
  return assets.map((asset) => ({ ticker: asset.ticker }));
}
export default async function AssetPage({
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
        title="Detalle de inversión"
        fallback="/inversiones/explorar"
      />
      <AssetDetail key={asset.id} asset={asset} />
    </>
  );
}
