"use client";

type StarRatingProps = {
  rating: number;
  maxRating?: number;
  size?: number;
};

export default function StarRating({ rating, maxRating = 5, size = 16 }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={`full-${i}`} style={{ fontSize: `${size}px`, color: "#FFD700" }}>
          ★
        </span>
      ))}
      {hasHalfStar && (
        <span style={{ fontSize: `${size}px`, color: "#FFD700" }}>☆</span>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={`empty-${i}`} style={{ fontSize: `${size}px`, color: "#ddd" }}>
          ★
        </span>
      ))}
      <span style={{ marginLeft: "8px", fontSize: "14px", color: "#666" }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

