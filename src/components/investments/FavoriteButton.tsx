"use client";
import { Star } from "lucide-react";
import type { InvestmentAsset } from "@/types/investments";
import { useWatchlist } from "@/lib/investments/watchlist";
export function FavoriteButton({ asset }: { asset: InvestmentAsset }) {
  const { favorites, toggleFavorite } = useWatchlist();
  const selected = favorites.includes(asset.id);
  return (
    <button
      className={`favorite-button icon-button ${selected ? "is-favorite" : ""}`}
      aria-pressed={selected}
      aria-label={`${selected ? "Quitar" : "Agregar"} ${asset.name} ${selected ? "de" : "a"} favoritos`}
      onClick={() => toggleFavorite(asset.id)}
    >
      <Star size={21} fill={selected ? "currentColor" : "none"} />
    </button>
  );
}
