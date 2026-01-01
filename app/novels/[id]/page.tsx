export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Link from "next/link";
import { fetchNovelById, fetchEpisodesByNovelId } from "@/lib/api";
import BookmarkButton from "@/app/components/BookmarkButton";
import StarRating from "@/app/components/StarRating";
import EpisodeListItem from "@/app/components/EpisodeListItem";
import StartReadingButton from "@/app/components/StartReadingButton";
import styles from "./novel-detail.module.css";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  let novel: any;
  try {
    novel = await fetchNovelById(id);
  } catch (error: any) {
    return (
      <main style={{ padding: 24 }}>
        <h2>DEBUG ERROR (FETCH NOVEL)</h2>
        <pre
          style={{
            background: "#111",
            color: "#f55",
            padding: 16,
            whiteSpace: "pre-wrap",
          }}
        >
{JSON.stringify(
  {
    paramsId: id,
    error: String(error),
  },
  null,
  2
)}
        </pre>
      </main>
    );
  }

  if (!novel) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Novel not found</h1>
      </main>
    );
  }

  let episodes: any[] = [];
  try {
    const result = await fetchEpisodesByNovelId(id);
    episodes = Array.isArray(result) ? result : [];
  } catch (error: any) {
    return (
      <main style={{ padding: 24 }}>
        <h2>DEBUG ERROR (FETCH EPISODES)</h2>
        <pre
          style={{
            background: "#111",
            color: "#f55",
            padding: 16,
            whiteSpace: "pre-wrap",
          }}
        >
{JSON.stringify(
  {
    paramsId: id,
    error: String(error),
  },
  null,
  2
)}
        </pre>
      </main>
    );
  }

  // Novel metadata (can be fetched from API if available)
  const author = novel.author || "Unknown Author";
  const tags = novel.tags || ["Fantasy", "Action"];
  const rating = novel.rating || 4.5;
  const status = novel.status || "Ongoing"; // "Ongoing" | "Completed"
  const isFree = novel.is_free !== false;
  const viewCount = novel.view_count || 0;
  const updateDate = novel.updated_at || novel.created_at || new Date().toISOString();

  return (
    <main className={styles.main}>
      <div className={styles.novelInfoGrid}>
        {/* 커버 이미지 */}
        {novel.cover_url && (
          <div className={styles.coverImage}>
            <img
              src={novel.cover_url}
              alt={novel.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        )}

        {/* 소설 정보 */}
        <div className={styles.novelInfo}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  background: status === "Completed" ? "#4CAF50" : "#243A6E",
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                {status}
              </span>
              {isFree && (
                <span
                  style={{
                    background: "#FFD700",
                    color: "#333",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  Free
                </span>
              )}
            </div>
            <h1
              style={{
                fontSize: "32px",
                marginBottom: "12px",
                fontWeight: 600,
                color: "#243A6E",
                fontFamily: '"KoPub Batang", serif',
              }}
            >
              {novel.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
              <StarRating rating={rating} />
              <span style={{ color: "#666", fontSize: "14px" }}>Views {viewCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Author Info */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ color: "#666", fontSize: "14px", marginBottom: "4px" }}>Author</div>
            <div style={{ fontSize: "16px", fontWeight: 500, color: "#243A6E" }}>{author}</div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  style={{
                    background: "#e8ecf5",
                    color: "#243A6E",
                    padding: "6px 12px",
                    borderRadius: "16px",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* 설명 */}
          {novel.description && (
            <div style={{ marginBottom: "24px" }}>
              <p style={{ color: "#555", lineHeight: 1.7, fontSize: "15px" }}>
                {novel.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <BookmarkButton novelId={id} />
            {episodes.length > 0 && (
              <StartReadingButton href={`/novels/${id}/episodes/${episodes[0].ep}`} />
            )}
          </div>

          {/* Update Info */}
          <div style={{ color: "#999", fontSize: "13px" }}>
            Last Updated: {new Date(updateDate).toLocaleDateString("en-US")}
          </div>
        </div>
      </div>

      {/* Episode List */}
      <section className={styles.episodeList}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            marginBottom: "20px",
            color: "#243A6E",
            fontFamily: '"KoPub Batang", serif',
          }}
        >
          Episodes ({episodes.length})
        </h2>

        {episodes.length === 0 && (
          <div style={{ color: "#999", textAlign: "center", padding: "40px" }}>
            No episodes available.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#e5e5e5" }}>
          {episodes.map((ep: any, index: number) => (
            <EpisodeListItem key={ep.ep} episode={ep} novelId={id} />
          ))}
        </div>
      </section>
    </main>
  );
}
