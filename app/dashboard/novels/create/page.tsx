"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "../../../../lib/i18n";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace("/api", "") ?? "";

const LANGUAGES = [
    { value: "ko", label: "한국어" },
    { value: "en", label: "English" },
    { value: "ja", label: "日本語" },
    { value: "zh", label: "中文" },
    { value: "es", label: "Español" },
];

const GENRE_KEYS = [
    "fantasy", "romance", "modernFantasy", "martialArts", "sf", "mystery", "thriller",
    "historical", "sliceOfLife", "comingOfAge", "action", "drama", "horror", "other",
] as const;

export default function CreateNovelPage() {
    const router = useRouter();
    const { t } = useLocale();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
    const [sourceLang, setSourceLang] = useState("ko");
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [cooldownMsg, setCooldownMsg] = useState("");

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

    useEffect(() => {
        if (!getToken()) router.push("/login");
    }, [router]);

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setCooldownMsg("");

        if (!title.trim()) {
            setError(t("createNovel.errorNoTitle"));
            return;
        }

        const token = getToken();
        if (!token) { router.push("/login"); return; }

        setLoading(true);

        try {
            const res = await fetch(`${STORAGE}/api/novels`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    genre: genre || null,
                    source_language: sourceLang,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    if (data.error === "SIGNUP_COOLDOWN") {
                        const mins = Math.ceil((data.waitSeconds ?? 600) / 60);
                        setCooldownMsg(t("createNovel.errorCooldown").replace("{mins}", String(mins)));
                    } else if (data.error === "NOVEL_QUOTA_EXCEEDED") {
                        const h = Math.floor((data.resetIn ?? 0) / 3600);
                        const m = Math.floor(((data.resetIn ?? 0) % 3600) / 60);
                        setCooldownMsg(
                            t("createNovel.errorQuotaExceeded")
                                .replace("{h}", String(h))
                                .replace("{m}", String(m))
                        );
                    } else {
                        setError(data.error ?? t("createNovel.errorGeneric"));
                    }
                    setLoading(false);
                    return;
                }
                setError(data.error ?? t("createNovel.errorGeneric"));
                setLoading(false);
                return;
            }

            const novelId = data.novel.id;

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
            setError(t("createNovel.errorNetwork"));
            setLoading(false);
        }
    };

    return (
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
            <h1
                style={{
                    fontFamily: '"KoPub Batang", serif',
                    fontSize: 26,
                    fontWeight: 600,
                    color: "#243A6E",
                    marginBottom: 32,
                }}
            >
                {t("createNovel.title")}
            </h1>

            <form onSubmit={handleSubmit}>
                {/* Cover image */}
                <div style={{ marginBottom: 28 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        {t("createNovel.coverImage")}
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
                            {!coverPreview && t("createNovel.noCover")}
                        </div>
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                style={{ fontSize: 13, color: "#666" }}
                            />
                            <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
                                {t("createNovel.coverHint")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        {t("createNovel.novelTitle")} <span style={{ color: "#c0392b" }}>*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t("createNovel.titlePlaceholder")}
                        maxLength={100}
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

                {/* Description */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        {t("createNovel.description")}
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t("createNovel.descPlaceholder")}
                        maxLength={1000}
                        rows={4}
                        disabled={loading}
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

                {/* Genre */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        {t("createNovel.genre")}
                    </label>
                    <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        disabled={loading}
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
                        <option value="">{t("createNovel.genreSelect")}</option>
                        {GENRE_KEYS.map((key) => (
                            <option key={key} value={t(`createNovel.genres.${key}`)}>{t(`createNovel.genres.${key}`)}</option>
                        ))}
                    </select>
                </div>

                {/* Source language */}
                <div style={{ marginBottom: 32 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        {t("createNovel.sourceLanguage")}
                    </label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.value}
                                type="button"
                                onClick={() => setSourceLang(lang.value)}
                                disabled={loading}
                                style={{
                                    padding: "8px 16px",
                                    border: `1px solid ${sourceLang === lang.value ? "#243A6E" : "#e5e5e5"}`,
                                    background: sourceLang === lang.value ? "#243A6E" : "#fff",
                                    color: sourceLang === lang.value ? "#fff" : "#666",
                                    fontSize: 13,
                                    cursor: "pointer",
                                    borderRadius: 0,
                                    fontWeight: sourceLang === lang.value ? 600 : 400,
                                }}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error / cooldown */}
                {error && (
                    <div style={{ padding: "12px", background: "#fee", color: "#c33", marginBottom: 20, fontSize: 13 }}>
                        {error}
                    </div>
                )}
                {cooldownMsg && (
                    <div style={{ padding: "12px", background: "#fff8e1", color: "#b7791f", border: "1px solid #f6d860", marginBottom: 20, fontSize: 13 }}>
                        {cooldownMsg}
                    </div>
                )}

                <div style={{ display: "flex", gap: 12 }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: "13px",
                            background: loading ? "#9ca3af" : "#243A6E",
                            color: "#fff",
                            border: "none",
                            borderRadius: 0,
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? t("createNovel.submitting") : t("createNovel.submit")}
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
                        {t("createNovel.cancel")}
                    </button>
                </div>
            </form>
        </main>
    );
}
