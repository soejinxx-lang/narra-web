"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "../../../../../lib/i18n";
import EntityManager from "../../../../../components/EntityManager";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace("/api", "") ?? "";

const GENRE_KEYS = [
    "fantasy", "romance", "modernFantasy", "martialArts", "sf", "mystery", "thriller",
    "historical", "sliceOfLife", "comingOfAge", "action", "drama", "horror", "other",
] as const;

export default function EditNovelPage() {
    const router = useRouter();
    const params = useParams();
    const novelId = params.id as string;
    const { t, locale } = useLocale();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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

    const fetchNovel = useCallback(async () => {
        const token = getToken();
        if (!token) { router.push("/login"); return; }

        try {
            const res = await fetch(`${STORAGE}/api/novels/${novelId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 403) { router.push("/dashboard"); return; }
            if (res.ok) {
                const data = await res.json();
                setTitle(data.title ?? "");
                setDescription(data.description ?? "");
                setGenre(data.genre ?? "");
                setCoverPreview(data.cover_url ?? null);
            }
        } catch {
            setError(t("editNovel.errorLoad"));
        } finally {
            setLoading(false);
        }
    }, [novelId, router]);

    useEffect(() => { fetchNovel(); }, [fetchNovel]);

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError(t("editNovel.errorNoTitle"));
            return;
        }

        const token = getToken();
        if (!token) { router.push("/login"); return; }

        setSaving(true);

        try {
            // 소설 정보 수정
            const res = await fetch(`${STORAGE}/api/novels/${novelId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    genre: genre || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? t("editNovel.errorSave"));
                setSaving(false);
                return;
            }

            // 커버 이미지 업로드 (변경된 경우)
            if (coverFile) {
                const formData = new FormData();
                formData.append("file", coverFile);
                await fetch(`${STORAGE}/api/novels/${novelId}/cover`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
            }

            router.push(`/dashboard/novels/${novelId}`);
        } catch {
            setError(t("editNovel.errorNetwork"));
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: "48px 24px", textAlign: "center", color: "#666" }}>{t("common.loading")}</div>;
    }

    return (
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <h1 style={{ fontFamily: '"KoPub Batang", serif', fontSize: 22, fontWeight: 600, color: "#243A6E" }}>
                    {t("editNovel.title")}
                </h1>
                <Link href={`/dashboard/novels/${novelId}`} style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>
                    {t("editNovel.backToNovel")}
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                {/* 커버 이미지 */}
                <div style={{ marginBottom: 28 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        {t("editNovel.coverImage")}
                    </label>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                        <div
                            style={{
                                width: 100,
                                height: 140,
                                background: coverPreview ? `url(${coverPreview}) center/cover` : "#e8ecf5",
                                border: "1px solid #e5e5e5",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                color: "#999",
                                flexShrink: 0,
                            }}
                        >
                            {!coverPreview && t("editNovel.noCover")}
                        </div>
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                style={{ fontSize: 13, color: "#666" }}
                            />
                            <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
                                {t("editNovel.coverChangeHint")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 제목 */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        {t("editNovel.novelTitle")} <span style={{ color: "#c0392b" }}>*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                        required
                        disabled={saving}
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

                {/* 설명 */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        {t("editNovel.description")}
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={1000}
                        rows={4}
                        disabled={saving}
                        style={{
                            width: "100%",
                            padding: "11px 12px",
                            border: "1px solid #e5e5e5",
                            borderRadius: 0,
                            fontSize: 14,
                            outline: "none",
                            resize: "vertical",
                        }}
                    />
                </div>

                {/* 장르 */}
                <div style={{ marginBottom: 32 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        {t("editNovel.genre")}
                    </label>
                    <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        disabled={saving}
                        style={{
                            width: "100%",
                            padding: "11px 12px",
                            border: "1px solid #e5e5e5",
                            borderRadius: 0,
                            fontSize: 14,
                            outline: "none",
                            background: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        <option value="">{t("editNovel.genreSelect")}</option>
                        {GENRE_KEYS.map((key) => (
                            <option key={key} value={t(`createNovel.genres.${key}`)}>{t(`createNovel.genres.${key}`)}</option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div style={{ padding: "12px", background: "#fee", color: "#c33", marginBottom: 20, fontSize: 13 }}>
                        {error}
                    </div>
                )}

                <div style={{ display: "flex", gap: 12 }}>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            flex: 1,
                            padding: "13px",
                            background: saving ? "#9ca3af" : "#243A6E",
                            color: "#fff",
                            border: "none",
                            borderRadius: 0,
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: saving ? "not-allowed" : "pointer",
                        }}
                    >
                        {saving ? t("editNovel.saving") : t("editNovel.save")}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={saving}
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
                        {t("editNovel.cancel")}
                    </button>
                </div>
            </form>

            <EntityManager novelId={novelId} novelTitle={title} locale={locale} showExtract={true} t={t} />
        </main>
    );
}
