import { Search, X } from "lucide-react";
export function InvestmentSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="investment-search">
      <Search size={20} aria-hidden="true" />
      <label className="sr-only" htmlFor="asset-search">
        Buscar empresas o inversiones
      </label>
      <input
        id="asset-search"
        type="search"
        placeholder="Buscar empresas o inversiones"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          className="icon-button"
          aria-label="Limpiar búsqueda"
          onClick={() => {
            onChange("");
            document.getElementById("asset-search")?.focus();
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
