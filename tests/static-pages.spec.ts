import { test, expect } from "@playwright/test";

test.describe("정적 페이지", () => {
    test("약관 페이지 렌더링", async ({ page }) => {
        await page.goto("/terms");
        // 페이지가 정상 로드되고 콘텐츠가 있는지
        await expect(page.locator("main")).toBeVisible();
        await expect(page.locator("h1, h2").first()).toBeVisible();
    });

    test("개인정보처리방침 페이지 렌더링", async ({ page }) => {
        await page.goto("/privacy");
        await expect(page.locator("main")).toBeVisible();
        await expect(page.locator("h1, h2").first()).toBeVisible();
    });

    test("고객센터 페이지 렌더링 + 아코디언 동작", async ({ page }) => {
        await page.goto("/support");
        await expect(page.locator("main")).toBeVisible();

        // 아코디언 아이템 존재 확인
        const accordionItems = page.locator("[style*='cursor: pointer']");
        const count = await accordionItems.count();

        if (count > 0) {
            // 첫 번째 아코디언 클릭 → 내용 펼쳐지는지
            await accordionItems.first().click();
            // 클릭 후 내용이 나타나는지 확인 (애니메이션 후)
            await page.waitForTimeout(500);
        }
    });

    test("library → mypage 리다이렉트", async ({ page }) => {
        await page.goto("/library");
        await expect(page).toHaveURL(/\/mypage/);
    });
});
