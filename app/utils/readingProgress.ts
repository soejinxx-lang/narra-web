// 읽은 위치 저장 및 불러오기 유틸리티

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
  progress: number
): void {
  if (typeof window === "undefined") return;

  const key = `readingProgress_${userId}`;
  const existing = getReadingProgress(userId);
  
  // 기존 진도 업데이트 또는 새로 추가
  const updated = {
    ...existing,
    [novelId]: {
      episodeEp,
      progress,
      lastReadAt: Date.now(),
    },
  };

  localStorage.setItem(key, JSON.stringify(updated));
}

// 사용자별 읽은 위치 불러오기
export function getReadingProgress(userId: string): Record<string, { episodeEp: string; progress: number; lastReadAt: number }> {
  if (typeof window === "undefined") return {};

  const key = `readingProgress_${userId}`;
  const data = localStorage.getItem(key);
  
  if (!data) return {};
  
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// 특정 작품의 읽은 위치 불러오기
export function getNovelProgress(userId: string, novelId: string): { episodeEp: string; progress: number; lastReadAt: number } | null {
  const allProgress = getReadingProgress(userId);
  return allProgress[novelId] || null;
}

// 읽고 있는 작품 목록 가져오기 (최근 읽은 순)
export function getReadingNovels(userId: string, limit: number = 10): Array<{ novelId: string; episodeEp: string; progress: number; lastReadAt: number }> {
  const allProgress = getReadingProgress(userId);
  
  return Object.entries(allProgress)
    .map(([novelId, data]) => ({
      novelId,
      ...data,
    }))
    .sort((a, b) => b.lastReadAt - a.lastReadAt)
    .slice(0, limit);
}

// 현재 로그인한 사용자 ID 가져오기
export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return null;
  
  try {
    const user = JSON.parse(currentUser);
    return user.id || null;
  } catch {
    return null;
  }
}

