"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "../../../../lib/i18n";
import EntityManager from "../../../../components/EntityManager";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace("/api", "") ?? "";

type Episode = {
    id: string;
    ep: number;
    title: string | null;
    status: string | null;
    scheduled_at: string | null;
    views: number;
};

type Novel = {
    id: string;
    title: string;
    description: string;
    cover_url: string | null;
    source_language: string;
    genre: string | null;
    serial_status: string | null;
    source: string;
    author_id: string;
};



type TranslationInfo = {
    episode_id: string;
    done: number;
    failed: number;
    pending: number;
    total: number;
};

export default function NovelManagePage() {
    const router = useRouter();
    const params = useParams();
    const novelId = params.id as string;
    const { t, locale } = useLocale();

    const [novel, setNovel] = useState<Novel | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [translations, setTranslations] = useState<Record<string, TranslationInfo>>({});
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [retrying, setRetrying] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [planType, setPlanType] = useState("free");
    const [translationLimit, setTranslationLimit] = useState(3);
    const [translationUsed, setTranslationUsed] = useState(0);

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
        if (!token) { router.push("/login"); return; }

        try {
            const [novelRes, epsRes, planRes] = await Promise.all([
                fetch(`${STORAGE}/api/novels/${novelId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${STORAGE}/api/novels/${novelId}/episodes?include_scheduled=true`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${STORAGE}/api/user/plan`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (novelRes.status === 401 || novelRes.status === 403) {
                router.push("/dashboard");
                return;
            }

            if (novelRes.ok) setNovel(await novelRes.json());
            if (epsRes.ok) {
                const data = await epsRes.json();
                setEpisodes(data.episodes ?? []);
            }
            if (planRes.ok) {
                const planData = await planRes.json();
                setPlanType(planData.plan_type || "free");
                setTranslationLimit(planData.translation_limit ?? 3);
            }

            // 번역 상태 조회
            const transRes = await fetch(`${STORAGE}/api/novels/${novelId}/episodes/translations-status`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (transRes.ok) {
                const transData = await transRes.json();
                const transMap: Record<number, TranslationInfo> = {};
                const statuses = transData.statuses ?? {};
                let totalUsed = 0;
                for (const [epStr, langs] of Object.entries(statuses)) {
                    const epNum = Number(epStr);
                    const langMap = langs as Record<string, string>;
                    const info: TranslationInfo = { episode_id: "", done: 0, failed: 0, pending: 0, total: 0 };
                    for (const status of Object.values(langMap)) {
                        info.total++;
                        if (status === "DONE") { info.done++; totalUsed++; }
                        else if (status === "FAILED") info.failed++;
                        else info.pending++;
                    }
                    transMap[epNum] = info;
                }
                setTranslations(transMap);
                setTranslationUsed(totalUsed);
            }
        } catch {
            setError("데이터를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [novelId, router]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async () => {
        if (!confirm(t("dashboard.deleteConfirm"))) return;
        if (!confirm(t("dashboard.deleteConfirmFinal"))) return;
        const token = getToken();
        if (!token) return;

        setDeleting(true);
        const res = await fetch(`${STORAGE}/api/novels/${novelId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            router.push("/dashboard");
        } else {
            const data = await res.json();
            setError(data.error ?? t("common.error"));
            setDeleting(false);
        }
    };

    if (loading) {
        return <div style={{ padding: "48px 24px", textAlign: "center", color: "#666" }}>{t("common.loading")}</div>;
    }

    if (!novel) {
        return <div style={{ padding: "48px 24px", textAlign: "center", color: "#999" }}>{t("common.notFound")}</div>;
    }

    return (
        <main style={{ maxWidth: 1060, margin: "0 auto", padding: "40px 24px" }}>
            {/* 상단 */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 36 }}>
                {/* 커버 */}
                <div
                    style={{
                        width: 80,
                        height: 112,
                        background: novel.cover_url ? `url(${novel.cover_url}) center/cover` : "#e8ecf5",
                        border: "1px solid #e5e5e5",
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

                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <h1 style={{ fontFamily: '"KoPub Batang", serif', fontSize: 22, fontWeight: 600, color: "#243A6E" }}>
                            {novel.title}
                        </h1>
                        {novel.source === "user" && (
                            <span style={{ fontSize: 10, padding: "2px 7px", background: "#e8ecf5", color: "#243A6E", fontWeight: 600 }}>
                                {t("dashboard.myWork")}
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize: 13, color: "#666", marginBottom: 12, lineHeight: 1.6 }}>
                        {novel.description || <span style={{ color: "#bbb" }}>{t("novel.noDescription")}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <Link
                            href={`/dashboard/novels/${novelId}/edit`}
                            style={{
                                padding: "7px 14px",
                                border: "1px solid #243A6E",
                                color: "#243A6E",
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: "none",
                                borderRadius: 0,
                            }}
                        >
                            {t("dashboard.editInfo")}
                        </Link>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{
                                padding: "7px 14px",
                                border: "1px solid #e5e5e5",
                                background: "#fff",
                                color: "#999",
                                fontSize: 12,
                                cursor: "pointer",
                                borderRadius: 0,
                            }}
                        >
                            {deleting ? t("dashboard.deleting") : t("dashboard.deleteNovel")}
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div style={{ padding: "12px", background: "#fee", color: "#c33", marginBottom: 20, fontSize: 13 }}>
                    {error}
                </div>
            )}

            {/* 번역 쿼터 진행 바 (자이가르닉 효과) */}
            {planType !== "author_pro" && (
                <div style={{
                    padding: "16px 20px", marginBottom: 20,
                    background: translationUsed >= translationLimit ? "#fff5f5" : "#f8f9ff",
                    border: `1px solid ${translationUsed >= translationLimit ? "#f5c6c6" : "#e0e5f5"}`,
                    borderRadius: "12px",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>
                            {locale === "ko" ? "번역 사용량" : "Translation Usage"}
                        </span>
                        <span style={{ fontSize: 12, color: translationUsed >= translationLimit ? "#c33" : "#888" }}>
                            {translationUsed}/{translationLimit === 999 ? "∞" : translationLimit}
                        </span>
                    </div>
                    {/* 프로그레스 바 */}
                    <div style={{ width: "100%", height: 8, background: "#e5e5e5", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                            width: `${Math.min((translationUsed / translationLimit) * 100, 100)}%`,
                            height: "100%",
                            background: translationUsed >= translationLimit
                                ? "#e53e3e"
                                : translationUsed >= translationLimit - 1
                                    ? "#f6ad55"
                                    : "#243A6E",
                            borderRadius: 4,
                            transition: "width 0.5s ease",
                        }} />
                    </div>
                    {/* 경고 메시지 */}
                    {translationUsed >= translationLimit ? (
                        <div style={{ marginTop: 12, textAlign: "center" }}>
                            <p style={{ fontSize: 13, color: "#c33", fontWeight: 500, marginBottom: 8 }}>
                                {locale === "ko" ? "❌ 번역 횟수를 모두 소진했습니다" : "❌ Translation limit reached"}
                            </p>
                            <a
                                href="/pricing"
                                style={{
                                    display: "inline-block", padding: "10px 24px",
                                    background: "#243A6E", color: "#fff",
                                    fontSize: 13, fontWeight: 600,
                                    textDecoration: "none", borderRadius: 8,
                                }}
                            >
                                {locale === "ko" ? "Pro 시작하기 $14.99/월" : "Get Pro $14.99/mo"}
                            </a>
                        </div>
                    ) : translationUsed >= translationLimit - 1 ? (
                        <p style={{ marginTop: 8, fontSize: 12, color: "#b7791f" }}>
                            ⚠️ {locale === "ko" ? "마지막 번역 기회입니다!" : "Last translation remaining!"}
                            {" "}
                            <a href="/pricing" style={{ color: "#243A6E", fontWeight: 600 }}>
                                {locale === "ko" ? "Pro로 무제한 →" : "Go unlimited with Pro →"}
                            </a>
                        </p>
                    ) : null}
                </div>
            )}

            {/* 에피소드 목록 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#333" }}>
                    {t("dashboard.episodes")} <span style={{ color: "#999", fontWeight: 400 }}>{episodes.length}{t("dashboard.episodeCount")}</span>
                </h2>
                <Link
                    href={`/dashboard/novels/${novelId}/episodes/new`}
                    style={{
                        padding: "8px 16px",
                        background: "#243A6E",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: "none",
                        borderRadius: 0,
                    }}
                >
                    {t("dashboard.newEpisode")}
                </Link>
            </div>

            {episodes.length === 0 ? (
                <div
                    style={{
                        border: "1px dashed #ddd",
                        padding: "36px 24px",
                        textAlign: "center",
                        color: "#999",
                        fontSize: 13,
                    }}
                >
                    {t("dashboard.noEpisodes")}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {episodes.map((ep) => {
                        const trans = translations[ep.ep];
                        return (
                            <div
                                key={ep.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "14px 16px",
                                    background: "#fff",
                                    border: "1px solid #e5e5e5",
                                    gap: 12,
                                    flexWrap: "wrap",
                                }}
                            >
                                <span style={{ fontSize: 12, color: "#999", width: 36, flexShrink: 0 }}>
                                    {ep.ep}{t("dashboard.episodeCount")}
                                </span>
                                <span style={{ flex: 1, fontSize: 14, color: "#333", fontWeight: 500, minWidth: 120 }}>
                                    {ep.title || t("dashboard.untitledEp").replace("{ep}", String(ep.ep))}
                                </span>
                                {/* 번역 상태 */}
                                {trans && (
                                    <span style={{ fontSize: 11, display: "flex", gap: 4, alignItems: "center" }}>
                                        {trans.done > 0 && (
                                            <span style={{ padding: "2px 6px", background: "#e8f5e9", color: "#2e7d32" }}>
                                                ✓ {trans.done}
                                            </span>
                                        )}
                                        {trans.failed > 0 && (
                                            <span style={{ padding: "2px 6px", background: "#fef0f0", color: "#c33" }}>
                                                ✗ {trans.failed}
                                            </span>
                                        )}
                                        {trans.pending > 0 && (
                                            <span style={{ padding: "2px 6px", background: "#fff8e1", color: "#b7791f" }}>
                                                ⏳ {trans.pending}
                                            </span>
                                        )}
                                    </span>
                                )}
                                {/* 실패 번역 Retry */}
                                {trans && trans.failed > 0 && (
                                    <button
                                        disabled={retrying === ep.id}
                                        onClick={async () => {
                                            setRetrying(ep.id);
                                            const token = getToken();
                                            if (!token) return;
                                            const res = await fetch(
                                                `${STORAGE}/api/novels/${novelId}/episodes/${ep.ep}/translate-all`,
                                                {
                                                    method: "POST",
                                                    headers: { Authorization: `Bearer ${token}` },
                                                }
                                            );
                                            if (res.ok) {
                                                fetchData();
                                            } else {
                                                const data = await res.json();
                                                setError(data.error === "TRANSLATION_QUOTA_EXCEEDED"
                                                    ? `번역 쿼터 초과. ${Math.ceil((data.resetIn ?? 0) / 60)}분 후 재시도 가능`
                                                    : data.message ?? data.error ?? "재시도 실패"
                                                );
                                            }
                                            setRetrying(null);
                                        }}
                                        style={{
                                            fontSize: 11,
                                            padding: "4px 10px",
                                            border: "1px solid #c33",
                                            background: retrying === ep.id ? "#eee" : "#fff",
                                            color: "#c33",
                                            cursor: retrying === ep.id ? "wait" : "pointer",
                                            borderRadius: 0,
                                        }}
                                    >
                                        {retrying === ep.id ? t("dashboard.retrying") : t("dashboard.retryFailedCount").replace("{count}", String(trans.failed))}
                                    </button>
                                )}
                                <span
                                    style={{
                                        fontSize: 11,
                                        padding: "2px 7px",
                                        background: ep.status === "published" ? "#e8f5e9" : ep.status === "scheduled" ? "#fff8e1" : "#f5f5f5",
                                        color: ep.status === "published" ? "#2e7d32" : ep.status === "scheduled" ? "#b7791f" : "#999",
                                    }}
                                >
                                    {t(`dashboard.${ep.status ?? "published"}`)}
                                </span>
                                {ep.scheduled_at && (
                                    <span style={{ fontSize: 11, color: "#999" }}>
                                        {new Date(ep.scheduled_at).toLocaleDateString("ko-KR")}
                                    </span>
                                )}
                                <Link
                                    href={`/dashboard/novels/${novelId}/episodes/${ep.ep}/edit`}
                                    style={{
                                        fontSize: 12,
                                        color: "#243A6E",
                                        textDecoration: "none",
                                        padding: "4px 10px",
                                        border: "1px solid #e5e5e5",
                                        borderRadius: 0,
                                    }}
                                >
                                    {t("dashboard.edit")}
                                </Link>
                                <button
                                    onClick={async () => {
                                        if (!confirm(t("dashboard.deleteEpConfirm").replace("{ep}", String(ep.ep)))) return;
                                        const token = getToken();
                                        if (!token) return;
                                        try {
                                            const res = await fetch(
                                                `${STORAGE}/api/novels/${novelId}/episodes/${ep.ep}`,
                                                {
                                                    method: "DELETE",
                                                    headers: { Authorization: `Bearer ${token}` },
                                                }
                                            );
                                            if (res.ok) {
                                                fetchData();
                                            } else {
                                                const data = await res.json();
                                                setError(data.error ?? "Failed to delete episode");
                                            }
                                        } catch {
                                            setError(t("episodeNew.networkError"));
                                        }
                                    }}
                                    style={{
                                        fontSize: 12,
                                        color: "#c0392b",
                                        padding: "4px 10px",
                                        border: "1px solid #f5c6c6",
                                        background: "#fff",
                                        borderRadius: 0,
                                        cursor: "pointer",
                                    }}
                                >
                                    {t("dashboard.deleteEpisode")}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}


            <EntityManager novelId={novelId} locale={locale} t={t} />

            <div style={{ marginTop: 24 }}>
                <Link href="/dashboard" style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>
                    {t("dashboard.backToList")}
                </Link>
            </div>
        </main>
    );
}
