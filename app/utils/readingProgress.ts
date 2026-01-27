// 읽은 위치 저장 및 불러오기 유틸리티

import { secureSetItem, secureGetItem, secureParseJSON } from "./localStorageSecurity";
import { isValidInput } from "./security";

export interface ReadingProgress {
  novelId: string;
  episodeEp: string; // 가장 최근에 읽은 에피소드 (이어보기용)
  progress: number; // 0-100 (읽은 퍼센트)
  lastReadAt: number; // 마지막 읽은 시간 (timestamp)
  // 에피소드별 히스토리 추가
  history?: Record<string, {
    progress: number;
    scrollPosition?: number;
    lastReadAt: number
  }>;
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

  // 기존 데이터 가져오기 (없으면 빈 객체)
  const currentNovelData = existing[novelId] || {
    history: {}
  };

  // 히스토리 업데이트
  const updatedHistory = {
    ...(currentNovelData.history || {}),
    [episodeEp]: {
      progress,
      scrollPosition: scrollPosition || 0,
      lastReadAt: Date.now()
    }
  };

  // 기존 진도 업데이트 또는 새로 추가
  const updated = {
    ...existing,
    [novelId]: {
      ...currentNovelData,
      // 메인 필드는 "가장 최근(이어보기용)" 정보로 업데이트
      novelId,
      episodeEp,
      progress,
      scrollPosition: scrollPosition || currentNovelData.scrollPosition || 0,
      lastReadAt: Date.now(),
      history: updatedHistory // 히스토리 저장
    },
  };

  secureSetItem(key, updated);
}

// 사용자별 읽은 위치 불러오기
export function getReadingProgress(userId: string): Record<string, ReadingProgress> {
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
export function getNovelProgress(userId: string, novelId: string): ReadingProgress | null {
  const allProgress = getReadingProgress(userId);
  return allProgress[novelId] || null;
}

// (NEW) 특정 에피소드의 진도율 가져오기
export function getEpisodeProgress(userId: string, novelId: string, episodeEp: string): number | null {
  const novelData = getNovelProgress(userId, novelId);
  if (!novelData) return null;

  // 1. 히스토리에서 확인
  if (novelData.history && novelData.history[episodeEp]) {
    return novelData.history[episodeEp].progress;
  }

  // 2. 하위 호환성 (히스토리가 없는 옛날 데이터인 경우, 메인 기록과 비교)
  if (novelData.episodeEp === episodeEp) {
    return novelData.progress;
  }

  return null;
}

// 읽고 있는 작품 목록 가져오기 (최근 읽은 순)
export function getReadingNovels(userId: string, limit: number = 10): Array<ReadingProgress> {
  const allProgress = getReadingProgress(userId);

  return Object.entries(allProgress)
    .map(([novelId, data]) => ({
      ...data,
      novelId, // novelId가 데이터 안에 없을 수도 있으므로 명시적 주입
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
    {} as Record<string, any>
  );

  // 세션 스토리지도 history 구조 추가? 일단 간단하게 메인만 업데이트
  // (복잡성을 줄이기 위해 세션은 기존 유지, 필요하면 확장 가능)
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
export function getSessionReadingProgress(): Record<string, any> {
  if (typeof window === "undefined") return {};

  const data = sessionStorage.getItem("sessionReadingProgress");
  if (!data) return {};

  return secureParseJSON(data, {});
}

// 현재 로그인한 사용자 ID 가져오기
export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;

  const currentUser = secureGetItem("currentUser");
  if (!currentUser) return null;

  try {
    const user = secureParseJSON(currentUser, null) as { id: string | number } | null;
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

