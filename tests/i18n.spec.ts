import { test, expect } from "@playwright/test";

test.describe("i18n 언어 전환", () => {
    test("기본 한국어로 약관 페이지 렌더링", async ({ page }) => {
        // narra-locale 쿠키를 ko로 설정
        await page.context().addCookies([
            { name: "narra-locale", value: "ko", url: "http://localhost:3000" },
        ]);

        await page.goto("/terms");
        // 한국어 콘텐츠 확인
        await expect(page.locator("body")).toContainText("이용약관");
    });

    test("영어로 전환 시 약관 페이지 영어 렌더링", async ({ page }) => {
        await page.context().addCookies([
            { name: "narra-locale", value: "en", url: "http://localhost:3000" },
        ]);

        await page.goto("/terms");
        await expect(page.locator("body")).toContainText("Terms");
    });

    test("한국어 개인정보처리방침 렌더링", async ({ page }) => {
        await page.context().addCookies([
            { name: "narra-locale", value: "ko", url: "http://localhost:3000" },
        ]);

        await page.goto("/privacy");
        await expect(page.locator("body")).toContainText("개인정보");
    });

    test("영어 개인정보처리방침 렌더링", async ({ page }) => {
        await page.context().addCookies([
            { name: "narra-locale", value: "en", url: "http://localhost:3000" },
        ]);

        await page.goto("/privacy");
        await expect(page.locator("body")).toContainText("Privacy");
    });
});
