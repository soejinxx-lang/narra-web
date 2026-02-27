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

type EntityManagerProps = {
    novelId: string;
    t: (key: string) => string;
};

export default function EntityManager({ novelId, t }: EntityManagerProps) {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());
    const [preferredLang, setPreferredLang] = useState("en");

    // 수동 추가 폼
    const [showForm, setShowForm] = useState(false);
    const [newSource, setNewSource] = useState("");
    const [newTranslations, setNewTranslations] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

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
            const res = await fetch(`${STORAGE}/api/novels/${novelId}/entities`);
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
        const savedLang = localStorage.getItem("narra-locale");
        if (savedLang) setPreferredLang(savedLang);
        loadEntities();
    }, [loadEntities]);

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

    const getDisplayTranslation = (entity: Entity) => {
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
                    <select
                        value={preferredLang}
                        onChange={(e) => setPreferredLang(e.target.value)}
                        style={{
                            padding: "4px 8px",
                            border: "1px solid #e5e5e5",
                            fontSize: 12,
                            color: "#333",
                            borderRadius: 0,
                        }}
                    >
                        {ALL_LANGUAGES.map((l) => (
                            <option key={l} value={l}>{l.toUpperCase()}</option>
                        ))}
                    </select>
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
                                display: "flex",
                                alignItems: "flex-start",
                                padding: "12px 16px",
                                background: "#fff",
                                border: "1px solid #e5e5e5",
                                gap: 12,
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>
                                    {entity.source_text}
                                    <span style={{ fontWeight: 400, color: "#666", marginLeft: 8 }}>
                                        → {getDisplayTranslation(entity)}
                                    </span>
                                </div>
                                {expandedEntities.has(entity.id) && entity.translations && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                                        {Object.entries(entity.translations)
                                            .filter(([lang]) => lang !== preferredLang)
                                            .map(([lang, trans]) => (
                                                <span
                                                    key={lang}
                                                    style={{
                                                        padding: "2px 6px",
                                                        background: "#e8f0fe",
                                                        color: "#1a56db",
                                                        fontSize: 11,
                                                    }}
                                                >
                                                    {lang.toUpperCase()}: {trans}
                                                </span>
                                            ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                                <button
                                    onClick={() => toggleExpand(entity.id)}
                                    style={{
                                        padding: "4px 8px",
                                        border: "1px solid #e5e5e5",
                                        background: "#fff",
                                        fontSize: 11,
                                        cursor: "pointer",
                                        borderRadius: 0,
                                        color: "#666",
                                    }}
                                >
                                    {expandedEntities.has(entity.id) ? "▲" : "▼"}
                                </button>
                                <button
                                    onClick={() => handleDelete(entity)}
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
