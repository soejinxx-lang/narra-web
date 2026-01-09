"use client";

import { useState, useEffect } from "react";
import { getCurrentUserId } from "@/app/utils/readingProgress";
import { isFavorite, addToFavorites, removeFromFavorites } from "@/app/utils/library";

type FavoriteButtonProps = {
  novelId: string;
};

export default function FavoriteButton({ novelId }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const userId = getCurrentUserId();
    if (!userId) {
      setIsFav(false);
      return;
    }
    
    setIsFav(isFavorite(userId, novelId));
  }, [novelId]);

  const handleToggleFavorite = () => {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    if (isFav) {
      removeFromFavorites(userId, novelId);
      setIsFav(false);
    } else {
      addToFavorites(userId, novelId);
      setIsFav(true);
    }
  };

  if (!mounted) {
    return null;
  }

  const userId = getCurrentUserId();
  if (!userId) {
    return null;
  }

  return (
    <button
      onClick={handleToggleFavorite}
      style={{
        padding: "8px 16px",
        background: isFav ? "#243A6E" : "transparent",
        color: isFav ? "#fff" : "#243A6E",
        border: `1px solid #243A6E`,
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!isFav) {
          e.currentTarget.style.background = "#f0f4ff";
        }
      }}
      onMouseLeave={(e) => {
        if (!isFav) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      {isFav ? "★ Favorited" : "☆ Favorite"}
    </button>
  );
}

