import type { AssetCategory } from "@/types/investments";
const options: { value: AssetCategory | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "cedears", label: "CEDEARs" },
  { value: "acciones", label: "Acciones argentinas" },
  { value: "fondos", label: "Fondos" },
];
export function AssetCategoryFilter({
  value,
  onChange,
}: {
  value: AssetCategory | "all";
  onChange: (value: AssetCategory | "all") => void;
}) {
  return (
    <div
      className="category-filters"
      role="group"
      aria-label="Categoría de instrumentos"
    >
      {options.map((item) => (
        <button
          key={item.value}
          aria-pressed={value === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
