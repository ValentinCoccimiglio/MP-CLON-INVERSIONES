import { SectionHeader } from "@/components/investments/SectionHeader";
import { AssetDetailSkeleton } from "@/components/investments/asset-detail/AssetDetailSkeleton";
export default function Loading() {
  return (
    <>
      <SectionHeader
        title="Detalle de inversión"
        fallback="/inversiones/explorar"
      />
      <main id="contenido" className="investments-dashboard">
        <AssetDetailSkeleton />
      </main>
    </>
  );
}
