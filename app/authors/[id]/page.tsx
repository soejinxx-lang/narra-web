export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Link from "next/link";
import { fetchAuthorById } from "@/lib/api";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function AuthorPage({ params }: PageProps) {
    const { id } = await params;

    let data: any;
    try {
        data = await fetchAuthorById(id);
        console.log("🔍 [AuthorPage] id:", id);
        console.log("🔍 [AuthorPage] novels count:", data?.novels?.length);
        console.log("🔍 [AuthorPage] data:", JSON.stringify(data, null, 2));
    } catch {
        return (
            <main style={{ padding: 24, textAlign: "center", color: "#999" }}>
                <h2>Author not found</h2>
            </main>
        );
    }

    const { author, novels } = data;

    return (
        <main style={{ padding: "32px 24px", maxWidth: "960px", margin: "0 auto" }}>
            {/* 작가 프로필 */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: 32,
            }}>
                <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "22px",
                    fontWeight: 700,
                    flexShrink: 0,
                    overflow: "hidden",
                }}>
                    {author.avatar_url ? (
                        <img
                            src={author.avatar_url}
                            alt={author.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        (author.name || "?").charAt(0).toUpperCase()
                    )}
                </div>
                <div>
                    <h1 style={{
                        fontSize: "24px",
                        fontWeight: 600,
                        color: "#243A6E",
                        fontFamily: '"KoPub Batang", serif',
                        margin: 0,
                    }}>
                        {author.name || author.username}
                    </h1>
                    {author.bio && (
                        <p style={{ color: "#888", fontSize: "14px", margin: "4px 0 0" }}>
                            {author.bio}
                        </p>
                    )}
                </div>
            </div>

            {/* Support Links */}
            {(author.kofi_url || author.patreon_url) && (
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: 32,
                        flexWrap: "wrap",
                    }}
                >
                    {author.kofi_url && (
                        <a
                            href={author.kofi_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                background: "#FF5E5B",
                                color: "#fff",
                                fontSize: "13px",
                                fontWeight: 600,
                                textDecoration: "none",
                                transition: "opacity 0.2s",
                            }}
                        >
                            ☕ Ko-fi
                        </a>
                    )}
                    {author.patreon_url && (
                        <a
                            href={author.patreon_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                background: "#FF424D",
                                color: "#fff",
                                fontSize: "13px",
                                fontWeight: 600,
                                textDecoration: "none",
                                transition: "opacity 0.2s",
                            }}
                        >
                            🎨 Patreon
                        </a>
                    )}
                </div>
            )}

            {/* 작품 목록 */}
            <h2 style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#333",
                marginBottom: 16,
                borderBottom: "1px solid #eee",
                paddingBottom: 8,
            }}>
                Works ({novels.length})
            </h2>

            {novels.length === 0 ? (
                <p style={{ color: "#999" }}>No published works yet.</p>
            ) : (
                <>
                    <style>{`.author-novel-card { background: #fff; border-color: #e5e5e5; transition: background 0.2s, border-color 0.2s; } .author-novel-card:hover { background: #faf9f7; border-color: #d0ccc5; }`}</style>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {novels.map((novel: any) => (
                            <Link
                                key={novel.id}
                                href={`/novels/${novel.id}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <div
                                    className="author-novel-card"
                                    style={{
                                        display: "flex",
                                        gap: "16px",
                                        padding: "16px",
                                        borderRadius: "10px",
                                        border: "1px solid #e5e5e5",
                                        cursor: "pointer",
                                    }}
                                >
                                    {/* 표지 */}
                                    {novel.cover_url && (
                                        <img
                                            src={novel.cover_url}
                                            alt={novel.title}
                                            style={{
                                                width: 60,
                                                height: 80,
                                                objectFit: "cover",
                                                borderRadius: 6,
                                                flexShrink: 0,
                                            }}
                                        />
                                    )}
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{
                                            fontSize: "16px",
                                            fontWeight: 600,
                                            color: "#243A6E",
                                            fontFamily: '"KoPub Batang", serif',
                                        }}>
                                            {novel.title}
                                        </div>
                                        {novel.description && (
                                            <p style={{
                                                fontSize: "13px",
                                                color: "#888",
                                                margin: "4px 0 0",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                            }}>
                                                {novel.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}
