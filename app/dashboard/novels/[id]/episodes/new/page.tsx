"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "../../../../../../lib/i18n";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace("/api", "") ?? "";
const PIPELINE_BASE = process.env.NEXT_PUBLIC_PIPELINE_BASE_URL || "https://railway-ocr-server-2-production.up.railway.app";
const PIPELINE_PIN = process.env.NEXT_PUBLIC_PIPELINE_PIN || "";
const ALL_LANGUAGES = ["ko", "en", "ja", "zh", "es", "fr", "de", "pt", "id"];

type LangStatus = {
    language: string;
    status: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
};

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
    const { t } = useLocale();

    const [ep, setEp] = useState<number>(1);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false); // 에피소드가 DB에 저장됨
    const [error, setError] = useState("");
    const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);
    const [quotaResetIn, setQuotaResetIn] = useState(0);
    const [countdown, setCountdown] = useState(0);

    // 고유명사 추출
    const [extracting, setExtracting] = useState(false);
    const [extractedEntities, setExtractedEntities] = useState<Array<{
        source_text: string;
        translations: Record<string, string>;
    }>>([]);

    // 번역 상태
    const [translating, setTranslating] = useState(false);
    const [langStatuses, setLangStatuses] = useState<LangStatus[]>([]);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // 소설 원문 언어
    const [sourceLanguage, setSourceLanguage] = useState("ko");

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

    // 다음 에피소드 번호 자동 채번 + 소설 정보
    const fetchNextEp = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        try {
            // 에피소드 목록
            const res = await fetch(`${STORAGE}/api/novels/${novelId}/episodes?include_scheduled=true`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                const eps: { ep: number }[] = data.episodes ?? [];
                const maxEp = eps.length > 0 ? Math.max(...eps.map((e) => e.ep)) : 0;
                setEp(maxEp + 1);
            }
            // 소설 정보 (source_language)
            const novelRes = await fetch(`${STORAGE}/api/novels/${novelId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (novelRes.ok) {
                const novelData = await novelRes.json();
                setSourceLanguage(novelData.source_language || "ko");
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

    // cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    // ── 1. 저장만 ──
    const handleSaveOnly = async () => {
        setError("");
        if (!content.trim()) { setError(t("episodeNew.bodyRequired")); return; }
        const token = getToken();
        if (!token) { router.push("/login"); return; }

        setSaving(true);
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
                    skip_translation: true,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 429) setError(t("episodeNew.quotaError").replace("{time}", formatCountdown(data.resetIn ?? quotaResetIn)));
                else if (res.status === 409) setError(t("episodeNew.duplicateEp").replace("{ep}", String(ep)));
                else setError(data.error ?? t("episodeNew.saveFailed"));
                return;
            }
            setSaved(true);
        } catch {
            setError(t("episodeNew.networkError"));
        } finally {
            setSaving(false);
        }
    };

    // ── 2. 고유명사 추출 ──
    const handleExtract = async () => {
        if (!content.trim()) { setError("본문을 입력하세요"); return; }
        setExtracting(true);
        setExtractedEntities([]);
        setError("");

        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                "x-access-pin": PIPELINE_PIN,
            };

            // 1. process_text → session_id
            const processRes = await fetch(`${PIPELINE_BASE}/process_text`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    text: content,
                    novel_title: novelId,
                    source_language: sourceLanguage,
                }),
            });
            if (!processRes.ok) {
                const err = await processRes.json().catch(() => ({ error: "알 수 없는 오류" }));
                setError(`세션 생성 실패: ${err.error || err.message || processRes.status}`);
                return;
            }
            const { session_id: sessionId } = await processRes.json();
            if (!sessionId) { setError("세션 ID를 받지 못했습니다"); return; }

            // 2. extract_entities
            const res = await fetch(`${PIPELINE_BASE}/extract_entities`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    session_id: sessionId,
                    novel_title: novelId,
                    source_language: sourceLanguage,
                    languages: ALL_LANGUAGES.filter(l => l !== sourceLanguage),
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "알 수 없는 오류" }));
                setError(`고유명사 추출 실패: ${err.error || err.message || res.status}`);
                return;
            }
            const data = await res.json();
            if (data.status !== "ok") { setError(`추출 실패: ${data.message}`); return; }

            const candidates = (data.candidates || [])
                .map((c: Record<string, unknown>) => ({
                    source_text: (c.source || c.source_text || "") as string,
                    translations: (c.translations || {}) as Record<string, string>,
                }))
                .filter((e: { source_text: string }) => e.source_text);

            // 기존 고유명사와 중복 제거
            const token = getToken();
            try {
                const existRes = await fetch(`${STORAGE}/api/novels/${novelId}/entities`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    cache: "no-store",
                });
                if (existRes.ok) {
                    const existData = await existRes.json();
                    const existSet = new Set(
                        (existData.entities || []).map((e: { source_text: string }) => e.source_text.toLowerCase().trim())
                    );
                    const filtered = candidates.filter(
                        (e: { source_text: string }) => !existSet.has(e.source_text.toLowerCase().trim())
                    );
                    setExtractedEntities(filtered);
                    if (filtered.length === 0) setError("추출된 고유명사가 모두 이미 저장되어 있습니다.");
                } else {
                    setExtractedEntities(candidates);
                }
            } catch {
                setExtractedEntities(candidates);
            }

            if (candidates.length === 0) setError("추출된 고유명사가 없습니다.");
        } catch {
            setError("고유명사 추출 중 에러가 발생했습니다.");
        } finally {
            setExtracting(false);
        }
    };

    const handleSaveEntity = async (index: number) => {
        const entity = extractedEntities[index];
        if (!entity.source_text.trim()) return;
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${STORAGE}/api/novels/${novelId}/entities`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    source_text: entity.source_text,
                    translations: entity.translations || {},
                    category: "default",
                }),
            });
            if (res.ok || res.status === 409) {
                setExtractedEntities(prev => prev.filter((_, i) => i !== index));
            } else {
                setError("고유명사 저장 실패");
            }
        } catch {
            setError("고유명사 저장 중 에러");
        }
    };

    // ── 3. 번역 시작 ──
    const handleTranslate = async () => {
        setError("");
        const token = getToken();
        if (!token) { router.push("/login"); return; }

        // 아직 저장 안 했으면 먼저 저장
        if (!saved) {
            setSaving(true);
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
                    if (res.status === 429) setError(t("episodeNew.quotaError").replace("{time}", formatCountdown(data.resetIn ?? quotaResetIn)));
                    else if (res.status === 409) setError(t("episodeNew.duplicateEp").replace("{ep}", String(ep)));
                    else setError(data.error ?? t("episodeNew.saveFailed"));
                    setSaving(false);
                    return;
                }
                setSaved(true);
            } catch {
                setError(t("episodeNew.networkError"));
                setSaving(false);
                return;
            }
            setSaving(false);
        }

        // 번역 등록
        setTranslating(true);
        const targetLangs = ALL_LANGUAGES.filter(l => l !== sourceLanguage);
        setLangStatuses(
            ALL_LANGUAGES.map(lang => ({
                language: lang,
                status: lang === sourceLanguage ? "DONE" : "PENDING",
            }))
        );

        // 각 언어 번역 작업 등록
        await Promise.all(targetLangs.map(async (language) => {
            try {
                await fetch(`${STORAGE}/api/novels/${novelId}/episodes/${ep}/retry`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ language }),
                });
            } catch {
                setLangStatuses(prev =>
                    prev.map(l => l.language === language ? { ...l, status: "FAILED" } : l)
                );
            }
        }));

        // 폴링 시작
        const pollInterval = setInterval(async () => {
            try {
                const r = await fetch(`${STORAGE}/api/novels/${novelId}/episodes/translations-status?t=${Date.now()}`, { cache: "no-store" });
                if (!r.ok) return;
                const data = await r.json();
                const statuses = data.statuses?.[ep] || {};

                setLangStatuses(prev =>
                    prev.map(l => {
                        const st = statuses[l.language];
                        if (!st) return l;
                        return { ...l, status: st };
                    })
                );

                const allDone = targetLangs.every(lang => {
                    const st = statuses[lang];
                    return st === "DONE" || st === "FAILED";
                });
                if (allDone) {
                    clearInterval(pollInterval);
                    pollIntervalRef.current = null;
                    setTranslating(false);
                }
            } catch { /* silent */ }
        }, 2000);
        pollIntervalRef.current = pollInterval;
    };

    const handleRetry = async (language: string) => {
        const token = getToken();
        if (!token) return;

        setLangStatuses(prev =>
            prev.map(l => l.language === language ? { ...l, status: "PENDING" } : l)
        );

        try {
            await fetch(`${STORAGE}/api/novels/${novelId}/episodes/${ep}/retry`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ language }),
            });

            // 폴링 재시작
            if (!pollIntervalRef.current) {
                setTranslating(true);
                const targetLangs = ALL_LANGUAGES.filter(l => l !== sourceLanguage);
                const pollInterval = setInterval(async () => {
                    try {
                        const r = await fetch(`${STORAGE}/api/novels/${novelId}/episodes/translations-status?t=${Date.now()}`, { cache: "no-store" });
                        if (!r.ok) return;
                        const data = await r.json();
                        const statuses = data.statuses?.[ep] || {};
                        setLangStatuses(prev =>
                            prev.map(l => {
                                const st = statuses[l.language];
                                if (!st) return l;
                                return { ...l, status: st };
                            })
                        );
                        const allDone = targetLangs.every(lang => {
                            const st = statuses[lang];
                            return st === "DONE" || st === "FAILED";
                        });
                        if (allDone) {
                            clearInterval(pollInterval);
                            pollIntervalRef.current = null;
                            setTranslating(false);
                        }
                    } catch { /* silent */ }
                }, 2000);
                pollIntervalRef.current = pollInterval;
            }
        } catch {
            setLangStatuses(prev =>
                prev.map(l => l.language === language ? { ...l, status: "FAILED" } : l)
            );
        }
    };

    const quotaExhausted = quotaRemaining === 0;
    const completed = langStatuses.filter(l => l.status === "DONE").length;

    return (
        <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <h1 style={{ fontFamily: '"KoPub Batang", serif', fontSize: 22, fontWeight: 600, color: "#243A6E" }}>
                    {t("episodeNew.title")}
                </h1>
                <Link href={`/dashboard/novels/${novelId}`} style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>
                    {t("episodeNew.backToNovel")}
                </Link>
            </div>

            {/* 쿼터 상태 */}
            {quotaRemaining !== null && (
                <div
                    style={{
                        display: "flex", alignItems: "center", gap: 16,
                        padding: "12px 16px",
                        background: quotaExhausted ? "#fff8f8" : "#f8f9ff",
                        border: `1px solid ${quotaExhausted ? "#f5c6c6" : "#dde3f5"}`,
                        marginBottom: 24, flexWrap: "wrap",
                    }}
                >
                    <div style={{ fontSize: 13, color: quotaExhausted ? "#c0392b" : "#243A6E" }}>
                        {t("episodeNew.quotaRemaining")} <strong>{quotaRemaining}/3</strong>
                    </div>
                    <div style={{ fontSize: 13, color: "#666" }}>
                        {t("episodeNew.resetIn")}{" "}
                        <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: countdown < 3600 ? "#c0392b" : "#243A6E" }}>
                            {formatCountdown(countdown)}
                        </span>
                    </div>
                </div>
            )}

            {/* 회차 + 제목 */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 100, flexShrink: 0 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        {t("episodeNew.epNumber")}
                    </label>
                    <input
                        type="number" value={ep} onChange={e => setEp(Number(e.target.value))}
                        min={1} max={9999} required disabled={saving || saved}
                        style={{ width: "100%", padding: "11px 12px", border: "1px solid #e5e5e5", borderRadius: 0, fontSize: 14, outline: "none" }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        {t("episodeNew.epTitle")}
                    </label>
                    <input
                        type="text" value={title} onChange={e => setTitle(e.target.value)}
                        placeholder={t("episodeNew.epPlaceholder").replace("{ep}", String(ep))}
                        maxLength={200} disabled={saving || saved}
                        style={{ width: "100%", padding: "11px 12px", border: "1px solid #e5e5e5", borderRadius: 0, fontSize: 14, outline: "none" }}
                    />
                </div>
            </div>

            {/* 본문 */}
            <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                    {t("episodeNew.body")} <span style={{ color: "#c0392b" }}>*</span>
                    <span style={{ fontWeight: 400, color: "#999", marginLeft: 8, fontSize: 12 }}>
                        {t("episodeNew.charCount").replace("{count}", content.length.toLocaleString())}
                    </span>
                </label>
                <textarea
                    value={content} onChange={e => setContent(e.target.value)}
                    placeholder={t("episodeNew.bodyPlaceholder")}
                    rows={24} required disabled={saving || saved}
                    style={{
                        width: "100%", padding: "14px 16px", border: "1px solid #e5e5e5", borderRadius: 0,
                        fontSize: 15, lineHeight: 1.8, outline: "none", resize: "vertical",
                        fontFamily: '"Noto Sans KR", sans-serif',
                    }}
                />
            </div>

            {/* 예약 발행 */}
            <div style={{ marginBottom: 28 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                    {t("episodeNew.schedule")}
                </label>
                <input
                    type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                    disabled={saving || saved}
                    style={{ padding: "10px 12px", border: "1px solid #e5e5e5", borderRadius: 0, fontSize: 13, outline: "none", color: "#333" }}
                />
            </div>

            {error && (
                <div style={{ padding: "12px", background: "#fee", color: "#c33", marginBottom: 20, fontSize: 13 }}>
                    {error}
                </div>
            )}

            {/* ── 버튼 3개 ── */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                {/* 저장 */}
                <button
                    onClick={handleSaveOnly}
                    disabled={saving || saved || !content.trim()}
                    style={{
                        flex: 1, padding: "13px",
                        background: saved ? "#27ae60" : saving || !content.trim() ? "#9ca3af" : "#243A6E",
                        color: "#fff", border: "none", borderRadius: 0, fontSize: 15, fontWeight: 600,
                        cursor: saving || saved ? "not-allowed" : "pointer",
                    }}
                >
                    {saved ? "✓ 저장 완료" : saving ? "저장 중..." : "저장"}
                </button>

                {/* 고유명사 추출 */}
                <button
                    onClick={handleExtract}
                    disabled={extracting || !content.trim()}
                    style={{
                        flex: 1, padding: "13px",
                        background: extracting || !content.trim() ? "#9ca3af" : "#6c5ce7",
                        color: "#fff", border: "none", borderRadius: 0, fontSize: 15, fontWeight: 600,
                        cursor: extracting || !content.trim() ? "not-allowed" : "pointer",
                    }}
                >
                    {extracting ? "추출 중..." : "고유명사 추출"}
                </button>

                {/* 번역 시작 */}
                <button
                    onClick={handleTranslate}
                    disabled={translating || quotaExhausted || !content.trim()}
                    style={{
                        flex: 1, padding: "13px",
                        background: translating || quotaExhausted || !content.trim() ? "#9ca3af" : "#e67e22",
                        color: "#fff", border: "none", borderRadius: 0, fontSize: 15, fontWeight: 600,
                        cursor: translating || quotaExhausted ? "not-allowed" : "pointer",
                    }}
                >
                    {translating ? "번역 중..." : quotaExhausted ? t("episodeNew.quotaOver") : "번역 시작"}
                </button>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <button
                    type="button"
                    onClick={() => router.push(`/dashboard/novels/${novelId}`)}
                    style={{
                        flex: 1, padding: "13px 20px", background: "#fff", color: "#666",
                        border: "1px solid #e5e5e5", borderRadius: 0, fontSize: 15, cursor: "pointer",
                    }}
                >
                    {t("episodeNew.cancel")}
                </button>
            </div>

            {/* ── 고유명사 추출 결과 ── */}
            {extractedEntities.length > 0 && (
                <div style={{ marginBottom: 28, padding: 20, background: "#faf5ff", border: "1px solid #e8d5f5" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#6c5ce7", marginBottom: 16 }}>
                        추출된 고유명사 ({extractedEntities.length}개)
                    </h3>
                    {extractedEntities.map((entity, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                            <input
                                value={entity.source_text}
                                onChange={e => setExtractedEntities(prev =>
                                    prev.map((ent, i) => i === idx ? { ...ent, source_text: e.target.value } : ent)
                                )}
                                style={{
                                    flex: 1, padding: "8px 12px", border: "1px solid #e5e5e5",
                                    borderRadius: 0, fontSize: 14, outline: "none",
                                }}
                            />
                            <button
                                onClick={() => handleSaveEntity(idx)}
                                style={{
                                    padding: "8px 16px", background: "#6c5ce7", color: "#fff",
                                    border: "none", borderRadius: 0, fontSize: 13, fontWeight: 600, cursor: "pointer",
                                }}
                            >
                                저장
                            </button>
                            <button
                                onClick={() => setExtractedEntities(prev => prev.filter((_, i) => i !== idx))}
                                style={{
                                    padding: "8px 12px", background: "#fff", color: "#c33",
                                    border: "1px solid #e5e5e5", borderRadius: 0, fontSize: 13, cursor: "pointer",
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ── 번역 진행 상황 ── */}
            {langStatuses.length > 0 && (
                <div style={{ padding: 20, background: "#f8f9ff", border: "1px solid #dde3f5" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#243A6E", margin: 0 }}>
                            번역 진행 상황
                        </h3>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#243A6E" }}>
                            {completed}/{langStatuses.length}
                        </span>
                    </div>
                    {/* 프로그레스 바 */}
                    <div style={{ width: "100%", height: 6, background: "#e5e7eb", marginBottom: 16 }}>
                        <div style={{
                            height: "100%", background: "#243A6E", transition: "width 0.3s",
                            width: `${(completed / langStatuses.length) * 100}%`,
                        }} />
                    </div>
                    {/* 언어별 상태 */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                        {langStatuses.map(l => (
                            <div
                                key={l.language}
                                style={{
                                    padding: "10px 12px",
                                    border: `1px solid ${l.status === "DONE" ? "#86efac" : l.status === "FAILED" ? "#fca5a5" : l.status === "PROCESSING" ? "#93c5fd" : "#e5e7eb"}`,
                                    background: l.status === "DONE" ? "#f0fdf4" : l.status === "FAILED" ? "#fef2f2" : l.status === "PROCESSING" ? "#eff6ff" : "#f9fafb",
                                    textAlign: "center" as const,
                                }}
                            >
                                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                                    {l.language.toUpperCase()}
                                </div>
                                <div style={{ fontSize: 11, color: "#666" }}>
                                    {l.status === "PENDING" && "⏸️ 대기"}
                                    {l.status === "PROCESSING" && "⏳ 번역 중"}
                                    {l.status === "DONE" && "✓ 완료"}
                                    {l.status === "FAILED" && "✗ 실패"}
                                </div>
                                {l.status === "FAILED" && (
                                    <button
                                        onClick={() => handleRetry(l.language)}
                                        style={{
                                            marginTop: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600,
                                            background: "#e74c3c", color: "#fff", border: "none", borderRadius: 0, cursor: "pointer",
                                        }}
                                    >
                                        재시도
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
