import { defineConfig } from "@playwright/test";

// CI용 설정 — 배포된 Vercel URL을 직접 테스트
// 로컬 서버 없이 프로덕션 URL로 바로 테스트
// CI용: 리포터가 결과를 narra-storage API로 전송하도록 설정
process.env.TEST_RESULTS_API_URL = "https://narra-storage.railway.app/api/test-results";

export default defineConfig({
    testDir: "./tests",
    timeout: 30 * 1000,
    retries: 1,
    use: {
        baseURL: "https://www.narra.kr",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },
    reporter: [
        ["list"],
        ["./tests/api-reporter.ts"],
    ],
    // webServer 없음 — 이미 배포된 URL 사용
    projects: [
        {
            name: "chromium",
            use: { browserName: "chromium" },
        },
    ],
});
