"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace("/api", "") ?? "";

function formatCountdown(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function NewEpisodePage() {
    const router = useRouter();
    const params = useParams();
    const novelId = params.id as string;

    const [ep, setEp] = useState<number>(1);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);
    const [quotaResetIn, setQuotaResetIn] = useState(0);
    const [countdown, setCountdown] = useState(0);

    const getToken = () => {
        try {
            const raw = localStorage.getItem("authToken");
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed?.value ?? raw;
        } catch {
            return localStorage.getItem("authToken");
        }
    };

    const fetchQuota = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${STORAGE}/api/user/quota`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setQuotaRemaining(data.translation.remaining);
                setQuotaResetIn(data.translation.resetIn);
                setCountdown(data.translation.resetIn);
            }
        } catch { /* silent */ }
    }, []);

    // 다음 에피소드 번호 자동 채번
    const fetchNextEp = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${STORAGE}/api/novels/${novelId}/episodes?include_scheduled=true`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                const eps: { ep: number }[] = data.episodes ?? [];
                const maxEp = eps.length > 0 ? Math.max(...eps.map((e) => e.ep)) : 0;
                setEp(maxEp + 1);
            }
        } catch { /* silent */ }
    }, [novelId]);

    useEffect(() => {
        if (!getToken()) { router.push("/login"); return; }
        fetchQuota();
        fetchNextEp();
    }, [fetchQuota, fetchNextEp, router]);

    // 카운트다운
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) { clearInterval(timer); fetchQuota(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown, fetchQuota]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!content.trim()) {
            setError("본문을 입력해주세요.");
            return;
        }

        const token = getToken();
        if (!token) { router.push("/login"); return; }

        setLoading(true);

        try {
            const res = await fetch(`${STORAGE}/api/novels/${novelId}/episodes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ep,
                    title: title.trim() || null,
                    content: content.trim(),
                    scheduled_at: scheduledAt || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    setError(`오늘 번역 횟수를 모두 사용했습니다. ${formatCountdown(data.resetIn ?? quotaResetIn)} 후 초기화됩니다.`);
                    setQuotaRemaining(0);
                } else if (res.status === 409) {
                    setError(`${ep}화가 이미 존재합니다. 다른 회차 번호를 사용해주세요.`);
                } else {
                    setError(data.error ?? "에피소드 저장에 실패했습니다.");
                }
                setLoading(false);
                return;
            }

            router.push(`/dashboard/novels/${novelId}`);
        } catch {
            setError("네트워크 오류가 발생했습니다.");
            setLoading(false);
        }
    };

    const quotaExhausted = quotaRemaining === 0;

    return (
        <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <h1 style={{ fontFamily: '"KoPub Batang", serif', fontSize: 22, fontWeight: 600, color: "#243A6E" }}>
                    새 에피소드 작성
                </h1>
                <Link href={`/dashboard/novels/${novelId}`} style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>
                    ← 소설 관리로
                </Link>
            </div>

            {/* 쿼터 상태 */}
            {quotaRemaining !== null && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "12px 16px",
                        background: quotaExhausted ? "#fff8f8" : "#f8f9ff",
                        border: `1px solid ${quotaExhausted ? "#f5c6c6" : "#dde3f5"}`,
                        marginBottom: 24,
                        flexWrap: "wrap",
                    }}
                >
                    <div style={{ fontSize: 13, color: quotaExhausted ? "#c0392b" : "#243A6E" }}>
                        오늘 번역 남은 횟수: <strong>{quotaRemaining}/3</strong>
                    </div>
                    <div style={{ fontSize: 13, color: "#666" }}>
                        리셋까지:{" "}
                        <span
                            style={{
                                fontWeight: 700,
                                fontVariantNumeric: "tabular-nums",
                                color: countdown < 3600 ? "#c0392b" : "#243A6E",
                            }}
                        >
                            {formatCountdown(countdown)}
                        </span>
                    </div>
                    {quotaExhausted && (
                        <div style={{ fontSize: 12, color: "#c0392b", width: "100%" }}>
                            오늘 번역 횟수를 모두 사용했습니다. 내일 자정에 초기화됩니다.
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* 회차 번호 + 제목 */}
                <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 100, flexShrink: 0 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                            회차
                        </label>
                        <input
                            type="number"
                            value={ep}
                            onChange={(e) => setEp(Number(e.target.value))}
                            min={1}
                            max={9999}
                            required
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "11px 12px",
                                border: "1px solid #e5e5e5",
                                borderRadius: 0,
                                fontSize: 14,
                                outline: "none",
                            }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                            제목 (선택)
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={`제${ep}화`}
                            maxLength={200}
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "11px 12px",
                                border: "1px solid #e5e5e5",
                                borderRadius: 0,
                                fontSize: 14,
                                outline: "none",
                            }}
                        />
                    </div>
                </div>

                {/* 본문 */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        본문 <span style={{ color: "#c0392b" }}>*</span>
                        <span style={{ fontWeight: 400, color: "#999", marginLeft: 8, fontSize: 12 }}>
                            {content.length.toLocaleString()}자
                        </span>
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="에피소드 내용을 입력하세요..."
                        rows={24}
                        required
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "14px 16px",
                            border: "1px solid #e5e5e5",
                            borderRadius: 0,
                            fontSize: 15,
                            lineHeight: 1.8,
                            outline: "none",
                            resize: "vertical",
                            fontFamily: '"Noto Sans KR", sans-serif',
                        }}
                    />
                </div>

                {/* 예약 발행 */}
                <div style={{ marginBottom: 28 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        예약 발행 (선택)
                    </label>
                    <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        disabled={loading}
                        style={{
                            padding: "10px 12px",
                            border: "1px solid #e5e5e5",
                            borderRadius: 0,
                            fontSize: 13,
                            outline: "none",
                            color: "#333",
                        }}
                    />
                    {scheduledAt && (
                        <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
                            ※ 번역은 저장 즉시 시작됩니다. 예약 시간에 독자에게 공개됩니다.
                        </div>
                    )}
                </div>

                {error && (
                    <div style={{ padding: "12px", background: "#fee", color: "#c33", marginBottom: 20, fontSize: 13 }}>
                        {error}
                    </div>
                )}

                <div style={{ display: "flex", gap: 12 }}>
                    <button
                        type="submit"
                        disabled={loading || quotaExhausted}
                        style={{
                            flex: 1,
                            padding: "13px",
                            background: loading || quotaExhausted ? "#9ca3af" : "#243A6E",
                            color: "#fff",
                            border: "none",
                            borderRadius: 0,
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: loading || quotaExhausted ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? "저장 중..." : quotaExhausted ? "번역 횟수 초과 (내일 가능)" : "저장 + 번역 시작"}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={loading}
                        style={{
                            padding: "13px 20px",
                            background: "#fff",
                            color: "#666",
                            border: "1px solid #e5e5e5",
                            borderRadius: 0,
                            fontSize: 15,
                            cursor: "pointer",
                        }}
                    >
                        취소
                    </button>
                </div>
            </form>
        </main>
    );
}
