export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fetchNovelById, fetchEpisodesByNovelId } from "@/lib/api";
import ShareButton from "@/app/components/ShareButton";
import ContinueReadingButton from "@/app/components/ContinueReadingButton";
import EpisodeProgress from "@/app/components/EpisodeProgress";

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

  return (
    <main style={{ padding: 24 }}>
      {novel.cover_url && (
        <div
          style={{
            maxWidth: 320,
            aspectRatio: "2 / 3",
            marginBottom: 16,
          }}
        >
          <img
            src={novel.cover_url}
            alt={novel.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: 12,
              display: "block",
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: 16, flexWrap: "wrap" }}>
        <h1
          style={{
            fontSize: 28,
            marginBottom: 0,
            fontFamily: '"KoPub Batang", serif',
          }}
        >
          {novel.title}
        </h1>
        <ShareButton novelId={id} novelTitle={novel.title} />
      </div>

      {novel.description && (
        <p style={{ color: "#666", marginBottom: 24, whiteSpace: "pre-wrap" }}>
          {novel.description}
        </p>
      )}

      {/* 이어서 읽기 버튼 */}
      <ContinueReadingButton novelId={id} />

      <section>
        {episodes === null && (
          <div style={{ color: "red", padding: "20px", background: "#fff0f0" }}>
            <h3>API Connection Failed</h3>
            <p>Could not fetch episodes. Backend might be down or misconfigured (CORS/Deploy).</p>
          </div>
        )}

        {Array.isArray(episodes) && episodes.length === 0 && (
          <div style={{ color: "#999" }}>No episodes available.</div>
        )}

        {Array.isArray(episodes) && episodes.map((ep: any) => (
          <Link
            key={ep.ep}
            href={`/novels/${id}/episodes/${ep.ep}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                padding: "16px 0",
                borderBottom: "1px solid #e5e5e5",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
                <span>EP {ep.ep}</span>
                {ep.title && <span style={{ color: "#333" }}>{ep.title}</span>}
                <EpisodeProgress novelId={id} episodeEp={String(ep.ep)} />
              </div>

              <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#888" }}>
                {/* 조회수 (Optional) */}
                {ep.views ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    👁 {Number(ep.views).toLocaleString()}
                  </span>
                ) : null}
                {/* 날짜 */}
                {ep.created_at && (
                  <span>
                    {formatDistanceToNow(new Date(ep.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
