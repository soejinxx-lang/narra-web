export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Link from "next/link";

type PageProps = {
  params: {
    id: string;
  };
};

const STORAGE_BASE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

async function fetchNovel(id: string) {
  if (!STORAGE_BASE) {
    return {
      __error: "STORAGE_BASE_UNDEFINED",
    };
  }

  const res = await fetch(
    `${STORAGE_BASE}/novels/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return {
      __error: "FETCH_NOVEL_FAILED",
      status: res.status,
    };
  }

  return res.json();
}

async function fetchEpisodes(id: string) {
  if (!STORAGE_BASE) return [];

  const res = await fetch(
    `${STORAGE_BASE}/novels/${encodeURIComponent(id)}/episodes`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];
  const data = await res.json();
  return data.episodes ?? data;
}

export default async function Page({ params }: PageProps) {
  const id = params.id;
  const novel = await fetchNovel(id);

  /* 🔴 원인까지 같이 찍히는 디버그 */
  if ((novel as any)?.__error) {
    return (
      <main style={{ padding: 24 }}>
        <h2>DEBUG ERROR</h2>
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
    env_STORAGE_BASE: STORAGE_BASE,
    error: novel,
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

  const episodes = await fetchEpisodes(id);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>{novel.title}</h1>

      {novel.description && (
        <p style={{ color: "#666", marginBottom: 24 }}>
          {novel.description}
        </p>
      )}

      <section>
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
                EP {ep.ep} {ep.title}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
