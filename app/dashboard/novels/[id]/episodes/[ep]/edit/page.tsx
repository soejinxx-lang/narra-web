"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const STORAGE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace("/api", "") ?? "";

export default function EditEpisodePage() {
    const router = useRouter();
    const params = useParams();
    const novelId = params.id as string;
    const epNum = Number(params.ep);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
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

    const fetchEpisode = useCallback(async () => {
        const token = getToken();
        if (!token) { router.push("/login"); return; }

        try {
            const res = await fetch(`${STORAGE}/api/novels/${novelId}/episodes/${epNum}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTitle(data.title ?? "");
                setContent(data.content ?? "");
            } else {
                setError("에피소드를 불러오지 못했습니다.");
            }
        } catch {
            setError("네트워크 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }, [novelId, epNum, router]);

    useEffect(() => { fetchEpisode(); }, [fetchEpisode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!content.trim()) {
            setError("본문을 입력해주세요.");
            return;
        }

        const token = getToken();
        if (!token) { router.push("/login"); return; }

        setSaving(true);

        try {
            // 에피소드 수정은 [ep]/route.ts POST (upsert)
            const res = await fetch(`${STORAGE}/api/novels/${novelId}/episodes/${epNum}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: title.trim() || null,
                    content: content.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? "저장에 실패했습니다.");
                setSaving(false);
                return;
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
        <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <h1 style={{ fontFamily: '"KoPub Batang", serif', fontSize: 22, fontWeight: 600, color: "#243A6E" }}>
                    {epNum}화 수정
                </h1>
                <Link href={`/dashboard/novels/${novelId}`} style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>
                    ← 소설 관리로
                </Link>
            </div>

            <div
                style={{
                    padding: "10px 14px",
                    background: "#fff8e1",
                    border: "1px solid #f6d860",
                    fontSize: 12,
                    color: "#b7791f",
                    marginBottom: 24,
                }}
            >
                ※ 내용을 수정해도 번역 쿼터가 차감되지 않습니다. 단, 번역은 재시작되지 않습니다.
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        제목 (선택)
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={`제${epNum}화`}
                        maxLength={200}
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

                <div style={{ marginBottom: 28 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#243A6E", fontSize: 14 }}>
                        본문 <span style={{ color: "#c0392b" }}>*</span>
                        <span style={{ fontWeight: 400, color: "#999", marginLeft: 8, fontSize: 12 }}>
                            {content.length.toLocaleString()}자
                        </span>
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={24}
                        required
                        disabled={saving}
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
