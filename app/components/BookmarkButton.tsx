"use client";

import { useState, useEffect } from "react";

type BookmarkButtonProps = {
  novelId: string;
};

export default function BookmarkButton({ novelId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에서 북마크 상태 확인
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    setIsBookmarked(bookmarks.includes(novelId));
  }, [novelId]);

  const handleToggle = () => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    let newBookmarks: string[];
    
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((id: string) => id !== novelId);
    } else {
      newBookmarks = [...bookmarks, novelId];
    }
    
    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        background: isBookmarked ? "#243A6E" : "transparent",
        border: `2px solid #243A6E`,
        color: isBookmarked ? "#fff" : "#243A6E",
        padding: "10px 20px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!isBookmarked) {
          e.currentTarget.style.background = "#f0f4ff";
        }
      }}
      onMouseLeave={(e) => {
        if (!isBookmarked) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      {isBookmarked ? "✓ Bookmarked" : "☆ Bookmark"}
    </button>
  );
}

