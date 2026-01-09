export function trackNovelClick(novelId: string) {
  if (typeof window === "undefined") return;
  
  // localStorage에 클릭 수 저장 (영구 저장)
  const clicks = JSON.parse(localStorage.getItem("novelClicks") || "{}");
  clicks[novelId] = (clicks[novelId] || 0) + 1;
  localStorage.setItem("novelClicks", JSON.stringify(clicks));
  
  // sessionStorage에 클릭한 소설 목록 저장 (세션 기반, 탭 닫으면 사라짐)
  const sessionClicks = JSON.parse(sessionStorage.getItem("sessionNovelClicks") || "{}");
  sessionClicks[novelId] = Date.now(); // 마지막 클릭 시간 저장
  sessionStorage.setItem("sessionNovelClicks", JSON.stringify(sessionClicks));
}

export function getNovelClicks(): Record<string, number> {
  if (typeof window === "undefined") return {};
  return JSON.parse(localStorage.getItem("novelClicks") || "{}");
}

export function getNovelClickCount(novelId: string): number {
  if (typeof window === "undefined") return 0;
  const clicks = getNovelClicks();
  return clicks[novelId] || 0;
}

// 세션 기반 클릭한 소설 목록 가져오기 (최근 클릭 순)
export function getSessionClickedNovels(): Array<{ novelId: string; lastClickedAt: number }> {
  if (typeof window === "undefined") return [];
  
  const sessionClicks = JSON.parse(sessionStorage.getItem("sessionNovelClicks") || "{}");
  
  return Object.entries(sessionClicks)
    .map(([novelId, lastClickedAt]) => ({
      novelId,
      lastClickedAt: lastClickedAt as number,
    }))
    .sort((a, b) => b.lastClickedAt - a.lastClickedAt); // 최근 클릭 순으로 정렬
}

