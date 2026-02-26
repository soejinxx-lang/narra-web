"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getReadingNovels, getCurrentUserId, getReadingProgress } from "@/app/utils/readingProgress";
import { getFavorites, getCompleted, getLibraryStats } from "@/app/utils/library";
import { fetchNovels } from "@/lib/api";
import NovelCard from "@/app/components/NovelCard";
import { toRoman } from "@/lib/utils";
import { useLocale } from "../../lib/i18n";

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

type ReadingTab = "reading" | "completed" | "favorites";

function formatCountdown(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MyPage() {
    const router = useRouter();
    const { t } = useLocale();

    // --- Auth ---
    const [user, setUser] = useState<{ id: string; username: string; name?: string; role?: string } | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // --- Reading section ---
    const [readingTab, setReadingTab] = useState<ReadingTab>("reading");
    const [readingNovels, setReadingNovels] = useState<Array<{ novelId: string; episodeEp: string; progress: number; lastReadAt: number }>>([]);
    const [allNovels, setAllNovels] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [completed, setCompleted] = useState<Record<string, { episodeEp: string; completedAt: number }>>({});
    const [stats, setStats] = useState({ reading: 0, completed: 0, favorites: 0, totalEpisodes: 0 });

    // --- Writing section ---
    const [myNovels, setMyNovels] = useState<Novel[]>([]);
    const [quota, setQuota] = useState<Quota | null>(null);
    const [countdown, setCountdown] = useState(0);
    const [writingLoading, setWritingLoading] = useState(true);

    // --- Activity section ---
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [myComments, setMyComments] = useState<any[]>([]);

    // --- Section collapse ---
    const [readingOpen, setReadingOpen] = useState(true);
    const [writingOpen, setWritingOpen] = useState(true);
    const [activityOpen, setActivityOpen] = useState(true);

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

    // --- Init ---
    useEffect(() => {
        setMounted(true);

        const loggedInUser = localStorage.getItem("loggedInUser") || localStorage.getItem("currentUser");
        if (!loggedInUser) {
            router.push("/login");
            return;
        }

        try {
            const parsed = JSON.parse(loggedInUser);
            setUser(parsed);
        } catch {
            router.push("/login");
            return;
        }

        const currentUserId = getCurrentUserId();
        if (!currentUserId) {
            router.push("/login");
            return;
        }
        setUserId(currentUserId);

        // Reading data
        const reading = getReadingNovels(currentUserId, 100);
        setReadingNovels(reading);
        setFavorites(getFavorites(currentUserId));
        setCompleted(getCompleted(currentUserId));
        setStats(getLibraryStats(currentUserId));

        fetchNovels().then(setAllNovels).catch(() => { });
    }, [router]);

    // --- Writing data ---
    const fetchWritingData = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setWritingLoading(false);
            return;
        }

        try {
            const [novelsRes, quotaRes] = await Promise.all([
                fetch(`${STORAGE}/api/user/novels`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                }),
                fetch(`${STORAGE}/api/user/quota`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                }),
            ]);

            if (novelsRes.ok) {
                const data = await novelsRes.json();
                // Handle different response formats
                const novels = data.novels ?? data.data ?? (Array.isArray(data) ? data : []);
                console.log("[MyPage] novels response:", data, "→ parsed:", novels.length);
                setMyNovels(novels);
            } else {
                console.warn("[MyPage] novels fetch failed:", novelsRes.status, novelsRes.statusText);
            }

            if (quotaRes.ok) {
                const data = await quotaRes.json();
                setQuota(data);
                setCountdown(data.translation.resetIn);
            }
        } catch (err) {
            console.error("[MyPage] fetchWritingData error:", err);
        } finally {
            setWritingLoading(false);
        }
    }, []);

    useEffect(() => {
        if (mounted && user) {
            fetchWritingData();
        }
    }, [mounted, user, fetchWritingData]);

    // --- Activity data ---
    useEffect(() => {
        if (!mounted || !user) return;

        const token = getToken();
        if (!token) return;

        // Fetch user posts
        fetch(`${STORAGE}/api/community/posts`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.ok ? r.json() : { posts: [] })
            .then((data) => {
                const userPosts = (data.posts || [])
                    .filter((p: any) => p.user_id === user.id || p.author === user.username)
                    .slice(0, 5);
                setMyPosts(userPosts);
            })
            .catch(() => { });
    }, [mounted, user]);

    // --- Countdown ---
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    fetchWritingData();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown, fetchWritingData]);

    // --- Reading data processing ---
    const readingNovelsWithInfo = useMemo(() => {
        return readingNovels
            .map((reading) => {
                const novel = allNovels.find((n) => n.id === reading.novelId);
                if (!novel) return null;
                return { ...novel, episodeEp: reading.episodeEp, progress: reading.progress, lastReadAt: reading.lastReadAt };
            })
            .filter((item) => item !== null && item.progress > 0)
            .sort((a, b) => (b?.lastReadAt || 0) - (a?.lastReadAt || 0));
    }, [readingNovels, allNovels]);

    const completedNovelsWithInfo = useMemo(() => {
        return Object.entries(completed)
            .map(([novelId, data]) => {
                const novel = allNovels.find((n) => n.id === novelId);
                if (!novel) return null;
                return { ...novel, episodeEp: data.episodeEp, completedAt: data.completedAt };
            })
            .filter((item) => item !== null)
            .sort((a, b) => (b?.completedAt || 0) - (a?.completedAt || 0));
    }, [completed, allNovels]);

    const favoriteNovelsWithInfo = useMemo(() => {
        return favorites
            .map((novelId) => allNovels.find((n) => n.id === novelId))
            .filter((item) => item !== null);
    }, [favorites, allNovels]);

    const formatLastRead = (timestamp: number): string => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        return `${days}d`;
    };

    const isAuthor = user?.role === "author" || user?.role === "admin";

    if (!mounted || !userId) {
        return (
            <main style={{ padding: "40px 24px", textAlign: "center" }}>
                <div style={{ color: "#999", fontSize: "16px" }}>{t("common.loading")}</div>
            </main>
        );
    }

    // --- Section header component ---
    const SectionHeader = ({ title, isOpen, onToggle }: { title: string; isOpen: boolean; onToggle: () => void }) => (
        <div
            onClick={onToggle}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                padding: "20px 0",
                borderBottom: "2px solid #243A6E",
                marginBottom: isOpen ? "24px" : "0",
                userSelect: "none",
            }}
        >
            <h2
                style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#243A6E",
                    fontFamily: '"KoPub Batang", serif',
                    margin: 0,
                    letterSpacing: "-0.3px",
                }}
            >
                {title}
            </h2>
            <span style={{ fontSize: "14px", color: "#999", transition: "transform 0.2s" }}>
                {isOpen ? "−" : "+"}
            </span>
        </div>
    );

    return (
        <main
            style={{
                padding: "32px 24px 80px 24px",
                background: "#faf9f6",
                minHeight: "100vh",
                maxWidth: "1000px",
                margin: "0 auto",
            }}
        >
            {/* Page title */}
            <div style={{ marginBottom: "40px" }}>
                <h1
                    style={{
                        fontSize: "28px",
                        fontWeight: 600,
                        color: "#243A6E",
                        fontFamily: '"KoPub Batang", serif',
                        marginBottom: "8px",
                    }}
                >
                    {t("mypage.title")}
                </h1>
                <div style={{ fontSize: "14px", color: "#999" }}>
                    {user?.name || user?.username}
                </div>
            </div>

            {/* ============ READING SECTION ============ */}
            <section style={{ marginBottom: "48px" }}>
                <SectionHeader
                    title={t("mypage.reading")}
                    isOpen={readingOpen}
                    onToggle={() => setReadingOpen(!readingOpen)}
                />

                {readingOpen && (
                    <>
                        {/* Stats bar */}
                        <div style={{ display: "flex", gap: "32px", marginBottom: "24px", flexWrap: "wrap" }}>
                            {[
                                { label: t("library.reading"), value: stats.reading },
                                { label: t("browse.completed"), value: stats.completed },
                                { label: t("library.favorites"), value: stats.favorites },
                                { label: t("mypage.episodesRead"), value: stats.totalEpisodes },
                            ].map((stat) => (
                                <div key={stat.label} style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "24px", fontWeight: 700, color: "#243A6E" }}>{stat.value}</div>
                                    <div style={{ fontSize: "12px", color: "#999" }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Sub tabs */}
                        <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
                            {(["reading", "completed", "favorites"] as ReadingTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setReadingTab(tab)}
                                    style={{
                                        padding: "8px 16px",
                                        background: readingTab === tab ? "#243A6E" : "transparent",
                                        color: readingTab === tab ? "#fff" : "#666",
                                        border: readingTab === tab ? "none" : "1px solid #e5e5e5",
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {tab === "reading" && t("library.reading")}
                                    {tab === "completed" && t("browse.completed")}
                                    {tab === "favorites" && t("library.favorites")}
                                </button>
                            ))}
                        </div>

                        {/* Reading content */}
                        {readingTab === "reading" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {readingNovelsWithInfo.length === 0 ? (
                                    <div style={{ padding: "32px", textAlign: "center", color: "#999", border: "1px dashed #e5e5e5" }}>
                                        {t("library.empty")}
                                    </div>
                                ) : (
                                    readingNovelsWithInfo.slice(0, 10).map((novel: any) => (
                                        <Link
                                            key={novel.id}
                                            href={`/novels/${novel.id}/episodes/${novel.episodeEp}`}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "16px",
                                                padding: "16px",
                                                background: "#fff",
                                                border: "1px solid #e5e5e5",
                                                textDecoration: "none",
                                                color: "inherit",
                                                transition: "background 0.15s",
                                            }}
                                            onMouseEnter={(e: any) => { e.currentTarget.style.background = "#f8f7f4"; }}
                                            onMouseLeave={(e: any) => { e.currentTarget.style.background = "#fff"; }}
                                        >
                                            <div style={{ flexShrink: 0, width: "48px", height: "64px", background: "#e8ecf5", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                                {novel.cover_image ? (
                                                    <img src={novel.cover_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    <span style={{ fontSize: "10px", color: "#999" }}>N</span>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: "15px", fontWeight: 600, color: "#222", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {novel.title}
                                                </div>
                                                <div style={{ fontSize: "12px", color: "#999" }}>
                                                    {novel.episode_format === "roman" ? toRoman(novel.episodeEp) : `EP ${novel.episodeEp}`} · {novel.progress}% · {formatLastRead(novel.lastReadAt)}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#bbb", flexShrink: 0 }}>→</div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}

                        {readingTab === "completed" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {completedNovelsWithInfo.length === 0 ? (
                                    <div style={{ padding: "32px", textAlign: "center", color: "#999", border: "1px dashed #e5e5e5" }}>
                                        {t("library.empty")}
                                    </div>
                                ) : (
                                    completedNovelsWithInfo.map((novel: any) => (
                                        <Link
                                            key={novel.id}
                                            href={`/novels/${novel.id}`}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "16px",
                                                padding: "16px",
                                                background: "#fff",
                                                border: "1px solid #e5e5e5",
                                                textDecoration: "none",
                                                color: "inherit",
                                            }}
                                        >
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: "15px", fontWeight: 600, color: "#222", marginBottom: "4px" }}>{novel.title}</div>
                                                <div style={{ fontSize: "12px", color: "#999" }}>
                                                    {novel.episode_format === "roman" ? toRoman(novel.episodeEp) : `EP ${novel.episodeEp}`} · {formatLastRead(novel.completedAt)}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#bbb" }}>→</div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}

                        {readingTab === "favorites" && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "16px" }}>
                                {favoriteNovelsWithInfo.length === 0 ? (
                                    <div style={{ padding: "32px", textAlign: "center", color: "#999", border: "1px dashed #e5e5e5", gridColumn: "1 / -1" }}>
                                        {t("library.empty")}
                                    </div>
                                ) : (
                                    favoriteNovelsWithInfo.map((novel: any) => (
                                        <Link key={novel.id} href={`/novels/${novel.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                            <NovelCard novel={novel} />
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* ============ WRITING SECTION ============ */}
            <section style={{ marginBottom: "48px" }}>
                <SectionHeader
                    title={t("mypage.writing")}
                    isOpen={writingOpen}
                    onToggle={() => setWritingOpen(!writingOpen)}
                />

                {writingOpen && (
                    <>
                        {!isAuthor ? (
                            /* CTA for non-authors */
                            <div
                                style={{
                                    border: "1px dashed #ccc",
                                    padding: "48px 24px",
                                    textAlign: "center",
                                }}
                            >
                                <div style={{ fontSize: "16px", color: "#666", marginBottom: "16px", fontFamily: '"KoPub Batang", serif' }}>
                                    {t("mypage.becomeAuthorDesc")}
                                </div>
                                <Link
                                    href="/dashboard/novels/create"
                                    style={{
                                        display: "inline-block",
                                        padding: "10px 24px",
                                        background: "#243A6E",
                                        color: "#fff",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        textDecoration: "none",
                                    }}
                                >
                                    {t("mypage.becomeAuthor")}
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Quota widget */}
                                {quota && (
                                    <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "16px 20px", marginBottom: "20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
                                            <div>
                                                <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                                    {t("dashboard.translationQuota")}
                                                </div>
                                                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                                    {[0, 1, 2].map((i) => (
                                                        <div key={i} style={{ width: 28, height: 8, background: i < quota.translation.used ? "#243A6E" : "#e5e5e5" }} />
                                                    ))}
                                                    <span style={{ marginLeft: "8px", fontSize: "13px", color: "#333", fontWeight: 500 }}>
                                                        {quota.translation.remaining}/3 {t("dashboard.remaining")}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ borderLeft: "1px solid #e5e5e5", paddingLeft: "24px" }}>
                                                <div style={{ fontSize: "11px", color: "#999", marginBottom: "4px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                                    {t("dashboard.resetIn")}
                                                </div>
                                                <div style={{ fontSize: "18px", fontWeight: 700, color: countdown < 3600 ? "#c0392b" : "#243A6E", fontVariantNumeric: "tabular-nums" }}>
                                                    {formatCountdown(countdown)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Novel list header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <span style={{ fontSize: "13px", color: "#999" }}>
                                        {myNovels.length}{t("dashboard.episodeCount")}
                                    </span>
                                    <Link
                                        href="/dashboard/novels/create"
                                        style={{
                                            padding: "6px 14px",
                                            background: "#243A6E",
                                            color: "#fff",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            textDecoration: "none",
                                        }}
                                    >
                                        {t("dashboard.newNovel")}
                                    </Link>
                                </div>

                                {/* Novel list */}
                                {writingLoading ? (
                                    <div style={{ padding: "32px", textAlign: "center", color: "#999" }}>{t("common.loading")}</div>
                                ) : myNovels.length === 0 ? (
                                    <div style={{ border: "1px dashed #ddd", padding: "40px 24px", textAlign: "center", color: "#999" }}>
                                        <div style={{ fontSize: "14px", marginBottom: "16px" }}>{t("dashboard.noNovels")}</div>
                                        <Link
                                            href="/dashboard/novels/create"
                                            style={{
                                                padding: "10px 20px",
                                                background: "#243A6E",
                                                color: "#fff",
                                                fontSize: "13px",
                                                fontWeight: 600,
                                                textDecoration: "none",
                                            }}
                                        >
                                            {t("dashboard.createFirst")}
                                        </Link>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                                        {myNovels.map((novel) => (
                                            <Link
                                                key={novel.id}
                                                href={`/dashboard/novels/${novel.id}`}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "16px",
                                                    padding: "14px 16px",
                                                    background: "#fff",
                                                    border: "1px solid #e5e5e5",
                                                    textDecoration: "none",
                                                    color: "inherit",
                                                    transition: "background 0.15s",
                                                }}
                                                onMouseEnter={(e: any) => { e.currentTarget.style.background = "#f8f7f4"; }}
                                                onMouseLeave={(e: any) => { e.currentTarget.style.background = "#fff"; }}
                                            >
                                                <div
                                                    style={{
                                                        width: 40,
                                                        height: 54,
                                                        background: novel.cover_url ? `url(${novel.cover_url}) center/cover` : "#e8ecf5",
                                                        flexShrink: 0,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "10px",
                                                        color: "#999",
                                                    }}
                                                >
                                                    {!novel.cover_url && "N"}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#222", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {novel.title}
                                                        </span>
                                                        {novel.is_hidden && (
                                                            <span style={{ fontSize: "10px", padding: "1px 6px", background: "#f5f5f5", color: "#999", flexShrink: 0 }}>
                                                                {t("mypage.hidden")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: "12px", color: "#999" }}>
                                                        {t("dashboard.episodes")} {novel.episode_count}{t("dashboard.episodeCount")}
                                                        {novel.failed_count > 0 && (
                                                            <span style={{ marginLeft: "8px", color: "#c0392b" }}>
                                                                ⚠ {novel.failed_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: "12px", color: "#bbb", flexShrink: 0 }}>→</div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </section>

            {/* ============ ACTIVITY SECTION ============ */}
            <section>
                <SectionHeader
                    title={t("mypage.activity")}
                    isOpen={activityOpen}
                    onToggle={() => setActivityOpen(!activityOpen)}
                />

                {activityOpen && (
                    <>
                        {/* My posts */}
                        <div style={{ marginBottom: "24px" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#666", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                {t("mypage.recentPosts")}
                            </h3>
                            {myPosts.length === 0 ? (
                                <div style={{ padding: "24px", textAlign: "center", color: "#ccc", border: "1px dashed #e5e5e5", fontSize: "14px" }}>
                                    {t("mypage.noPosts")}
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                                    {myPosts.map((post: any) => (
                                        <div
                                            key={post.id}
                                            style={{
                                                padding: "12px 16px",
                                                background: "#fff",
                                                border: "1px solid #e5e5e5",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: "14px", fontWeight: 500, color: "#222", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {post.title}
                                                </div>
                                                <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>
                                                    {post.topic} · {getTimeAgo(post.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Link to community */}
                        <div style={{ textAlign: "center", marginTop: "16px" }}>
                            <Link
                                href="/community"
                                style={{
                                    fontSize: "13px",
                                    color: "#243A6E",
                                    textDecoration: "underline",
                                }}
                            >
                                {t("community.title")} →
                            </Link>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
