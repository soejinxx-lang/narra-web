"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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

const STATUS_LABEL: Record<string, string> = {
    published: "발행",
    scheduled: "예약",
    draft: "임시저장",
};

export default function NovelManagePage() {
    const router = useRouter();
    const params = useParams();
    const novelId = params.id as string;

    const [novel, setNovel] = useState<Novel | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
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
        if (!token) { router.push("/login"); return; }

        try {
            const [novelRes, epsRes] = await Promise.all([
                fetch(`${STORAGE}/api/novels/${novelId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${STORAGE}/api/novels/${novelId}/episodes?include_scheduled=true`, {
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
        } catch {
            setError("데이터를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [novelId, router]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async () => {
        if (!confirm(`"${novel?.title}" 소설을 삭제하시겠습니까?\n에피소드와 번역 데이터가 모두 삭제됩니다.`)) return;
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
            setError(data.error ?? "삭제에 실패했습니다.");
            setDeleting(false);
        }
    };

    if (loading) {
        return <div style={{ padding: "48px 24px", textAlign: "center", color: "#666" }}>불러오는 중...</div>;
    }

    if (!novel) {
        return <div style={{ padding: "48px 24px", textAlign: "center", color: "#999" }}>소설을 찾을 수 없습니다.</div>;
    }

    return (
        <main style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
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
                                내 작품
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize: 13, color: "#666", marginBottom: 12, lineHeight: 1.6 }}>
                        {novel.description || <span style={{ color: "#bbb" }}>소개글 없음</span>}
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
                            소설 정보 수정
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
                            {deleting ? "삭제 중..." : "소설 삭제"}
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div style={{ padding: "12px", background: "#fee", color: "#c33", marginBottom: 20, fontSize: 13 }}>
                    {error}
                </div>
            )}

            {/* 에피소드 목록 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#333" }}>
                    에피소드 <span style={{ color: "#999", fontWeight: 400 }}>{episodes.length}화</span>
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
                    + 새 에피소드
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
                    아직 에피소드가 없습니다. 첫 화를 작성해보세요.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {episodes.map((ep) => (
                        <div
                            key={ep.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "14px 16px",
                                background: "#fff",
                                border: "1px solid #e5e5e5",
                                gap: 12,
                            }}
                        >
                            <span style={{ fontSize: 12, color: "#999", width: 36, flexShrink: 0 }}>
                                {ep.ep}화
                            </span>
                            <span style={{ flex: 1, fontSize: 14, color: "#333", fontWeight: 500 }}>
                                {ep.title || `제${ep.ep}화`}
                            </span>
                            <span
                                style={{
                                    fontSize: 11,
                                    padding: "2px 7px",
                                    background: ep.status === "published" ? "#e8f5e9" : ep.status === "scheduled" ? "#fff8e1" : "#f5f5f5",
                                    color: ep.status === "published" ? "#2e7d32" : ep.status === "scheduled" ? "#b7791f" : "#999",
                                }}
                            >
                                {STATUS_LABEL[ep.status ?? ""] ?? ep.status ?? "발행"}
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
                                수정
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ marginTop: 24 }}>
                <Link href="/dashboard" style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>
                    ← 내 작품 목록으로
                </Link>
            </div>
        </main>
    );
}
