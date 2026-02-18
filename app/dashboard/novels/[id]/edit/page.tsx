"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace("/api", "") ?? "";

const GENRES = [
    "판타지", "로맨스", "현대판타지", "무협", "SF", "미스터리", "스릴러",
    "역사", "일상", "성장", "액션", "드라마", "공포", "기타",
];

export default function EditNovelPage() {
    const router = useRouter();
    const params = useParams();
    const novelId = params.id as string;

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
            setError("소설 정보를 불러오지 못했습니다.");
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
            setError("제목을 입력해주세요.");
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
                setError(data.error ?? "저장에 실패했습니다.");
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
            setError("네트워크 오류가 발생했습니다.");
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: "48px 24px", textAlign: "center", color: "#666" }}>불러오는 중...</div>;
    }

    return (
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <h1 style={{ fontFamily: '"KoPub Batang", serif', fontSize: 22, fontWeight: 600, color: "#243A6E" }}>
                    소설 정보 수정
                </h1>
                <Link href={`/dashboard/novels/${novelId}`} style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>
                    ← 소설 관리로
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                {/* 커버 이미지 */}
                <div style={{ marginBottom: 28 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        표지 이미지
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
                            {!coverPreview && "표지 없음"}
                        </div>
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                style={{ fontSize: 13, color: "#666" }}
                            />
                            <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
                                새 이미지를 선택하면 기존 표지가 교체됩니다
                            </div>
                        </div>
                    </div>
                </div>

                {/* 제목 */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        제목 <span style={{ color: "#c0392b" }}>*</span>
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
                        소개글
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
                        장르
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
                        <option value="">장르 선택 (선택사항)</option>
                        {GENRES.map((g) => (
                            <option key={g} value={g}>{g}</option>
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
                        {saving ? "저장 중..." : "저장"}
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
                        취소
                    </button>
                </div>
            </form>
        </main>
    );
}
