"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace("/api", "") ?? "";
const ALL_LANGUAGES = ["ko", "en", "ja", "zh", "es", "fr", "de", "id"];

type Entity = {
    id: string;
    source_text: string;
    translations: Record<string, string>;
    category?: string;
    locked?: boolean;
};

type Candidate = {
    source_text: string;
    translations: Record<string, string>;
};

type EntityManagerProps = {
    novelId: string;
    novelTitle?: string;
    locale?: string;
    showExtract?: boolean;
    t: (key: string) => string;
};

export default function EntityManager({ novelId, novelTitle, locale, showExtract = false, t }: EntityManagerProps) {
    const preferredLang = locale || "en";
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());

    // 수동 추가 폼
    const [showForm, setShowForm] = useState(false);
    const [newSource, setNewSource] = useState("");
    const [newTranslations, setNewTranslations] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // AI 추출
    const [extracting, setExtracting] = useState(false);
    const [extractedCandidates, setExtractedCandidates] = useState<Candidate[]>([]);

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

    const loadEntities = useCallback(async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${STORAGE}/api/novels/${novelId}/entities`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (res.ok) {
                const data = await res.json();
                setEntities(data?.entities || []);
            }
        } catch (e) {
            console.error("Failed to load entities:", e);
        } finally {
            setLoading(false);
        }
    }, [novelId]);

    useEffect(() => {
        loadEntities();
    }, [loadEntities]);

    // AI 고유명사 추출
    const handleExtract = async () => {
        setExtracting(true);
        const token = getToken();
        if (!token) { setExtracting(false); return; }

        try {
            // 1. 에피소드 목록 가져오기
            const epsRes = await fetch(
                `${STORAGE}/api/novels/${novelId}/episodes?include_scheduled=true`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!epsRes.ok) {
                alert(t("entities.extractEpFail"));
                setExtracting(false);
                return;
            }

            const epsData = await epsRes.json();
            const episodes = epsData.episodes ?? epsData ?? [];
            if (episodes.length === 0) {
                alert(t("entities.extractNoEp"));
                setExtracting(false);
                return;
            }

            // 2. 첫 10개 에피소드의 원문 수집
            const textsToProcess = episodes
                .slice(0, 10)
                .map((ep: { source_text?: string; korean_text?: string; content?: string }) =>
                    ep.source_text || ep.korean_text || ep.content || ""
                )
                .filter((text: string) => text && text.trim());

            if (textsToProcess.length === 0) {
                alert(t("entities.extractNoText"));
                setExtracting(false);
                return;
            }

            const episodeText = textsToProcess.join("\n\n");

            // 3. Pipeline 호출
            const pipelineBase =
                process.env.NEXT_PUBLIC_PIPELINE_BASE_URL ||
                "https://railway-ocr-server-2-production.up.railway.app";

            const res = await fetch(`${pipelineBase}/extract_entities`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-pin": process.env.NEXT_PUBLIC_PIPELINE_PIN || "",
                },
                body: JSON.stringify({
                    novel_title: novelTitle || novelId,
                    episode_text: episodeText,
                    languages: ["en", "ja", "zh", "es", "fr", "de", "pt", "id"],
                }),
            });

            if (!res.ok) {
                alert(t("entities.extractFail"));
                setExtracting(false);
                return;
            }

            const data = await res.json();
            const extracted = (data.candidates || [])
                .map((c: { source_text?: string; translations?: Record<string, string> }) => ({
                    source_text: c.source_text || "",
                    translations: c.translations || {},
                }))
                .filter((e: Candidate) => e.source_text && Object.keys(e.translations).length > 0);

            // 기존 엔티티와 중복 제거
            const existing = new Set(entities.map((e) => e.source_text));
            const newCandidates = extracted.filter((e: Candidate) => !existing.has(e.source_text));
            setExtractedCandidates(newCandidates);
        } catch (error) {
            console.error("Entity extraction failed:", error);
            alert(t("entities.extractFail"));
        } finally {
            setExtracting(false);
        }
    };

    const handleSaveCandidate = async (candidate: Candidate, index: number) => {
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
                    source_text: candidate.source_text,
                    translations: candidate.translations,
                    category: "default",
                }),
            });

            if (res.ok || res.status === 409) {
                setExtractedCandidates((prev) => prev.filter((_, i) => i !== index));
                loadEntities();
            }
        } catch (e) {
            console.error("Failed to save candidate:", e);
        }
    };

    const handleDiscardCandidate = (index: number) => {
        setExtractedCandidates((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAdd = async () => {
        if (!newSource.trim()) return;
        const token = getToken();
        if (!token) return;

        setSaving(true);
        try {
            const res = await fetch(`${STORAGE}/api/novels/${novelId}/entities`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    source_text: newSource.trim(),
                    translations: newTranslations,
                    category: "default",
                }),
            });

            if (res.ok || res.status === 409) {
                setNewSource("");
                setNewTranslations({});
                setShowForm(false);
                loadEntities();
            }
        } catch (e) {
            console.error("Failed to save entity:", e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (entity: Entity) => {
        if (!confirm(t("entities.deleteConfirm"))) return;
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(
                `${STORAGE}/api/novels/${novelId}/entities/${entity.id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res.ok) loadEntities();
        } catch (e) {
            console.error("Failed to delete entity:", e);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedEntities((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const getDisplayTranslation = (entity: Entity | Candidate) => {
        if (!entity.translations) return entity.source_text;
        return entity.translations[preferredLang] || entity.translations["en"] || entity.source_text;
    };

    return (
        <div style={{ marginTop: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#243A6E", margin: 0 }}>
                    {t("entities.title")} ({entities.length})
                </h2>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {showExtract && (
                        <button
                            onClick={handleExtract}
                            disabled={extracting}
                            style={{
                                padding: "6px 14px",
                                background: extracting ? "#9ca3af" : "#4a6fa5",
                                color: "#fff",
                                border: "none",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: extracting ? "wait" : "pointer",
                                borderRadius: 0,
                            }}
                        >
                            {extracting ? t("entities.extracting") : t("entities.extract")}
                        </button>
                    )}
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            padding: "6px 14px",
                            background: "#243A6E",
                            color: "#fff",
                            border: "none",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            borderRadius: 0,
                        }}
                    >
                        {showForm ? t("common.cancel") : t("entities.add")}
                    </button>
                </div>
            </div>

            {/* AI 추출 후보 */}
            {showExtract && extractedCandidates.length > 0 && (
                <div style={{
                    padding: 16,
                    background: "#fffbeb",
                    border: "1px solid #fbbf24",
                    marginBottom: 16,
                }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginTop: 0, marginBottom: 10 }}>
                        {t("entities.candidates")} ({extractedCandidates.length})
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {extractedCandidates.map((candidate, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "10px 12px",
                                    background: "#fff",
                                    gap: 10,
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                                        {candidate.source_text}
                                    </span>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                                        {Object.entries(candidate.translations)
                                            .slice(0, 3)
                                            .map(([lang, trans]) => (
                                                <span key={lang} style={{
                                                    padding: "2px 6px",
                                                    background: "#e0f2fe",
                                                    color: "#0369a1",
                                                    fontSize: 11,
                                                }}>
                                                    {lang.toUpperCase()}: {trans}
                                                </span>
                                            ))}
                                        {Object.keys(candidate.translations).length > 3 && (
                                            <span style={{
                                                padding: "2px 6px",
                                                background: "#f0f0f0",
                                                color: "#999",
                                                fontSize: 11,
                                            }}>
                                                +{Object.keys(candidate.translations).length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSaveCandidate(candidate, idx)}
                                    style={{
                                        padding: "4px 12px",
                                        background: "#243A6E",
                                        color: "#fff",
                                        border: "none",
                                        fontSize: 11,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        borderRadius: 0,
                                    }}
                                >
                                    {t("common.save")}
                                </button>
                                <button
                                    onClick={() => handleDiscardCandidate(idx)}
                                    style={{
                                        padding: "4px 8px",
                                        background: "#fff",
                                        color: "#c0392b",
                                        border: "1px solid #f5c6c6",
                                        fontSize: 11,
                                        cursor: "pointer",
                                        borderRadius: 0,
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 수동 추가 폼 */}
            {showForm && (
                <div style={{
                    padding: 16,
                    background: "#f8f9ff",
                    border: "1px solid #dde3f5",
                    marginBottom: 16,
                }}>
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#243A6E", marginBottom: 4 }}>
                            {t("entities.sourceText")}
                        </label>
                        <input
                            type="text"
                            value={newSource}
                            onChange={(e) => setNewSource(e.target.value)}
                            placeholder={t("entities.sourcePlaceholder")}
                            style={{
                                width: "100%",
                                padding: "8px 10px",
                                border: "1px solid #e5e5e5",
                                fontSize: 13,
                                borderRadius: 0,
                                outline: "none",
                                background: "#fff",
                                color: "#333",
                            }}
                        />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginBottom: 12 }}>
                        {ALL_LANGUAGES.filter(l => l !== "ko").map((lang) => (
                            <div key={lang}>
                                <label style={{ display: "block", fontSize: 11, color: "#999", marginBottom: 2 }}>
                                    {lang.toUpperCase()}
                                </label>
                                <input
                                    type="text"
                                    value={newTranslations[lang] || ""}
                                    onChange={(e) => setNewTranslations((prev) => ({ ...prev, [lang]: e.target.value }))}
                                    style={{
                                        width: "100%",
                                        padding: "6px 8px",
                                        border: "1px solid #e5e5e5",
                                        fontSize: 12,
                                        borderRadius: 0,
                                        outline: "none",
                                        background: "#fff",
                                        color: "#333",
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={saving || !newSource.trim()}
                        style={{
                            padding: "8px 20px",
                            background: saving || !newSource.trim() ? "#9ca3af" : "#243A6E",
                            color: "#fff",
                            border: "none",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: saving ? "wait" : "pointer",
                            borderRadius: 0,
                        }}
                    >
                        {saving ? t("common.loading") : t("common.save")}
                    </button>
                </div>
            )}

            {/* 엔티티 목록 */}
            {loading ? (
                <div style={{ padding: 24, textAlign: "center", color: "#999", fontSize: 13 }}>
                    {t("common.loading")}
                </div>
            ) : entities.length === 0 ? (
                <div style={{
                    padding: 24,
                    textAlign: "center",
                    color: "#999",
                    fontSize: 13,
                    border: "1px dashed #ddd",
                }}>
                    {t("entities.empty")}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {(isExpanded ? entities : entities.slice(0, 5)).map((entity) => (
                        <div
                            key={entity.id}
                            style={{
                                padding: "12px 16px",
                                background: "#fff",
                                border: "1px solid #e5e5e5",
                            }}
                        >
                            <div
                                onClick={() => toggleExpand(entity.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    cursor: "pointer",
                                }}
                            >
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>
                                    {entity.source_text}
                                    {getDisplayTranslation(entity) !== entity.source_text && (
                                        <span style={{ fontWeight: 400, color: "#333", marginLeft: 8 }}>
                                            → {getDisplayTranslation(entity)}
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
                                    <span style={{ fontSize: 11, color: "#999" }}>
                                        {expandedEntities.has(entity.id) ? "▲" : "▼"}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(entity); }}
                                        style={{
                                            padding: "4px 8px",
                                            border: "1px solid #f5c6c6",
                                            background: "#fff",
                                            fontSize: 11,
                                            cursor: "pointer",
                                            borderRadius: 0,
                                            color: "#c0392b",
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            {/* 확장: 전체 번역 표시 */}
                            {expandedEntities.has(entity.id) && entity.translations && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                                    {Object.entries(entity.translations).map(([lang, trans]) => (
                                        <span
                                            key={lang}
                                            style={{
                                                padding: "2px 6px",
                                                background: lang === preferredLang ? "#e0e0e0" : "#f3f4f6",
                                                color: lang === preferredLang ? "#111" : "#555",
                                                fontSize: 11,
                                                fontWeight: lang === preferredLang ? 600 : 400,
                                            }}
                                        >
                                            {lang.toUpperCase()}: {trans}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {entities.length > 5 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            style={{
                                padding: 10,
                                background: "transparent",
                                border: "1px dashed #ddd",
                                cursor: "pointer",
                                color: "#666",
                                fontSize: 12,
                                marginTop: 4,
                                borderRadius: 0,
                            }}
                        >
                            {isExpanded ? t("entities.collapse") : t("entities.showMore").replace("{count}", String(entities.length - 5))}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
