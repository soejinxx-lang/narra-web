// 읽은 위치 저장 및 불러오기 유틸리티

import { secureSetItem, secureGetItem, secureParseJSON } from "./localStorageSecurity";
import { isValidInput } from "./security";

export interface ReadingProgress {
  novelId: string;
  episodeEp: string;
  progress: number; // 0-100 (읽은 퍼센트)
  lastReadAt: number; // 마지막 읽은 시간 (timestamp)
}

// 사용자별 읽은 위치 저장
export function saveReadingProgress(
  userId: string,
  novelId: string,
  episodeEp: string,
  progress: number,
  scrollPosition?: number // 스크롤 위치 추가
): void {
  if (typeof window === "undefined") return;

  // 입력 검증
  if (!userId || !novelId || !episodeEp || !isValidInput(userId, 100) || !isValidInput(novelId, 100) || !isValidInput(episodeEp, 50)) {
    return;
  }
  
  if (typeof progress !== "number" || progress < 0 || progress > 100) {
    return;
  }
  
  if (scrollPosition !== undefined && (typeof scrollPosition !== "number" || scrollPosition < 0)) {
    return;
  }

  const key = `readingProgress_${userId}`;
  const existing = getReadingProgress(userId);
  
  // 기존 진도 업데이트 또는 새로 추가
  const updated = {
    ...existing,
    [novelId]: {
      episodeEp,
      progress,
      scrollPosition: scrollPosition || existing[novelId]?.scrollPosition || 0, // 스크롤 위치 저장
      lastReadAt: Date.now(),
    },
  };

  secureSetItem(key, updated);
}

// 사용자별 읽은 위치 불러오기
export function getReadingProgress(userId: string): Record<string, { episodeEp: string; progress: number; scrollPosition?: number; lastReadAt: number }> {
  if (typeof window === "undefined") return {};
  
  // 입력 검증
  if (!userId || !isValidInput(userId, 100)) {
    return {};
  }

  const key = `readingProgress_${userId}`;
  const data = secureGetItem(key);
  
  if (!data) return {};
  
  return secureParseJSON(data, {});
}

// 특정 작품의 읽은 위치 불러오기
export function getNovelProgress(userId: string, novelId: string): { episodeEp: string; progress: number; scrollPosition?: number; lastReadAt: number } | null {
  const allProgress = getReadingProgress(userId);
  return allProgress[novelId] || null;
}

// 읽고 있는 작품 목록 가져오기 (최근 읽은 순)
export function getReadingNovels(userId: string, limit: number = 10): Array<{ novelId: string; episodeEp: string; progress: number; scrollPosition?: number; lastReadAt: number }> {
  const allProgress = getReadingProgress(userId);
  
  return Object.entries(allProgress)
    .map(([novelId, data]) => ({
      novelId,
      ...data,
    }))
    .sort((a, b) => b.lastReadAt - a.lastReadAt)
    .slice(0, limit);
}

// 스크롤 위치 저장 (비로그인 사용자용 세션 스토리지)
export function saveSessionScrollPosition(
  novelId: string,
  episodeEp: string,
  scrollPosition: number,
  progress: number
): void {
  if (typeof window === "undefined") return;
  
  // 입력 검증
  if (!novelId || !episodeEp || !isValidInput(novelId, 100) || !isValidInput(episodeEp, 50)) {
    return;
  }
  
  if (typeof progress !== "number" || progress < 0 || progress > 100) {
    return;
  }
  
  if (typeof scrollPosition !== "number" || scrollPosition < 0) {
    return;
  }
  
  const key = `sessionReadingProgress`;
  const existingData = sessionStorage.getItem(key);
  const existing = secureParseJSON(
    existingData, 
    {} as Record<string, { episodeEp: string; progress: number; scrollPosition?: number; lastReadAt: number }>
  );
  
  existing[novelId] = {
    episodeEp,
    progress,
    scrollPosition,
    lastReadAt: Date.now(),
  };
  
  try {
    sessionStorage.setItem(key, JSON.stringify(existing));
  } catch (error) {
    console.error("Failed to save session progress:", error);
  }
}

// 세션 스토리지에서 읽은 위치 불러오기
export function getSessionReadingProgress(): Record<string, { episodeEp: string; progress: number; scrollPosition?: number; lastReadAt: number }> {
  if (typeof window === "undefined") return {};
  
  const data = sessionStorage.getItem("sessionReadingProgress");
  if (!data) return {};
  
  return secureParseJSON(
    data, 
    {} as Record<string, { episodeEp: string; progress: number; scrollPosition?: number; lastReadAt: number }>
  );
}

// 현재 로그인한 사용자 ID 가져오기
export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  
  const currentUser = secureGetItem("currentUser");
  if (!currentUser) return null;
  
  try {
    const user = secureParseJSON(currentUser, null);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return null;
    }
    const userId = String(user.id);
    // ID 검증
    if (isValidInput(userId, 100)) {
      return userId;
    }
    return null;
  } catch {
    return null;
  }
}

