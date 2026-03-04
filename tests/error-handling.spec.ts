import { test, expect } from "@playwright/test";

test.describe("에러 핸들링", () => {
    test("존재하지 않는 소설 → 에러 처리", async ({ page }) => {
        const response = await page.goto("/novels/nonexistent-novel-id-12345");
        // 서버에서 에러 페이지 또는 404 반환
        if (response) {
            const status = response.status();
            // 500이 아닌 정상적인 에러 핸들링 확인 (404 또는 에러 UI)
            expect(status).not.toBe(500);
        }
    });

    test("존재하지 않는 에피소드 → 에러 처리", async ({ page }) => {
        const response = await page.goto("/novels/fake-novel/episodes/99999");
        if (response) {
            expect(response.status()).not.toBe(500);
        }
    });

    test("API 실패 시 홈페이지 에러 UI", async ({ page }) => {
        // 네트워크 모킹: API 요청 차단
        await page.route("**/api/novels*", (route) => {
            route.fulfill({
                status: 500,
                contentType: "application/json",
                body: JSON.stringify({ error: "Internal Server Error" }),
            });
        });

        // 홈페이지 접근 → 크래시하지 않는지 확인
        await page.goto("/");
        // 페이지가 최소한 렌더링은 되어야 함 (빈 화면이 아닌)
        await expect(page.locator("body")).not.toBeEmpty();
    });

    test("로그인 API 실패 시 에러 메시지 표시", async ({ page }) => {
        // 로그인 API 모킹: 500 에러
        await page.route("**/api/auth/login", (route) => {
            route.fulfill({
                status: 500,
                contentType: "application/json",
                body: JSON.stringify({ error: "Server error" }),
            });
        });

        await page.goto("/login");
        await page.getByTestId("login.username").fill("testuser");
        await page.getByTestId("login.password").fill("testpass123");
        await page.getByTestId("login.submit").click();

        // 에러 메시지가 표시되는지
        const error = page.getByTestId("login.error");
        await expect(error).toBeVisible({ timeout: 5000 });
    });
});
