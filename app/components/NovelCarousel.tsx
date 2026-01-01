"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type NovelCarouselProps = {
  novels: any[];
};

export default function NovelCarousel({ novels }: NovelCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (novels.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % novels.length);
    }, 5000); // 5초마다 변경

    return () => clearInterval(interval);
  }, [novels.length]);

  if (novels.length === 0) return null;

  const currentNovel = novels[currentIndex];

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
      }}
    >
      <Link
        href={`/novels/${currentNovel.id}`}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "block",
        }}
      >
        <div
          style={{
            width: "67%",
            aspectRatio: "2 / 3",
            background: "#fff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            position: "relative",
          }}
        >
          {/* 남색 패널 */}
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#243A6E",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {currentNovel.cover_url && (
              <img
                src={currentNovel.cover_url}
                alt={currentNovel.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  borderRadius: "14px",
                  background: "#fff",
                  border: "0.05cm solid #ffffff",
                }}
              />
            )}
          </div>
        </div>
      </Link>

      {/* 인디케이터 */}
      {novels.length > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap: "8px",
            marginTop: "16px",
          }}
        >
          {novels.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex(index);
              }}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                border: "none",
                background: index === currentIndex ? "#243A6E" : "#ccc",
                cursor: "pointer",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

