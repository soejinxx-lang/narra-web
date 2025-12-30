export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Link from "next/link";
import { fetchNovelById, fetchEpisodesByNovelId } from "@/lib/api";

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
              objectFit: "cover",
              borderRadius: 12,
              display: "block",
            }}
          />
        </div>
      )}

      <h1 style={{ fontSize: 28, marginBottom: 8 }}>{novel.title}</h1>

      {novel.description && (
        <p style={{ color: "#666", marginBottom: 24 }}>
          {novel.description}
        </p>
      )}

      <section>
        {episodes.length === 0 && (
          <div style={{ color: "#999" }}>등록된 에피소드가 없습니다.</div>
        )}

        {episodes.map((ep: any) => (
          <Link
            key={ep.ep}
            href={`/novels/${id}/episodes/${ep.ep}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #e5e5e5",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 500 }}>
                EP {ep.ep} {ep.title ?? ""}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
