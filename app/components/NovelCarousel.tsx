"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type NovelCarouselProps = {
  novels: any[];
};

export default function NovelCarousel({ novels }: NovelCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (novels.length === 0) return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (direction === 1) {
          return (prev + 1) % novels.length;
        } else {
          return (prev - 1 + novels.length) % novels.length;
        }
      });
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [novels.length, direction]);

  const handleMouseEnterLeft = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setDirection(-1);
    }, 800);
  };

  const handleMouseEnterRight = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setDirection(1);
    }, 800);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  if (novels.length === 0) return null;

  const getNovelByOffset = (offset: number) => {
    const index = (currentIndex + offset + novels.length) % novels.length;
    return novels[index];
  };

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        height: "700px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        marginTop: "20px",
      }}
    >
      {/* 왼쪽 호버 영역 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "40%",
          height: "100%",
          zIndex: 5,
          cursor: "pointer",
        }}
        onMouseEnter={handleMouseEnterLeft}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          setCurrentIndex((prev) => (prev - 1 + novels.length) % novels.length);
          setDirection(-1);
        }}
      />

      {/* 오른쪽 호버 영역 */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "40%",
          height: "100%",
          zIndex: 5,
          cursor: "pointer",
        }}
        onMouseEnter={handleMouseEnterRight}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          setCurrentIndex((prev) => (prev + 1) % novels.length);
          setDirection(1);
        }}
      />

      {/* 뒤에 있는 소설들 (왼쪽) */}
      {getNovelByOffset(-1) && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-120%) scale(0.75)",
            zIndex: 1,
            opacity: 0.5,
            transition: "all 0.5s ease",
          }}
        >
          <Link
            href={`/novels/${getNovelByOffset(-1).id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "block",
            }}
          >
            <div
              style={{
                width: "280px",
                aspectRatio: "2 / 3",
                background: "#fff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
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
                {getNovelByOffset(-1).cover_url && (
                  <img
                    src={getNovelByOffset(-1).cover_url}
                    alt={getNovelByOffset(-1).title}
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
        </div>
      )}

      {/* 현재 중앙 소설 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          transition: "all 0.5s ease",
        }}
      >
        <Link
          href={`/novels/${getNovelByOffset(0).id}`}
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "block",
          }}
        >
          <div
            style={{
              width: "350px",
              aspectRatio: "2 / 3",
              background: "#fff",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
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
              {getNovelByOffset(0).cover_url && (
                <img
                  src={getNovelByOffset(0).cover_url}
                  alt={getNovelByOffset(0).title}
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
      </div>

      {/* 뒤에 있는 소설들 (오른쪽) */}
      {getNovelByOffset(1) && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(20%) scale(0.75)",
            zIndex: 1,
            opacity: 0.5,
            transition: "all 0.5s ease",
          }}
        >
          <Link
            href={`/novels/${getNovelByOffset(1).id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "block",
            }}
          >
            <div
              style={{
                width: "280px",
                aspectRatio: "2 / 3",
                background: "#fff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
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
                {getNovelByOffset(1).cover_url && (
                  <img
                    src={getNovelByOffset(1).cover_url}
                    alt={getNovelByOffset(1).title}
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
        </div>
      )}

      {novels.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "8px",
            zIndex: 10,
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
