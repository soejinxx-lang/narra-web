"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type NovelCarouselProps = {
  novels: any[];
};

export default function NovelCarousel({ novels }: NovelCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0); // 회전 각도 state
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // 드래그 중인지 state
  const manualIntervalRef = useRef<NodeJS.Timeout | null>(null); // 수동 클릭 시 interval
  const autoIntervalRef = useRef<NodeJS.Timeout | null>(null); // 자동 넘어가기 interval
  const mouseActivityTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 마우스 움직임 감지 timeout
  const isChangingRef = useRef(false); // 현재 변경 중인지 추적
  const lastMouseMoveRef = useRef<number>(Date.now()); // 마지막 마우스 움직임 시간
  const touchStartXRef = useRef<number | null>(null); // 터치 시작 X 좌표
  const touchStartAngleRef = useRef<number>(0); // 터치 시작 시 각도
  const isDraggingRef = useRef(false); // 드래그 중인지 추적

  // 모바일 감지
  useEffect(() => {
    // 클라이언트에서만 실행되도록 마운트 상태 설정
    setMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // currentIndex가 변경될 때 rotationAngle 업데이트 (드래그 중이 아닐 때만)
  useEffect(() => {
    if (novels.length === 0 || isDraggingRef.current) return;
    
    const angleStep = 360 / novels.length;
    const targetAngle = -(currentIndex * angleStep);
    
    setRotationAngle((prevAngle) => {
      // 이전 각도와 목표 각도의 차이 계산
      let diff = targetAngle - prevAngle;
      
      // 최단 경로 선택 (360도 차이를 -0도 또는 +0도로 조정)
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      
      return prevAngle + diff;
    });
  }, [currentIndex, novels.length]);

  // 모바일 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    e.preventDefault();
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartAngleRef.current = rotationAngle;
    isDraggingRef.current = true;
    setIsDragging(true);
    stopAllRotate(); // 자동 회전 중지
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || touchStartXRef.current === null) return;
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    
    // 회전목마처럼 앞에서 보는 느낌: 오른쪽으로 드래그하면 오른쪽으로 회전
    // 손가락 방향과 일치하도록 부호 반전
    const sensitivity = 0.8; // 회전 속도 조정
    const newAngle = touchStartAngleRef.current + (deltaX * sensitivity);
    setRotationAngle(newAngle);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || touchStartXRef.current === null) return;
    e.preventDefault();
    
    setIsDragging(false);
    isDraggingRef.current = false;
    
    // 현재 각도에 가장 가까운 소설의 인덱스 계산
    const angleStep = 360 / novels.length;
    // rotationAngle은 음수로 저장되므로 절댓값을 사용
    const normalizedAngle = ((Math.abs(rotationAngle) % 360) + 360) % 360;
    // 가장 가까운 인덱스 계산 (0부터 시작)
    let closestIndex = Math.round(normalizedAngle / angleStep) % novels.length;
    
    // 각도가 정확히 경계에 있을 때 처리
    if (closestIndex >= novels.length) {
      closestIndex = 0;
    }
    
    // 가장 가까운 소설로 스냅
    setCurrentIndex(closestIndex);
    
    touchStartXRef.current = null;
    
    // 3초 후 자동 회전 재시작
    setTimeout(() => {
      if (!isDraggingRef.current) {
        startAutoRotate();
      }
    }, 3000);
  };

  // 안전하게 인덱스 변경 (한 개씩만)
  const moveToNext = (dir: number) => {
    if (isChangingRef.current) return; // 이미 변경 중이면 무시
    
    isChangingRef.current = true;
    setDirection(dir);
    
    setCurrentIndex((prev) => {
      const newIndex = dir === 1 
        ? (prev + 1) % novels.length
        : (prev - 1 + novels.length) % novels.length;
      
      return newIndex;
    });

    // transition 완료 후 플래그 해제
    setTimeout(() => {
      isChangingRef.current = false;
    }, 1600); // transition 1.5s + 여유 0.1s
  };

  // 클릭 중일 때만 1초마다 1개씩 넘어가는 함수
  const startManualRotate = (dir: number) => {
    stopAllRotate(); // 모든 자동 넘어가기 중지
    onMouseActivity(); // 마우스 활동 감지
    
    if (isChangingRef.current) return;
    
    // 즉시 한 번 이동
    moveToNext(dir);

    // 1초마다 반복
    manualIntervalRef.current = setInterval(() => {
      if (!isChangingRef.current) {
        moveToNext(dir);
      }
    }, 1000);
  };

  const stopManualRotate = () => {
    if (manualIntervalRef.current) {
      clearInterval(manualIntervalRef.current);
      manualIntervalRef.current = null;
    }
  };

  // 자동 넘어가기 시작 (마우스 움직임이 없을 때)
  const startAutoRotate = () => {
    if (autoIntervalRef.current) return; // 이미 실행 중이면 무시
    
    autoIntervalRef.current = setInterval(() => {
      if (!isChangingRef.current) {
        moveToNext(1); // 자동으로는 다음으로
      }
    }, 3000);
  };

  const stopAutoRotate = () => {
    if (autoIntervalRef.current) {
      clearInterval(autoIntervalRef.current);
      autoIntervalRef.current = null;
    }
  };

  const stopAllRotate = () => {
    stopManualRotate();
    stopAutoRotate();
  };

  // 마우스 활동 감지
  const onMouseActivity = () => {
    lastMouseMoveRef.current = Date.now();
    stopAutoRotate(); // 자동 넘어가기 중지
    
    // 마우스 활동이 없으면 3초 후 자동 넘어가기 재시작
    if (mouseActivityTimeoutRef.current) {
      clearTimeout(mouseActivityTimeoutRef.current);
    }
    
    mouseActivityTimeoutRef.current = setTimeout(() => {
      // 3초 동안 마우스 움직임이 없으면 자동 넘어가기 시작
      if (Date.now() - lastMouseMoveRef.current >= 3000) {
        startAutoRotate();
      }
    }, 3000);
  };

  // 초기 자동 넘어가기 설정
  useEffect(() => {
    if (novels.length === 0) return;
    
    // 3초 후 자동 넘어가기 시작
    const initialTimeout = setTimeout(() => {
      startAutoRotate();
    }, 3000);

    return () => {
      clearTimeout(initialTimeout);
      stopAllRotate();
      if (mouseActivityTimeoutRef.current) {
        clearTimeout(mouseActivityTimeoutRef.current);
      }
    };
  }, [novels.length]);

  if (novels.length === 0) return null;

  const getNovelByOffset = (offset: number) => {
    const index = (currentIndex + offset + novels.length) % novels.length;
    return novels[index];
  };

  // 마운트되지 않았으면 기본값 사용 (hydration 방지)
  // 초기 렌더링에서는 항상 데스크톱 값을 사용하여 서버/클라이언트 일치 보장
  const containerSize = mounted && isMobile ? 330 : 600;
  const radius = mounted && isMobile ? 165 : 300;
  const cardSize = mounted && isMobile ? 165 : 315;
  const cardSizeSmall = mounted && isMobile ? 143 : 280;
  const height = mounted && isMobile ? 440 : 700;
  
  // 초기 렌더링용 고정 값 (hydration 에러 방지)
  const initialContainerSize = 600;
  const initialRadius = 300;

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        marginTop: "20px",
        marginBottom: mounted && isMobile ? "189px" : "0px",
        perspective: "1500px", // 3D 효과를 위한 원근감
        touchAction: mounted && isMobile ? "pan-y" : "auto", // 모바일에서 수직 스크롤만 허용
      }}
      onMouseMove={onMouseActivity}
      onMouseEnter={onMouseActivity}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="novel-carousel"
    >
      {/* 왼쪽 클릭 영역 */}
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
        onMouseDown={() => startManualRotate(-1)}
        onMouseUp={stopManualRotate}
        onMouseLeave={stopManualRotate}
      />

      {/* 오른쪽 클릭 영역 */}
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
        onMouseDown={() => startManualRotate(1)}
        onMouseUp={stopManualRotate}
        onMouseLeave={stopManualRotate}
      />

      {/* 회전목마 컨테이너 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) rotateY(${rotationAngle}deg)`,
          width: mounted ? `${containerSize}px` : `${initialContainerSize}px`,
          height: mounted ? `${containerSize}px` : `${initialContainerSize}px`,
          transformStyle: "preserve-3d",
          transition: mounted && isMobile && isDragging ? "none" : (mounted ? "transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)" : "none"),
          pointerEvents: "none",
        }}
      >
        {/* 모든 소설을 원형으로 배치 */}
        {novels.map((novel, index) => {
          // 각 소설의 원형 경로상 위치 계산
          const angle = (index * 360) / novels.length;
          const currentRadius = mounted ? radius : initialRadius;
          const x = Math.sin((angle * Math.PI) / 180) * currentRadius;
          const z = Math.cos((angle * Math.PI) / 180) * currentRadius;
          
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
                transition: !mounted ? "none" : (isMobile && isDragging ? "none" : "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)"),
                opacity: opacity,
                zIndex: isCurrent ? 3 : isLeft || isRight ? 1 : 0,
                cursor: isLeft || isRight ? "pointer" : "default",
                pointerEvents: "auto",
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isLeft) {
                  startManualRotate(-1);
                } else if (isRight) {
                  startManualRotate(1);
                }
              }}
              onMouseUp={stopManualRotate}
              onMouseLeave={stopManualRotate}
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
                    width: isCurrent ? `${cardSize}px` : `${cardSizeSmall}px`,
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

      {novels.length > 1 && mounted && !isMobile && (
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
                if (isChangingRef.current || index === currentIndex) return;
                
                const angleStep = 360 / novels.length;
                isChangingRef.current = true;
                
                setRotationAngle((prevAngle) => {
                  const targetAngle = -(index * angleStep);
                  let diff = targetAngle - prevAngle;
                  
                  // 최단 경로 선택
                  if (diff > 180) diff -= 360;
                  if (diff < -180) diff += 360;
                  
                  return prevAngle + diff;
                });
                
                setCurrentIndex(index);
                
                setTimeout(() => {
                  isChangingRef.current = false;
                }, 1600);
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
      {novels.length > 1 && mounted && isMobile && (
        <div
          style={{
            position: "absolute",
            bottom: "189px",
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
                if (isChangingRef.current || index === currentIndex) return;
                
                const angleStep = 360 / novels.length;
                isChangingRef.current = true;
                
                setRotationAngle((prevAngle) => {
                  const targetAngle = -(index * angleStep);
                  let diff = targetAngle - prevAngle;
                  
                  // 최단 경로 선택
                  if (diff > 180) diff -= 360;
                  if (diff < -180) diff += 360;
                  
                  return prevAngle + diff;
                });
                
                setCurrentIndex(index);
                
                setTimeout(() => {
                  isChangingRef.current = false;
                }, 1600);
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
