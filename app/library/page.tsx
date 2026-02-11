"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getReadingNovels, getCurrentUserId, getReadingProgress } from "@/app/utils/readingProgress";
import { getFavorites, getCompleted, getLibraryStats } from "@/app/utils/library";
import { fetchNovels } from "@/lib/api";
import NovelCard from "@/app/components/NovelCard";
import { toRoman } from "@/lib/utils";

type LibraryTab = "reading" | "completed" | "favorites" | "stats";

type SortOption = "recent" | "title" | "progress";

export default function LibraryPage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<LibraryTab>("reading");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [userId, setUserId] = useState<string | null>(null);
  const [readingNovels, setReadingNovels] = useState<Array<{ novelId: string; episodeEp: string; progress: number; lastReadAt: number }>>([]);
  const [novels, setNovels] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [completed, setCompleted] = useState<Record<string, { episodeEp: string; completedAt: number }>>({});
  const [stats, setStats] = useState({ reading: 0, completed: 0, favorites: 0, totalEpisodes: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    setUserId(currentUserId);

    // 읽는 중 목록 가져오기
    const reading = getReadingNovels(currentUserId, 100);
    setReadingNovels(reading);

    // 즐겨찾기 가져오기
    const favs = getFavorites(currentUserId);
    setFavorites(favs);

    // 완독 목록 가져오기
    const comp = getCompleted(currentUserId);
    setCompleted(comp);

    // 통계 가져오기
    const libraryStats = getLibraryStats(currentUserId);
    setStats(libraryStats);

    // 작품 정보 가져오기
    fetchNovels().then(setNovels).catch(() => { });
  }, [router]);

  // 작품 정보와 읽기 진도 매칭
  const readingNovelsWithInfo = useMemo(() => {
    return readingNovels
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
      .filter((item) => item !== null && item.progress > 0)
      .sort((a, b) => {
        if (sortOption === "recent") {
          return (b?.lastReadAt || 0) - (a?.lastReadAt || 0);
        } else if (sortOption === "title") {
          return (a?.title || "").localeCompare(b?.title || "");
        } else if (sortOption === "progress") {
          return (b?.progress || 0) - (a?.progress || 0);
        }
        return 0;
      });
  }, [readingNovels, novels, sortOption]);

  // 완독 작품 목록
  const completedNovelsWithInfo = useMemo(() => {
    return Object.entries(completed)
      .map(([novelId, data]) => {
        const novel = novels.find((n) => n.id === novelId);
        if (!novel) return null;
        return {
          ...novel,
          episodeEp: data.episodeEp,
          completedAt: data.completedAt,
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => {
        if (sortOption === "recent") {
          return (b?.completedAt || 0) - (a?.completedAt || 0);
        } else if (sortOption === "title") {
          return (a?.title || "").localeCompare(b?.title || "");
        }
        return 0;
      });
  }, [completed, novels, sortOption]);

  // 즐겨찾기 작품 목록
  const favoriteNovelsWithInfo = useMemo(() => {
    return favorites
      .map((novelId) => {
        const novel = novels.find((n) => n.id === novelId);
        if (!novel) return null;
        return novel;
      })
      .filter((item) => item !== null)
      .sort((a, b) => {
        if (sortOption === "title") {
          return (a?.title || "").localeCompare(b?.title || "");
        }
        // 즐겨찾기는 추가한 순서대로
        const indexA = favorites.indexOf(a?.id || "");
        const indexB = favorites.indexOf(b?.id || "");
        return indexA - indexB;
      });
  }, [favorites, novels, sortOption]);

  // 마지막 읽은 시간 포맷
  const formatLastRead = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  };

  if (!mounted || !userId) {
    return (
      <main style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{ color: "#999", fontSize: "16px" }}>Loading...</div>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "32px 24px 80px 24px",
        background: "#faf9f6",
        minHeight: "100vh",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 600,
          color: "#243A6E",
          marginBottom: "32px",
          fontFamily: '"KoPub Batang", serif',
        }}
      >
        My Library
      </h1>

      {/* 탭 */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: "2px solid #e5e5e5",
            marginBottom: "24px",
          }}
        >
          {(["reading", "completed", "favorites", "stats"] as LibraryTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              style={{
                padding: "12px 24px",
                background: "transparent",
                border: "none",
                borderBottom: currentTab === tab ? "2px solid #243A6E" : "2px solid transparent",
                color: currentTab === tab ? "#243A6E" : "#666",
                fontSize: "14px",
                fontWeight: currentTab === tab ? 600 : 500,
                cursor: "pointer",
                marginBottom: "-2px",
                transition: "all 0.2s",
              }}
            >
              {tab === "reading" && "Reading"}
              {tab === "completed" && "Completed"}
              {tab === "favorites" && "Favorites"}
              {tab === "stats" && "Stats"}
            </button>
          ))}
        </div>

        {/* 정렬 옵션 (통계 탭 제외) */}
        {currentTab !== "stats" && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #e5e5e5",
                background: "#fff",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <option value="recent">Recently Read</option>
              <option value="title">Title</option>
              {currentTab === "reading" && <option value="progress">Progress</option>}
            </select>
          </div>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      {currentTab === "reading" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {readingNovelsWithInfo.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#999", fontSize: "16px" }}>
              No reading history.
            </div>
          ) : (
            readingNovelsWithInfo.map((novel: any) => (
              <div
                key={novel.id}
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "1px solid #e5e5e5",
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flexShrink: 0, width: "120px" }}>
                  <Link
                    href={`/novels/${novel.id}/episodes/${novel.episodeEp}`}
                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                  >
                    <NovelCard novel={novel} />
                  </Link>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#243A6E", marginBottom: "8px" }}>
                    {novel.title}
                  </h3>
                  <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
                    {novel.episode_format === "roman" ? toRoman(novel.episodeEp) : `EP ${novel.episodeEp}`} • {novel.progress}% progress
                  </div>
                  <div style={{ fontSize: "13px", color: "#999", marginBottom: "12px" }}>
                    Last read: {formatLastRead(novel.lastReadAt)}
                  </div>
                  <Link
                    href={`/novels/${novel.id}/episodes/${novel.episodeEp}`}
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      background: "#243A6E",
                      color: "#fff",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Continue Reading
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {currentTab === "completed" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {completedNovelsWithInfo.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#999", fontSize: "16px" }}>
              No completed novels.
            </div>
          ) : (
            completedNovelsWithInfo.map((novel: any) => (
              <div
                key={novel.id}
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "1px solid #e5e5e5",
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flexShrink: 0, width: "120px" }}>
                  <Link
                    href={`/novels/${novel.id}`}
                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                  >
                    <NovelCard novel={novel} />
                  </Link>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#243A6E", marginBottom: "8px" }}>
                    {novel.title}
                  </h3>
                  <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
                    Completed: {novel.episode_format === "roman" ? toRoman(novel.episodeEp) : `EP ${novel.episodeEp}`}
                  </div>
                  <div style={{ fontSize: "13px", color: "#999" }}>
                    Completed: {formatLastRead(novel.completedAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {currentTab === "favorites" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "20px",
          }}
        >
          {favoriteNovelsWithInfo.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#999", fontSize: "16px", gridColumn: "1 / -1" }}>
              No favorite novels.
            </div>
          ) : (
            favoriteNovelsWithInfo.map((novel: any) => (
              <Link
                key={novel.id}
                href={`/novels/${novel.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <NovelCard novel={novel} />
              </Link>
            ))
          )}
        </div>
      )}

      {currentTab === "stats" && (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "32px", border: "1px solid #e5e5e5" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "24px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#243A6E", marginBottom: "8px" }}>
                {stats.reading}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>Reading</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#243A6E", marginBottom: "8px" }}>
                {stats.completed}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>Completed</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#243A6E", marginBottom: "8px" }}>
                {stats.favorites}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>Favorites</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#243A6E", marginBottom: "8px" }}>
                {stats.totalEpisodes}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>Episodes Read</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

