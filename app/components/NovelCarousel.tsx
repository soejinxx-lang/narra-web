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
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + novels.length) % novels.length);
  };

  const handleMouseEnterRight = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % novels.length);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  if (novels.length === 0) return null;

  const getNovelByOffset = (offset: number) => {
    const index = (currentIndex + offset + novels.length) % novels.length;
    return novels[index];
  };

  // 회전 각도 계산: currentIndex에 따라 회전
  const rotationAngle = -(currentIndex * (360 / novels.length));

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
        perspective: "1500px", // 3D 효과를 위한 원근감
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

      {/* 회전목마 컨테이너 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) rotateY(${rotationAngle}deg)`,
          width: "600px",
          height: "600px",
          transformStyle: "preserve-3d",
          transition: "transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* 모든 소설을 원형으로 배치 */}
        {novels.map((novel, index) => {
          // 각 소설의 원형 경로상 위치 계산
          const angle = (index * 360) / novels.length;
          const radius = 300; // 원의 반지름
          const x = Math.sin((angle * Math.PI) / 180) * radius;
          const z = Math.cos((angle * Math.PI) / 180) * radius;
          
          // 현재 인덱스와의 차이 계산
          const offset = (index - currentIndex + novels.length) % novels.length;
          const isCurrent = offset === 0;
          const isLeft = offset === novels.length - 1 || (offset > 0 && offset <= novels.length / 2);
          const isRight = offset === 1 || (offset > novels.length / 2);
          
          // 크기와 투명도 조정
          let scale = 0.75;
          let opacity = 0.5;
          if (isCurrent) {
            scale = 1;
            opacity = 1;
          } else if (offset === 1 || offset === novels.length - 1) {
            scale = 0.75;
            opacity = 0.5;
          } else {
            scale = 0.6;
            opacity = 0.3;
          }

          // 각 소설이 항상 앞면을 향하도록 회전 (컨테이너 회전을 상쇄)
          const novelRotation = -rotationAngle;

          return (
            <div
              key={novel.id}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `
                  translate(-50%, -50%) 
                  translateX(${x}px) 
                  translateZ(${z}px)
                  rotateY(${novelRotation}deg)
                  scale(${scale})
                `,
                transformStyle: "preserve-3d",
                transition: "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: opacity,
                zIndex: isCurrent ? 3 : isLeft || isRight ? 1 : 0,
                cursor: isLeft || isRight ? "pointer" : "default",
              }}
              onMouseEnter={() => {
                if (isLeft) {
                  handleMouseEnterLeft();
                } else if (isRight) {
                  handleMouseEnterRight();
                }
              }}
            >
              <Link
                href={`/novels/${novel.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                }}
              >
                <div
                  style={{
                    width: isCurrent ? "350px" : "280px",
                    aspectRatio: "2 / 3",
                    background: "#fff",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: isCurrent 
                      ? "0 8px 24px rgba(0,0,0,0.15)" 
                      : "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "#243A6E",
                      padding: "7px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {novel.cover_url && (
                      <img
                        src={novel.cover_url}
                        alt={novel.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          borderRadius: "14px",
                          background: "#fff",
                          border: "0.08cm solid #ffffff",
                        }}
                      />
                    )}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {novels.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "0px",
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
