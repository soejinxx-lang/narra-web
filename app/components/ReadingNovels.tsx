"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getReadingNovels, getCurrentUserId } from "@/app/utils/readingProgress";
import { fetchNovels } from "@/lib/api";

type ReadingNovelsProps = {
  allNovels?: any[];
};

export default function ReadingNovels({ allNovels = [] }: ReadingNovelsProps) {
  const [readingNovels, setReadingNovels] = useState<Array<{ novelId: string; episodeEp: string; progress: number; lastReadAt: number }>>([]);
  const [novels, setNovels] = useState<any[]>(allNovels);
  const [isMobile, setIsMobile] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    // 마운트되지 않았으면 실행하지 않음
    if (!mounted) return;
    
    const userId = getCurrentUserId();
    if (!userId) {
      setReadingNovels([]);
      return;
    }

    // 읽고 있는 작품 목록 가져오기
    const reading = getReadingNovels(userId, 10);
    setReadingNovels(reading);

    // 작품 정보가 없으면 가져오기
    if (novels.length === 0) {
      fetchNovels().then(setNovels).catch(() => {});
    }
  }, [mounted, novels.length]);

  // 읽고 있는 작품과 작품 정보 매칭
  const readingNovelsWithInfo = useMemo(() => {
    const filtered = readingNovels
      .map((reading) => {
        const novel = novels.find((n) => n.id === reading.novelId);
        if (!novel) return null;
        return {
          ...novel,
          episodeEp: reading.episodeEp,
          progress: reading.progress,
          lastReadAt: reading.lastReadAt,
        };
      })
      .filter((item) => item !== null && item.progress > 0) // 진도가 있는 것만
      .sort((a, b) => (b?.lastReadAt || 0) - (a?.lastReadAt || 0)); // 최근 읽은 순으로 정렬
    
    // showAll이 false면 최대 3개만, true면 모두 표시
    return showAll ? filtered : filtered.slice(0, 3);
  }, [readingNovels, novels, showAll]);

  // 전체 작품 개수 확인
  const allReadingNovelsCount = useMemo(() => {
    return readingNovels.filter((r) => {
      const novel = novels.find((n) => n.id === r.novelId);
      return novel && r.progress > 0;
    }).length;
  }, [readingNovels, novels]);

  // 서버 사이드 렌더링 시에는 아무것도 렌더링하지 않음 (hydration 방지)
  if (!mounted) {
    return null;
  }

  return (
    <section style={{ marginBottom: "60px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#243A6E",
            marginBottom: "20px",
            paddingBottom: "12px",
            borderBottom: "2px solid #243A6E",
            fontFamily: '"KoPub Batang", serif',
          }}
        >
          이어서 읽기
        </div>
        {allReadingNovelsCount > 3 && readingNovelsWithInfo.length > 0 && (
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              background: "transparent",
              border: "none",
              color: "#243A6E",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            {showAll ? "접기" : `더보기 (${allReadingNovelsCount}개) →`}
          </button>
        )}
      </div>
      
      {readingNovelsWithInfo.length === 0 ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#999",
            fontSize: "16px",
          }}
        >
          최근에 읽은 소설이 없습니다.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mounted && isMobile ? "repeat(3, minmax(0, 1fr))" : "repeat(auto-fill, minmax(140px, 1fr))",
            gap: mounted && isMobile ? "16px" : "20px",
          }}
        >
          {readingNovelsWithInfo.map((novel: any) => (
          <Link
            key={novel.id}
            href={`/novels/${novel.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* 표지 이미지 */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "2 / 3",
                  background: "#243A6E",
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginBottom: "8px",
                  position: "relative",
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
                    }}
                  />
                )}
                
                {/* 진도 표시 오버레이 */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                    padding: "8px",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {novel.episodeEp}화 {novel.progress}%
                </div>
              </div>
              
              {/* 제목 */}
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#333",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {novel.title}
              </div>
            </div>
          </Link>
        ))}
        </div>
      )}
    </section>
  );
}

