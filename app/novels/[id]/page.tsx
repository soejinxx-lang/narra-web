export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";

const STORAGE_BASE = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

if (!STORAGE_BASE) {
  throw new Error("STORAGE BASE URL NOT SET");
}

async function fetchNovel(id: string) {
  const res = await fetch(`${STORAGE_BASE}/novels/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();

  // 🔴 핵심: id만 있어도 정상 취급
  if (!data || !data.id) {
    return null;
  }

  return data;
}

async function fetchEpisodes(id: string) {
  const res = await fetch(`${STORAGE_BASE}/novels/${id}/episodes`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.episodes ?? data;
}

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const novel = await fetchNovel(params.id);

  if (!novel) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Novel not found</h1>
      </main>
    );
  }

  const episodes = await fetchEpisodes(params.id);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>
        {novel.title}
      </h1>

      {novel.description && (
        <p style={{ color: "#666", marginBottom: 24 }}>
          {novel.description}
        </p>
      )}

      <section>
        {episodes.map((ep: any) => (
          <Link
            key={ep.ep}
            href={`/novels/${params.id}/episodes/${ep.ep}`}
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
