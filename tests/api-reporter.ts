import type {
    FullConfig,
    FullResult,
    Reporter,
    Suite,
    TestCase,
    TestResult,
} from "@playwright/test/reporter";
import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";

interface TestEntry {
    test_path: string;
    suite: string;
    name: string;
    status: string;
    duration: number;
    error_message: string | null;
    error_stack: string | null;
}

class ApiReporter implements Reporter {
    private tests: TestEntry[] = [];
    private startTime = 0;

    onBegin(_config: FullConfig, _suite: Suite) {
        this.startTime = Date.now();
    }

    onTestEnd(test: TestCase, result: TestResult) {
        const suitePath = test.parent.titlePath().filter(Boolean);
        const suite = suitePath[0] || "unknown";
        const name = test.title;
        const testPath = [...suitePath, name].join("/");

        let errorMessage: string | null = null;
        let errorStack: string | null = null;

        if (result.errors.length > 0) {
            const err = result.errors[0];
            errorMessage = err.message || null;
            errorStack = err.stack || null;

            // 에러 메시지 길이 제한 (DB 부하 방지)
            if (errorMessage && errorMessage.length > 2000) {
                errorMessage = errorMessage.slice(0, 2000) + "...";
            }
            if (errorStack && errorStack.length > 5000) {
                errorStack = errorStack.slice(0, 5000) + "...";
            }
        }

        this.tests.push({
            test_path: testPath,
            suite,
            name,
            status: result.status,
            duration: result.duration,
            error_message: errorMessage,
            error_stack: errorStack,
        });
    }

    async onEnd(result: FullResult) {
        const duration = Date.now() - this.startTime;
        const passed = this.tests.filter((t) => t.status === "passed").length;
        const failed = this.tests.filter((t) => t.status === "failed").length;
        const skipped = this.tests.filter((t) => t.status === "skipped").length;

        // Git 정보 수집 (실패해도 무시)
        let commitHash: string | null = null;
        let branch: string | null = null;
        try {
            commitHash = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
            branch = execSync("git branch --show-current", { encoding: "utf-8" }).trim();
        } catch {
            // git 없거나 실패 시 무시
        }

        const payload = {
            total: this.tests.length,
            passed,
            failed,
            skipped,
            duration,
            environment: process.env.CI ? "ci" : "local",
            commit_hash: commitHash,
            branch,
            tests: this.tests,
        };

        // API로 전송 시도
        const apiUrl = process.env.TEST_RESULTS_API_URL || "http://localhost:4000/api/test-results";
        const apiKey = process.env.ADMIN_API_KEY || "";

        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Key": apiKey,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                console.log(`\n📊 테스트 결과 저장 완료 (run_id: ${data.run_id})`);
                console.log(`   ✅ ${passed} passed | ❌ ${failed} failed | ⚪ ${skipped} skipped`);
                return;
            }

            console.warn(`\n⚠️  API 전송 실패 (${res.status}). 로컬 파일로 fallback.`);
        } catch (err) {
            console.warn(`\n⚠️  API 서버 연결 실패. 로컬 파일로 fallback.`);
        }

        // Fallback: 로컬 JSON 저장
        const fallbackPath = join(__dirname, "..", "test-results.json");
        writeFileSync(fallbackPath, JSON.stringify(payload, null, 2));
        console.log(`📁 Fallback 저장: ${fallbackPath}`);
        console.log(`   ✅ ${passed} passed | ❌ ${failed} failed | ⚪ ${skipped} skipped`);
    }
}

export default ApiReporter;
