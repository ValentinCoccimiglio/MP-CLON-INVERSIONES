export function PortfolioSkeleton() {
  return (
    <div
      className="portfolio-skeleton"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Cargando tus inversiones…</span>
      <div className="inv-panel" aria-hidden="true">
        <div className="skeleton-line short" />
        <div className="skeleton-line large" />
        <div className="skeleton-line" />
        <div className="skeleton-chart" />
        <div className="skeleton-line" />
      </div>
      <div className="inv-panel" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <div className="skeleton-row" key={index}>
            <div className="skeleton-circle" />
            <div className="skeleton-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
