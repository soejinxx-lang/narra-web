export function trackNovelClick(novelId: string) {
  if (typeof window === "undefined") return;
  
  const clicks = JSON.parse(localStorage.getItem("novelClicks") || "{}");
  clicks[novelId] = (clicks[novelId] || 0) + 1;
  localStorage.setItem("novelClicks", JSON.stringify(clicks));
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

