import { isValidInput } from "./security";
import { secureSetItem, secureGetItem, secureParseJSON } from "./localStorageSecurity";

export function trackNovelClick(novelId: string) {
  if (typeof window === "undefined") return;
  
  // 입력 검증
  if (!novelId || !isValidInput(novelId, 100)) {
    return;
  }
  
  // localStorage에 클릭 수 저장 (영구 저장)
  const clicksData = secureGetItem("novelClicks");
  const clicks = secureParseJSON<Record<string, number>>(clicksData, {});
  clicks[novelId] = (clicks[novelId] || 0) + 1;
  
  // 클릭 수 제한 (최대 100만)
  if (clicks[novelId] > 1000000) {
    clicks[novelId] = 1000000;
  }
  
  secureSetItem("novelClicks", clicks);
  
  // sessionStorage에 클릭한 소설 목록 저장 (세션 기반, 탭 닫으면 사라짐)
  const sessionClicksData = sessionStorage.getItem("sessionNovelClicks");
  const sessionClicks = secureParseJSON<Record<string, number>>(sessionClicksData, {});
  sessionClicks[novelId] = Date.now(); // 마지막 클릭 시간 저장
  
  try {
    sessionStorage.setItem("sessionNovelClicks", JSON.stringify(sessionClicks));
  } catch (error) {
    console.error("Failed to save session clicks:", error);
  }
}

export function getNovelClicks(): Record<string, number> {
  if (typeof window === "undefined") return {};
  const data = secureGetItem("novelClicks");
  return secureParseJSON<Record<string, number>>(data, {});
}

export function getNovelClickCount(novelId: string): number {
  if (typeof window === "undefined") return 0;
  const clicks = getNovelClicks();
  return clicks[novelId] || 0;
}

// 세션 기반 클릭한 소설 목록 가져오기 (최근 클릭 순)
export function getSessionClickedNovels(): Array<{ novelId: string; lastClickedAt: number }> {
  if (typeof window === "undefined") return [];
  
  const sessionClicksData = sessionStorage.getItem("sessionNovelClicks");
  const sessionClicks = secureParseJSON<Record<string, number>>(sessionClicksData, {});
  
  return Object.entries(sessionClicks)
    .filter(([novelId]) => isValidInput(novelId, 100)) // 유효한 novelId만 필터링
    .map(([novelId, lastClickedAt]) => ({
      novelId,
      lastClickedAt: typeof lastClickedAt === "number" ? lastClickedAt : 0,
    }))
    .sort((a, b) => b.lastClickedAt - a.lastClickedAt); // 최근 클릭 순으로 정렬
}

