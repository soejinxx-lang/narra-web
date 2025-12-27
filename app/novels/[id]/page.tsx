import { notFound } from "next/navigation";
import Link from "next/link";

async function fetchNovel(id: string) {
  const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

  if (!base) {
    throw new Error("STORAGE BASE URL NOT SET");
  }

  const res = await fetch(`${base}/novels/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

async function fetchEpisodes(id: string) {
  const base =
    process.env.NEXT_PUBLIC_STORAGE_BASE_URL ||
    "https://narra-storage-production.up.railway.app/api";

  const res = await fetch(`${base}/novels/${id}/episodes`, {
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
    notFound();
  }

  const episodes = await fetchEpisodes(params.id);

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
