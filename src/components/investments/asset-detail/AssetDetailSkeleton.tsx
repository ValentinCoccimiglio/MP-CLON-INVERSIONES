export function AssetDetailSkeleton() {
  return (
    <div className="inv-panel" role="status" aria-busy="true">
      <span className="sr-only">Cargando detalle del activo…</span>
      <div aria-hidden="true">
        <div className="skeleton-line short" />
        <div className="skeleton-line large" />
        <div className="skeleton-chart" />
        <div className="skeleton-line" />
      </div>
    </div>
  );
}
