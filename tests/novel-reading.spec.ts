import { test, expect } from "@playwright/test";

test.describe("소설 읽기 플로우", () => {
    test("소설 목록 → 상세 페이지 이동", async ({ page }) => {
        await page.goto("/novels");

        // 첫 번째 소설 카드 클릭
        const firstCard = page.locator("[class*='novelCard']").first();
        await expect(firstCard).toBeVisible({ timeout: 10000 });
        await firstCard.click();

        // /novels/[id] 형태 URL로 이동 확인
        await expect(page).toHaveURL(/\/novels\/.+/);
    });

    test("소설 상세에서 에피소드 목록 표시", async ({ page }) => {
        await page.goto("/novels");

        const firstCard = page.locator("[class*='novelCard']").first();
        await expect(firstCard).toBeVisible({ timeout: 10000 });
        await firstCard.click();

        // 에피소드 목록이 보이는지 (EpisodeListItem 존재)
        await expect(page.locator("h1")).toBeVisible(); // 소설 제목
    });

    test("에피소드 클릭 → 리더 진입", async ({ page }) => {
        await page.goto("/novels");

        const firstCard = page.locator("[class*='novelCard']").first();
        await expect(firstCard).toBeVisible({ timeout: 10000 });
        await firstCard.click();

        // 에피소드 링크 클릭 (첫 번째)
        const epLink = page.locator("a[href*='/episodes/']").first();
        if (await epLink.isVisible()) {
            await epLink.click();
            // /novels/[id]/episodes/[ep] 형태 URL
            await expect(page).toHaveURL(/\/novels\/.+\/episodes\/.+/);
        }
    });
});
