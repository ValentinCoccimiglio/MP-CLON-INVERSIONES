import { InvestmentBackButton } from "./InvestmentNavigation";
export function SectionHeader({
  title,
  fallback,
}: {
  title: string;
  fallback: string;
}) {
  return (
    <header className="asset-section-header">
      <div>
        <InvestmentBackButton fallback={fallback} />
        <h1>{title}</h1>
      </div>
      <span className="demo-badge">Demo no oficial</span>
    </header>
  );
}
