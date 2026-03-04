import { test, expect } from "@playwright/test";

test.describe("홈페이지", () => {
    test("NARRA 로고가 보인다", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator(".narra-logo")).toBeVisible();
    });

    test("소설 카드가 렌더링된다", async ({ page }) => {
        await page.goto("/");
        // NovelCard 컴포넌트가 최소 1개 이상 렌더링
        const cards = page.locator("[class*='novelCard']");
        await expect(cards.first()).toBeVisible({ timeout: 10000 });
    });

    test("네비게이션 링크가 동작한다", async ({ page }) => {
        await page.goto("/");

        // NARRA 로고 클릭 → /novels로 이동
        await page.locator(".narra-logo").click();
        await expect(page).toHaveURL(/\/novels/);
    });

    test("소설 목록 페이지 접근 가능", async ({ page }) => {
        await page.goto("/novels");
        await expect(page).toHaveURL(/\/novels/);
        // 소설 카드가 보이는지
        const cards = page.locator("[class*='novelCard']");
        await expect(cards.first()).toBeVisible({ timeout: 10000 });
    });
});
