"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace("/api", "") ?? "";

type Novel = {
    id: string;
    title: string;
    description: string;
    cover_url: string | null;
    source_language: string;
    serial_status: string | null;
    is_hidden: boolean;
    source: string;
    created_at: string;
    episode_count: number;
    translated_count: number;
    failed_count: number;
};

type Quota = {
    translation: { used: number; remaining: number; resetIn: number };
    novel: { used: number; remaining: number; resetIn: number };
};

function formatCountdown(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function DashboardPage() {
    const router = useRouter();
    const [novels, setNovels] = useState<Novel[]>([]);
    const [quota, setQuota] = useState<Quota | null>(null);
    const [countdown, setCountdown] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    const fetchData = useCallback(async () => {
        const token = getToken();
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const [novelsRes, quotaRes] = await Promise.all([
                fetch(`${STORAGE}/api/user/novels`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${STORAGE}/api/user/quota`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (novelsRes.status === 401) {
                router.push("/login");
                return;
            }

            if (novelsRes.ok) {
                const data = await novelsRes.json();
                setNovels(data.novels ?? []);
            }

            if (quotaRes.ok) {
                const data = await quotaRes.json();
                setQuota(data);
                setCountdown(data.translation.resetIn);
            }
        } catch {
            setError("데이터를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 초 단위 카운트다운
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    fetchData(); // 리셋 시 재조회
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown, fetchData]);

    if (loading) {
        return (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "#666" }}>
                불러오는 중...
            </div>
        );
    }

    return (
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
            {/* 헤더 */}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 32 }}>
                <h1
                    style={{
                        fontFamily: '"KoPub Batang", serif',
                        fontSize: 28,
                        fontWeight: 600,
                        color: "#243A6E",
                    }}
                >
                    내 작품
                </h1>
                <Link
                    href="/dashboard/novels/create"
                    style={{
                        padding: "8px 18px",
                        background: "#243A6E",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: "none",
                        borderRadius: 0,
                        letterSpacing: "0.02em",
                    }}
                >
                    + 새 소설
                </Link>
            </div>

            {/* 번역 쿼터 위젯 */}
            {quota && (
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #e5e5e5",
                        padding: "20px 24px",
                        marginBottom: 32,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                        <div>
                            <div style={{ fontSize: 11, color: "#999", marginBottom: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                오늘 번역
                            </div>
                            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        style={{
                                            width: 28,
                                            height: 8,
                                            background: i < quota.translation.used ? "#243A6E" : "#e5e5e5",
                                        }}
                                    />
                                ))}
                                <span style={{ marginLeft: 8, fontSize: 13, color: "#333", fontWeight: 500 }}>
                                    {quota.translation.remaining}/3 남음
                                </span>
                            </div>
                        </div>

                        <div style={{ borderLeft: "1px solid #e5e5e5", paddingLeft: 24 }}>
                            <div style={{ fontSize: 11, color: "#999", marginBottom: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                리셋까지
                            </div>
                            <div
                                style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: countdown < 3600 ? "#c0392b" : "#243A6E",
                                    fontVariantNumeric: "tabular-nums",
                                    letterSpacing: "0.05em",
                                }}
                            >
                                {formatCountdown(countdown)}
                            </div>
                        </div>

                        <div style={{ fontSize: 12, color: "#999", marginLeft: "auto" }}>
                            매일 자정 3회 무료 번역이 초기화됩니다
                        </div>
                    </div>

                    {quota.translation.remaining === 0 && (
                        <div
                            style={{
                                marginTop: 12,
                                padding: "8px 12px",
                                background: "#fff8f8",
                                border: "1px solid #f5c6c6",
                                fontSize: 12,
                                color: "#c0392b",
                            }}
                        >
                            오늘 번역 횟수를 모두 사용했습니다. {formatCountdown(countdown)} 후 초기화됩니다.
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div style={{ padding: "12px", background: "#fee", color: "#c33", marginBottom: 24, fontSize: 14 }}>
                    {error}
                </div>
            )}

            {/* 소설 목록 */}
            {novels.length === 0 ? (
                <div
                    style={{
                        border: "1px dashed #ddd",
                        padding: "48px 24px",
                        textAlign: "center",
                        color: "#999",
                    }}
                >
                    <div style={{ fontSize: 14, marginBottom: 16 }}>아직 등록한 소설이 없습니다.</div>
                    <Link
                        href="/dashboard/novels/create"
                        style={{
                            padding: "10px 20px",
                            background: "#243A6E",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 600,
                            textDecoration: "none",
                            borderRadius: 0,
                        }}
                    >
                        첫 소설 만들기
                    </Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {novels.map((novel) => (
                        <Link
                            key={novel.id}
                            href={`/dashboard/novels/${novel.id}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                padding: "16px 20px",
                                background: "#fff",
                                border: "1px solid #e5e5e5",
                                textDecoration: "none",
                                color: "inherit",
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f7f4"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                        >
                            {/* 커버 */}
                            <div
                                style={{
                                    width: 44,
                                    height: 60,
                                    background: novel.cover_url ? `url(${novel.cover_url}) center/cover` : "#e8ecf5",
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 10,
                                    color: "#999",
                                }}
                            >
                                {!novel.cover_url && "표지"}
                            </div>

                            {/* 정보 */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 15, fontWeight: 600, color: "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {novel.title}
                                    </span>
                                    {novel.source === "user" && (
                                        <span style={{ fontSize: 10, padding: "1px 6px", background: "#e8ecf5", color: "#243A6E", fontWeight: 600, flexShrink: 0 }}>
                                            내 작품
                                        </span>
                                    )}
                                    {novel.is_hidden && (
                                        <span style={{ fontSize: 10, padding: "1px 6px", background: "#f5f5f5", color: "#999", flexShrink: 0 }}>
                                            숨김
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: 12, color: "#999" }}>
                                    에피소드 {novel.episode_count}화
                                    {novel.failed_count > 0 && (
                                        <span style={{ marginLeft: 8, color: "#c0392b" }}>
                                            ⚠ 번역 실패 {novel.failed_count}건
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div style={{ fontSize: 12, color: "#bbb", flexShrink: 0 }}>→</div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
