// 내 서재 관련 유틸리티 함수

import { getReadingProgress } from "./readingProgress";

// 즐겨찾기 추가
export function addToFavorites(userId: string, novelId: string): void {
  if (typeof window === "undefined") return;
  
  const key = `favorites_${userId}`;
  const favorites = getFavorites(userId);
  
  if (!favorites.includes(novelId)) {
    favorites.push(novelId);
    localStorage.setItem(key, JSON.stringify(favorites));
  }
}

// 즐겨찾기 제거
export function removeFromFavorites(userId: string, novelId: string): void {
  if (typeof window === "undefined") return;
  
  const key = `favorites_${userId}`;
  const favorites = getFavorites(userId);
  
  const filtered = favorites.filter(id => id !== novelId);
  localStorage.setItem(key, JSON.stringify(filtered));
}

// 즐겨찾기 목록 가져오기
export function getFavorites(userId: string): string[] {
  if (typeof window === "undefined") return [];
  
  const key = `favorites_${userId}`;
  const data = localStorage.getItem(key);
  
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// 즐겨찾기 여부 확인
export function isFavorite(userId: string, novelId: string): boolean {
  const favorites = getFavorites(userId);
  return favorites.includes(novelId);
}

// 완독 작품 추가
export function markAsCompleted(userId: string, novelId: string, episodeEp: string): void {
  if (typeof window === "undefined") return;
  
  const key = `completed_${userId}`;
  const completed = getCompleted(userId);
  
  completed[novelId] = {
    episodeEp,
    completedAt: Date.now(),
  };
  
  localStorage.setItem(key, JSON.stringify(completed));
}

// 완독 작품 목록 가져오기
export function getCompleted(userId: string): Record<string, { episodeEp: string; completedAt: number }> {
  if (typeof window === "undefined") return {};
  
  const key = `completed_${userId}`;
  const data = localStorage.getItem(key);
  
  if (!data) return {};
  
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// 완독 여부 확인
export function isCompleted(userId: string, novelId: string): boolean {
  const completed = getCompleted(userId);
  return completed.hasOwnProperty(novelId);
}

// 통계 정보 가져오기
export function getLibraryStats(userId: string): {
  reading: number;
  completed: number;
  favorites: number;
  totalEpisodes: number;
} {
  const reading = getReadingProgress(userId);
  const completed = getCompleted(userId);
  const favorites = getFavorites(userId);
  
  // 읽은 에피소드 수 계산
  let totalEpisodes = 0;
  Object.values(reading).forEach((progress) => {
    if (progress.progress > 0) {
      totalEpisodes++;
    }
  });
  
  return {
    reading: Object.keys(reading).filter(id => reading[id].progress > 0).length,
    completed: Object.keys(completed).length,
    favorites: favorites.length,
    totalEpisodes,
  };
}

