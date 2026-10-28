import { SectionHeader } from "@/components/investments/SectionHeader";
import { AssetExplorer } from "@/components/investments/explore/AssetExplorer";
export default function ExplorePage() {
  return (
    <>
      <SectionHeader title="Explorar inversiones" fallback="/inversiones" />
      <AssetExplorer />
    </>
  );
}
