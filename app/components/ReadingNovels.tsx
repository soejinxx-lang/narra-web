"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getReadingNovels, getCurrentUserId, getSessionReadingProgress } from "@/app/utils/readingProgress";
import { getSessionClickedNovels } from "@/app/utils/clickTracking";
import { fetchNovels } from "@/lib/api";
import NovelCard from "@/app/components/NovelCard";

type ReadingNovelsProps = {
  allNovels?: any[];
};

export default function ReadingNovels({ allNovels = [] }: ReadingNovelsProps) {
  const [readingNovels, setReadingNovels] = useState<Array<{ novelId: string; episodeEp: string; progress: number; lastReadAt: number; history?: Record<string, { progress: number; scrollPosition?: number; lastReadAt: number }> }>>([]);
  const [sessionClickedNovels, setSessionClickedNovels] = useState<Array<{ novelId: string; lastClickedAt: number }>>([]);
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

    // 세션 기반 클릭한 소설 목록 가져오기 (로그인 여부와 관계없이)
    const sessionClicked = getSessionClickedNovels();
    setSessionClickedNovels(sessionClicked);

    const userId = getCurrentUserId();
    if (userId) {
      // 로그인한 사용자: 읽은 진도 가져오기
      const reading = getReadingNovels(userId, 10);
      setReadingNovels(reading);
    } else {
      // 로그인하지 않은 사용자: sessionStorage에서 읽은 진도 가져오기
      const sessionProgress = getSessionReadingProgress();
      const sessionReadingList = Object.entries(sessionProgress)
        .map(([novelId, data]) => ({
          novelId,
          episodeEp: data.episodeEp,
          progress: data.progress,
          lastReadAt: data.lastReadAt,
        }))
        .sort((a, b) => b.lastReadAt - a.lastReadAt)
        .slice(0, 10);
      setReadingNovels(sessionReadingList);
    }

    // 작품 정보가 없으면 가져오기
    if (novels.length === 0) {
      fetchNovels().then(setNovels).catch(() => { });
    }

    // sessionStorage 변경 감지 (다른 탭에서 클릭해도 반영)
    const handleStorageChange = () => {
      const updated = getSessionClickedNovels();
      setSessionClickedNovels(updated);
    };

    window.addEventListener("storage", handleStorageChange);

    // 주기적으로 세션 클릭 목록 확인 (같은 탭 내에서도)
    const interval = setInterval(() => {
      const updated = getSessionClickedNovels();
      if (JSON.stringify(updated) !== JSON.stringify(sessionClickedNovels)) {
        setSessionClickedNovels(updated);
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [mounted, novels.length]);

  // 읽고 있는 작품과 작품 정보 매칭 (로그인한 사용자)
  const loggedInNovelsWithInfo = useMemo(() => {
    return readingNovels
      .map((reading) => {
        const novel = novels.find((n) => n.id === reading.novelId);
        if (!novel) return null;
        return {
          ...novel,
          episodeEp: reading.episodeEp,
          progress: reading.progress,
          lastReadAt: reading.lastReadAt,
          history: reading.history || {},
          hasProgress: true,
        };
      })
      .filter((item) => item !== null && item.progress > 0) // 진도가 있는 것만
      .sort((a, b) => (b?.lastReadAt || 0) - (a?.lastReadAt || 0)); // 최근 읽은 순으로 정렬
  }, [readingNovels, novels]);

  // 세션 기반 클릭한 소설과 작품 정보 매칭 (로그인하지 않은 사용자 또는 로그인한 사용자의 추가)
  const sessionNovelsWithInfo = useMemo(() => {
    const userId = getCurrentUserId();
    const loggedInNovelIds = new Set(readingNovels.map(r => r.novelId));

    // 세션에서 읽은 진도 가져오기
    const sessionProgress = getSessionReadingProgress();

    return sessionClickedNovels
      .map((clicked) => {
        // 로그인한 사용자의 경우 이미 진도가 있는 소설은 제외
        if (userId && loggedInNovelIds.has(clicked.novelId)) {
          return null;
        }

        const novel = novels.find((n) => n.id === clicked.novelId);
        if (!novel) return null;

        // 세션에서 읽은 진도가 있는지 확인
        const sessionData = sessionProgress[clicked.novelId];
        if (sessionData && sessionData.progress > 0) {
          return {
            ...novel,
            episodeEp: sessionData.episodeEp,
            progress: sessionData.progress,
            lastReadAt: Math.max(sessionData.lastReadAt, clicked.lastClickedAt),
            hasProgress: true,
          };
        }

        return {
          ...novel,
          episodeEp: null,
          progress: 0,
          lastReadAt: clicked.lastClickedAt,
          hasProgress: false,
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => (b?.lastReadAt || 0) - (a?.lastReadAt || 0)); // 최근 클릭 순으로 정렬
  }, [sessionClickedNovels, novels, readingNovels]);

  // 두 목록 합치기 (로그인한 사용자의 진도 있는 소설 우선, 그 다음 세션 클릭한 소설, 중복 제거)
  const readingNovelsWithInfo = useMemo(() => {
    const novelIds = new Set<string>();
    const uniqueNovels: any[] = [];

    // 로그인한 사용자의 진도 있는 소설 먼저 추가
    for (const novel of loggedInNovelsWithInfo) {
      if (novel && !novelIds.has(novel.id)) {
        novelIds.add(novel.id);
        uniqueNovels.push(novel);
      }
    }

    // 세션 클릭한 소설 추가 (중복 제외)
    for (const novel of sessionNovelsWithInfo) {
      if (novel && !novelIds.has(novel.id)) {
        novelIds.add(novel.id);
        uniqueNovels.push(novel);
      }
    }

    // 최근 읽은 순으로 정렬
    const sorted = uniqueNovels.sort((a, b) => (b?.lastReadAt || 0) - (a?.lastReadAt || 0));

    // showAll이 false면 최대 3개만, true면 모두 표시
    return showAll ? sorted : sorted.slice(0, 3);
  }, [loggedInNovelsWithInfo, sessionNovelsWithInfo, showAll]);

  // 전체 작품 개수 확인 (진도 있는 것 + 세션 클릭한 것)
  const allReadingNovelsCount = useMemo(() => {
    return loggedInNovelsWithInfo.length + sessionNovelsWithInfo.length;
  }, [loggedInNovelsWithInfo.length, sessionNovelsWithInfo.length]);

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
          Continue Reading
        </div>
        {mounted && allReadingNovelsCount > 3 && readingNovelsWithInfo.length > 0 && (
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
            {showAll ? "Show Less" : `View All (${allReadingNovelsCount}) →`}
          </button>
        )}
      </div>

      {!mounted ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#999",
            fontSize: "16px",
          }}
        >
          Loading...
        </div>
      ) : readingNovelsWithInfo.length === 0 ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#999",
            fontSize: "16px",
          }}
        >
          No recent reading history.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0",
          }}
        >
          {readingNovelsWithInfo.map((novel: any, index: number) => (
            <div
              key={novel.id}
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "8px",
                alignItems: "flex-start",
                paddingTop: isMobile ? "6px" : "8px",
                paddingLeft: isMobile ? "6px" : "8px",
                paddingBottom: isMobile ? "6px" : "8px",
                paddingRight: "0.5cm",
                borderRight: (index + 1) % (isMobile ? 2 : 3) !== 0 ? "1px solid #e5e5e5" : "none",
                borderBottom: index < readingNovelsWithInfo.length - (isMobile ? 2 : 3) ? "1px solid #e5e5e5" : "none",
              }}
            >
              {/* NovelCard */}
              <div style={{ flexShrink: 0, width: isMobile ? "100px" : "140px" }}>
                <Link
                  href={novel.hasProgress && novel.progress > 0 ? `/novels/${novel.id}/episodes/${novel.episodeEp}` : `/novels/${novel.id}`}
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  <NovelCard novel={novel} />
                </Link>
              </div>

              {/* 진도 정보 표시 (NovelCard 옆) - 최근 4개 에피소드 */}
              {novel.hasProgress && novel.progress > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {(() => {
                    // history에서 최근 4개 에피소드 가져오기
                    const history = novel.history || {};
                    const recentEpisodes = Object.entries(history)
                      .sort(([, a]: any, [, b]: any) => b.lastReadAt - a.lastReadAt)
                      .slice(0, 4);

                    return recentEpisodes.map(([ep, data]: any) => (
                      <div
                        key={ep}
                        style={{
                          width: "3cm",
                          height: "1.8cm",
                          padding: "2px 4px",
                          background: "#fff",
                          borderRadius: "0px",
                          border: "1px solid #e5e5e5",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "2px",
                          boxSizing: "border-box",
                        }}
                      >
                        <div style={{ fontSize: "15px", color: "#666", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                          EP {ep}
                        </div>
                        <div style={{ fontSize: "15px", color: "#666", fontWeight: 500, lineHeight: 1.2, whiteSpace: "nowrap" }}>
                          {data.progress}%
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


