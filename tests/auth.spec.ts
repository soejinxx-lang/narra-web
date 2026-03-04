import { test, expect } from "@playwright/test";

test.describe("인증 플로우", () => {
    test.describe("로그인", () => {
        test("로그인 폼이 표시된다", async ({ page }) => {
            await page.goto("/login");
            await expect(page.getByTestId("login.username")).toBeVisible();
            await expect(page.getByTestId("login.password")).toBeVisible();
            await expect(page.getByTestId("login.submit")).toBeVisible();
        });

        test("빈 값 제출 시 기본 유효성 검증", async ({ page }) => {
            await page.goto("/login");
            // HTML required 속성에 의한 브라우저 기본 검증
            const usernameInput = page.getByTestId("login.username");
            await expect(usernameInput).toHaveAttribute("required", "");
        });

        test("회원가입 링크가 동작한다", async ({ page }) => {
            await page.goto("/login");
            await page.locator("a[href='/signup']").click();
            await expect(page).toHaveURL(/\/signup/);
        });
    });

    test.describe("회원가입", () => {
        test("회원가입 폼이 표시된다", async ({ page }) => {
            await page.goto("/signup");
            await expect(page.getByTestId("signup.name")).toBeVisible();
            await expect(page.getByTestId("signup.username")).toBeVisible();
            await expect(page.getByTestId("signup.password")).toBeVisible();
            await expect(page.getByTestId("signup.confirm-password")).toBeVisible();
            await expect(page.getByTestId("signup.terms")).toBeVisible();
            await expect(page.getByTestId("signup.privacy")).toBeVisible();
            await expect(page.getByTestId("signup.submit")).toBeVisible();
        });

        test("비밀번호 불일치 시 에러 표시", async ({ page }) => {
            await page.goto("/signup");
            await page.getByTestId("signup.name").fill("Test User");
            await page.getByTestId("signup.username").fill("testuser123");
            await page.getByTestId("signup.password").fill("Password1!");
            await page.getByTestId("signup.confirm-password").fill("DifferentPass1!");
            await page.getByTestId("signup.terms").check();
            await page.getByTestId("signup.privacy").check();
            await page.getByTestId("signup.submit").click();

            const error = page.getByTestId("signup.error");
            await expect(error).toBeVisible({ timeout: 5000 });
            await expect(error).toContainText("match");
        });

        test("로그인 링크가 동작한다", async ({ page }) => {
            await page.goto("/signup");
            await page.locator("a[href='/login']").click();
            await expect(page).toHaveURL(/\/login/);
        });
    });
});
