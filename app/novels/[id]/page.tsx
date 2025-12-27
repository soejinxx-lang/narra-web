export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Link from "next/link";

const STORAGE_BASE = "https://narra-storage-production.up.railway.app/api";

type PageProps = {
  params: {
    id: string;
  };
};

async function fetchNovel(id: string) {
  const res = await fetch(
    `${STORAGE_BASE}/novels/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

async function fetchEpisodes(id: string) {
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
